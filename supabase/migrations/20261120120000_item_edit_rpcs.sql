-- 商品編輯與刪除：update_item、delete_item 在一個交易內寫入商品與子表，
-- 並回傳已經沒有被引用、可以從 R2 刪除的圖片網址。

-- ---------------------------------------------------------------------------
-- item_images 的限制
-- ---------------------------------------------------------------------------

-- ALTER CONSTRAINT 不能改 UNIQUE 的 deferrable 屬性，只能 drop 再 add。
-- deferrable 讓 update_item 用單一 UPDATE 對調圖片順序時，唯一性在整條 statement 結束才檢查。
-- initially immediate：其他寫入路徑撞號時，會在出錯的那條 statement 直接報錯（同 items_display_order_key）。
alter table public.item_images drop constraint unique_image_item_order;
alter table public.item_images
  add constraint unique_image_item_order unique (item_id, display_order)
  deferrable initially immediate;

-- update_item 以網址當圖片身分，同一商品有兩列相同網址時那筆商品會永遠存不了。
-- 上傳的檔名含時間戳與亂數，正常流程不會重複；部署前要先查重，有重複時這行會失敗。
alter table public.item_images
  add constraint item_images_item_id_image_url_key unique (item_id, image_url);

-- ---------------------------------------------------------------------------
-- unreferenced_image_urls：找出已經沒有被引用的網址
-- ---------------------------------------------------------------------------

-- 回傳 p_urls 中沒有被任何 items.image_cover_url、item_images.image_url 引用的網址（去除重複）。
-- 正確性依賴 RLS：admin 有 "admin can read all items"，item_images 是 USING (true)，下架商品也查得到，不會誤刪。
-- 這兩條 policy 改了要回頭檢查這裡（"Public read items" 只給 anon，authenticated 但非 admin 讀不到任何 items）。
create or replace function public.unreferenced_image_urls(p_urls text[])
returns text[]
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return coalesce(
    (
      select array_agg(distinct u.url)
        from unnest(p_urls) as u(url)
       where u.url is not null
         and not exists (select 1 from public.items i where i.image_cover_url = u.url)
         and not exists (select 1 from public.item_images ii where ii.image_url = u.url)
    ),
    '{}'
  );
end;
$$;

-- 不能比照 next_item_display_order 完全 revoke：呼叫它的 update_item、delete_item 是 security invoker，
-- 以 authenticated 身分執行，revoke 後兩支 RPC 都會 permission denied。
-- 一般登入使用者直接呼叫，最多只能知道某些網址有沒有被引用，沒有實質風險。
revoke execute on function public.unreferenced_image_urls(text[]) from public, anon;
grant execute on function public.unreferenced_image_urls(text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- update_item：編輯商品
-- ---------------------------------------------------------------------------

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
    'is_active', 'official_url', 'description', 'note', 'material', 'specification', 'image_cover_url'
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
         image_cover_url = p_item->>'image_cover_url'
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

-- ---------------------------------------------------------------------------
-- delete_item：刪除商品
-- ---------------------------------------------------------------------------

-- 商品不存在（刪除 0 筆）時回傳空清單，當作刪除成功。
-- admin 看得到所有商品，刪除 0 筆就代表不存在；非 admin 被 RLS 擋掉，同樣刪除 0 筆。
-- security invoker：權限設定同 update_item。
create or replace function public.delete_item(p_id uuid)
returns text[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  image_urls text[];
  cover_url text;
begin
  -- 先鎖住商品列：update_item 正在新增圖片時會等它 commit，下面才查得到新圖片，不會漏刪 R2 檔。
  perform 1 from public.items where id = p_id for update;

  -- 必須在 DELETE 之前查，cascade 之後就查不到了
  select coalesce(array_agg(image_url), '{}')
    into image_urls
    from public.item_images
   where item_id = p_id;

  delete from public.items
   where id = p_id
  returning image_cover_url into cover_url;

  if not found then
    return '{}';
  end if;

  -- 同一個交易看得到剛刪除的結果，要先刪再查
  return public.unreferenced_image_urls(array_append(image_urls, cover_url));
end;
$$;

revoke execute on function public.delete_item(uuid) from public, anon;
grant execute on function public.delete_item(uuid) to authenticated;
