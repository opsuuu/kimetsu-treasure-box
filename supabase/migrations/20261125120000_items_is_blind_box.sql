-- 商品盲抽標籤：items.is_blind_box，並讓 update_item 寫入這個欄位。

-- 既有商品一律 false；盲抽商品由管理員在正式 admin 手動勾選，不依備註文字自動判斷（例如「非盲抽」會誤判）。
-- 只有盲抽一種需求，所以用單一布林，不做通用的標籤或販售類型。
alter table public.items
  add column is_blind_box boolean not null default false;

-- ---------------------------------------------------------------------------
-- update_item：除了 p_item 白名單與 update 欄位多了 is_blind_box，其餘同 20261120120000_item_edit_rpcs.sql
-- ---------------------------------------------------------------------------

-- 白名單加了 is_blind_box 之後，沒有送這個 key 的前端編輯一律失敗（新增不受影響）。
-- 部署時要先套用這支 migration 再部署 admin，兩者之間 admin 無法編輯。

-- 錯誤碼（前端 services/items.ts 有同一組常數）：
--   KT404 商品不存在（admin 讀得到所有商品；非 admin 讀不到任何 items，也會落在這裡）
--   KT409 已被他人更新
-- 不要用 PT 開頭：PostgREST 會把 PTxyz 解讀成 HTTP 狀態碼；其他自訂 SQLSTATE 會原樣放在回應的 code，HTTP 400。
--
-- p_expected_updated_at 與 items.updated_at 同為 timestamp without time zone，比對不依賴連線的 TimeZone。
-- 前端要原樣送回載入時 PostgREST 回傳的字串，轉成 Date 會掉微秒，比對就會不相等。
--
-- p_item 只寫白名單欄位，前端必須送齊所有 key：少送的 key 會被當成 null 寫入，所以缺 key 直接報錯。
-- 不寫 display_order、updated_at，交給 handle_item_update：改發售日時補號，內容沒變時保留 updated_at。
-- 只改 display_order 不會改變 updated_at，前台排序頁的拖曳不會讓這裡誤判衝突；改了那個 trigger 要回頭檢查。
--
-- p_images 是其他圖片的最終網址，依顯示順序排列。圖片、角色只寫入有差異的部分，
-- 什麼都沒改就送出時 updated_at 不變。子表 touch 在同一個交易內 now() 相同，一次編輯在 audit 只會多 1 筆。
--
-- security invoker：items、子表既有的 RLS 照常生效，不用另外檢查 admin。
create or replace function public.update_item(
  p_id                  uuid,
  p_expected_updated_at timestamp,
  p_item                jsonb,
  p_character_ids       uuid[],
  p_images              text[]
)
returns text[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_updated_at timestamp;
  old_cover_url text;
  old_urls text[];
  new_cover_url text;
begin
  -- 必須在任何查詢之前取鎖。改發售日時 handle_item_update 會經由 next_item_display_order 取這把鎖；
  -- 如果先 for update 鎖住商品列、再由 trigger 取 advisory lock，會和 reorder_items
  -- （先 advisory、再 for update）互等而死鎖。改取鎖順序前要一起看 reorder_items。
  perform pg_advisory_xact_lock(hashtext('public.items.display_order'));

  if p_item is null or jsonb_typeof(p_item) <> 'object' then
    raise exception 'update_item: p_item must be an object';
  end if;
  if not p_item ?& array[
    'name_jp', 'name_tw', 'slug', 'category_id', 'series_id', 'price', 'release_date',
    'is_active', 'official_url', 'description', 'note', 'material', 'specification', 'image_cover_url',
    'is_blind_box'
  ] then
    raise exception 'update_item: p_item is missing keys';
  end if;
  if coalesce(cardinality(p_character_ids), 0) = 0 then
    raise exception 'update_item: p_character_ids is empty';
  end if;
  if array_position(p_character_ids, null) is not null then
    raise exception 'update_item: p_character_ids contains null';
  end if;
  if (select count(distinct id) from unnest(p_character_ids) as t(id)) <> cardinality(p_character_ids) then
    raise exception 'update_item: p_character_ids contains duplicates';
  end if;
  -- null 陣列會讓下面的 <> all(p_images) 變成 null，什麼都不刪；沒有其他圖片時要送空陣列。
  if p_images is null then
    raise exception 'update_item: p_images is null';
  end if;
  if array_position(p_images, null) is not null then
    raise exception 'update_item: p_images contains null';
  end if;
  if (select count(distinct url) from unnest(p_images) as t(url)) <> cardinality(p_images) then
    raise exception 'update_item: p_images contains duplicates';
  end if;

  -- 比對發生在這個交易任何寫入之前，之後先改子表或先改 items 都不影響結果。
  -- 別的交易改圖片、角色時，touch_item_updated_at 要 UPDATE 同一列，會和這裡的 for update 排隊；
  -- 對方先 commit 時，這裡讀到的是新版本 → KT409。
  select updated_at, image_cover_url
    into current_updated_at, old_cover_url
    from public.items
   where id = p_id
     for update;

  if not found then
    raise exception 'update_item: item % not found', p_id using errcode = 'KT404';
  end if;
  if current_updated_at is distinct from p_expected_updated_at then
    raise exception 'update_item: item % has been updated', p_id using errcode = 'KT409';
  end if;

  select coalesce(array_agg(image_url), '{}')
    into old_urls
    from public.item_images
   where item_id = p_id;
  old_urls := array_append(old_urls, old_cover_url);

  update public.items
     set name_jp         = (p_item->>'name_jp')::varchar,
         name_tw         = (p_item->>'name_tw')::varchar,
         slug            = (p_item->>'slug')::varchar,
         category_id     = (p_item->>'category_id')::uuid,
         series_id       = (p_item->>'series_id')::uuid,
         price           = (p_item->>'price')::bigint,
         release_date    = (p_item->>'release_date')::date,
         is_active       = (p_item->>'is_active')::boolean,
         official_url    = p_item->>'official_url',
         description     = p_item->>'description',
         note            = p_item->>'note',
         material        = p_item->>'material',
         specification   = p_item->>'specification',
         image_cover_url = p_item->>'image_cover_url',
         is_blind_box    = (p_item->>'is_blind_box')::boolean
   where id = p_id
  returning image_cover_url into new_cover_url;

  -- 角色：依賴 item_characters_item_id_character_id_key 做 on conflict
  delete from public.item_characters
   where item_id = p_id
     and character_id <> all(p_character_ids);

  insert into public.item_characters (item_id, character_id)
  select p_id, t.character_id
    from unnest(p_character_ids) as t(character_id)
  on conflict (item_id, character_id) do nothing;

  -- 圖片：先刪、再移動既有的、最後插入新的。最終位置是 1..n 不會重複，
  -- 對調位置由 deferrable 的 unique_image_item_order 處理。
  delete from public.item_images
   where item_id = p_id
     and image_url <> all(p_images);

  -- 只更新位置有變的列，避免多出不必要的 touch
  update public.item_images ii
     set display_order = target.pos
    from unnest(p_images) with ordinality as target(url, pos)
   where ii.item_id = p_id
     and ii.image_url = target.url
     and ii.display_order is distinct from target.pos;

  insert into public.item_images (item_id, image_url, display_order)
  select p_id, target.url, target.pos
    from unnest(p_images) with ordinality as target(url, pos)
   where not exists (
     select 1 from public.item_images ii
      where ii.item_id = p_id and ii.image_url = target.url
   );

  -- 新封面也出現在 p_images 時不能刪；被其他商品共用的網址由 unreferenced_image_urls 排除。
  return public.unreferenced_image_urls(
    array(
      select u.url
        from unnest(old_urls) as u(url)
       where u.url is distinct from new_cover_url
         and u.url <> all(p_images)
    )
  );
end;
$$;

revoke execute on function public.update_item(uuid, timestamp, jsonb, uuid[], text[]) from public, anon;
grant execute on function public.update_item(uuid, timestamp, jsonb, uuid[], text[]) to authenticated;
