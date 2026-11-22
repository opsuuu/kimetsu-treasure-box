-- 商品排序：前台依發售日排序、同一天發售的依 display_order；後台列表依 updated_at。
-- display_order 只決定同一天發售的先後，數字本身沒有意義。

-- ---------------------------------------------------------------------------
-- display_order：清掉 NULL 與重複值後加上 NOT NULL、UNIQUE
-- ---------------------------------------------------------------------------

-- 依原本前台的順序（display_order, id）重新編號，前台看起來不會變。
-- 這裡會寫入 audit_logs，不關 audit trigger，留下資料被改過的紀錄。
update public.items i
   set display_order = renumbered.rn
  from (
    select id, row_number() over (order by display_order nulls last, id) as rn
      from public.items
  ) renumbered
 where i.id = renumbered.id
   and i.display_order is distinct from renumbered.rn;

alter table public.items
  alter column display_order set not null;

-- deferrable 讓唯一性檢查延到整條 statement 結束，reorder_items 用單一 UPDATE 對調時才不會中途撞號。
-- initially immediate：其他寫入路徑撞號時，會在出錯的那條 statement 直接報錯。
alter table public.items
  add constraint items_display_order_key unique (display_order) deferrable initially immediate;

-- ---------------------------------------------------------------------------
-- updated_at：補值後加上 NOT NULL
-- ---------------------------------------------------------------------------

-- NULL 在 updated_at DESC 會排在最前面，且 handle_item_update 的 `>` 判斷前提是它不會是 NULL。
update public.items
   set updated_at = coalesce(created_at, now())
 where updated_at is null;

alter table public.items
  alter column updated_at set not null;

-- ---------------------------------------------------------------------------
-- 取號
-- ---------------------------------------------------------------------------

-- 新增、改發售日補號、reorder_items 共用同一把 advisory lock，三條路徑依序執行。
-- 這個函式回傳整數，PostgREST 會把它開放在 /rpc/ 底下，不 revoke 的話 anon 可以直接呼叫來取鎖、看最大值。
-- 只給 security definer 的 trigger function 呼叫。
create or replace function public.next_item_display_order()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  next_order integer;
begin
  perform pg_advisory_xact_lock(hashtext('public.items.display_order'));
  select coalesce(max(display_order), 0) + 1
    into next_order
    from public.items;
  return next_order;
end;
$$;

-- Supabase 的 default privileges 會自動 grant 給 anon、authenticated，PUBLIC 則是 Postgres 預設，三個都要 revoke。
revoke execute on function public.next_item_display_order() from public, anon, authenticated;

create or replace function public.set_item_display_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.display_order is null then
    new.display_order := public.next_item_display_order();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- items 的 BEFORE UPDATE：改發售日補號、決定 updated_at
-- ---------------------------------------------------------------------------

-- 補號和 updated_at 寫在同一個 function，先補號、再決定 updated_at，不依賴 trigger 名稱的字母順序。
create or replace function public.handle_item_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 改發售日時排到新組最後；display_order 有被明確改成別的值時照它寫的。
  -- 批次補發售日的 SQL 要自己指定 display_order，否則同一天的先後會變成 DB 掃描的順序。
  if new.release_date is distinct from old.release_date
     and new.display_order = old.display_order then
    new.display_order := public.next_item_display_order();
  end if;

  -- 呼叫的人指定了比較新的值（例如子表的 touch），照它寫的。
  -- 用 `>` 而不是 is distinct from：帶著載入時的舊 updated_at 送出時，不能讓時間倒退。
  if new.updated_at > old.updated_at then
    return new;
  end if;

  -- 只改 display_order 不算更新，否則拖曳一次整組商品都會跳到「最近更新」最前面。
  -- 內容沒變時保留舊值：同一交易內重複 touch 時，log_audit 才會略過這些沒變動的 UPDATE。
  if (to_jsonb(new) - 'display_order' - 'updated_at')
     is distinct from (to_jsonb(old) - 'display_order' - 'updated_at') then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;

  return new;
end;
$$;

create trigger handle_items_update
  before update on public.items
  for each row
  execute function public.handle_item_update();

-- ---------------------------------------------------------------------------
-- 圖片、角色的變動也算商品更新
-- ---------------------------------------------------------------------------

-- 同一條 statement 動到多列時，同一筆商品會被 touch 多次，但同一交易的 now() 相同，
-- 第 2 次之後 handle_item_update 會保留同一個值、log_audit 也會略過，audit 只會多 1 筆。
-- 這依賴上述兩個行為同時成立，改了其中一個要回頭檢查這裡。
-- 刪除商品連鎖刪除子表時，items 那一列已經不在，只會更新 0 列。
create or replace function public.touch_item_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    update public.items set updated_at = now() where id = new.item_id;
  end if;
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.item_id is distinct from old.item_id) then
    update public.items set updated_at = now() where id = old.item_id;
  end if;
  return null;
end;
$$;

create trigger touch_item_on_image_change
  after insert or update or delete on public.item_images
  for each row
  execute function public.touch_item_updated_at();

create trigger touch_item_on_character_change
  after insert or update or delete on public.item_characters
  for each row
  execute function public.touch_item_updated_at();

-- ---------------------------------------------------------------------------
-- reorder_items：調整同一天發售的商品順序
-- ---------------------------------------------------------------------------

-- p_ids 是整組商品的新順序。只在這組商品目前的 display_order 之間重新分配，不用前端送來的值。
-- security invoker：items 既有的 UPDATE RLS 照常生效，不用另外檢查 admin。
create or replace function public.reorder_items(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  found_count integer;
  date_count integer;
  null_count integer;
  group_date date;
  group_count integer;
begin
  -- 必須在任何查詢之前取鎖。for update 只鎖得到已存在的列，擋不住剛好有人新增同一天的商品。
  -- read committed 下，取得鎖之後的查詢會重新取 snapshot，看得到剛 commit 的新商品。
  perform pg_advisory_xact_lock(hashtext('public.items.display_order'));

  if coalesce(cardinality(p_ids), 0) = 0 then
    raise exception 'reorder_items: p_ids is empty';
  end if;
  if array_position(p_ids, null) is not null then
    raise exception 'reorder_items: p_ids contains null';
  end if;
  if (select count(distinct id) from unnest(p_ids) as t(id)) <> cardinality(p_ids) then
    raise exception 'reorder_items: p_ids contains duplicates';
  end if;

  perform 1 from public.items where id = any(p_ids) for update;

  -- 被 RLS 擋掉的列會被靜默略過，筆數不符也能擋住沒權限的呼叫。
  -- count(distinct) 會忽略 NULL，所以另外確認「有 NULL 就必須全部是 NULL」。
  select count(*),
         count(distinct release_date),
         count(*) filter (where release_date is null),
         min(release_date)
    into found_count, date_count, null_count, group_date
    from public.items
   where id = any(p_ids);

  if found_count <> cardinality(p_ids) then
    raise exception 'reorder_items: some items do not exist';
  end if;
  if date_count > 1 or (null_count > 0 and null_count <> found_count) then
    raise exception 'reorder_items: items have different release dates';
  end if;

  -- 畫面資料過期（有人剛新增、改了發售日）時，筆數會跟 DB 對不上。
  select count(*)
    into group_count
    from public.items
   where release_date is not distinct from group_date;

  if group_count <> found_count then
    raise exception 'reorder_items: p_ids must contain the whole release date group';
  end if;

  update public.items i
     set display_order = slots.display_order
    from unnest(p_ids) with ordinality as target(id, pos)
    join (
      select display_order, row_number() over (order by display_order) as pos
        from public.items
       where id = any(p_ids)
    ) slots on slots.pos = target.pos
   where i.id = target.id;
end;
$$;

-- Postgres 預設把函式的 execute 權限給 PUBLIC，只 revoke anon 不夠。
revoke execute on function public.reorder_items(uuid[]) from public, anon;
grant execute on function public.reorder_items(uuid[]) to authenticated;
