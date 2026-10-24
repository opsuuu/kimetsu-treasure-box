-- 後台新增／編輯商品所需的寫入權限與資料完整性限制。
-- item_characters 與 item_images 原本只有 SELECT policy，RLS 會擋掉所有寫入。

create policy "admin can insert item_characters" on public.item_characters
  for insert to public
  with check (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

create policy "admin can update item_characters" on public.item_characters
  for update to public
  using (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

create policy "admin can delete item_characters" on public.item_characters
  for delete to public
  using (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

create policy "admin can insert item_images" on public.item_images
  for insert to public
  with check (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

create policy "admin can update item_images" on public.item_images
  for update to public
  using (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

create policy "admin can delete item_images" on public.item_images
  for delete to public
  using (exists (
    select 1 from public.admin_profiles where admin_profiles.user_id = auth.uid()
  ));

-- item_id 是 NOT NULL，原本的 ON DELETE SET NULL 永遠違反該限制，
-- 導致任何「有其他圖片的商品」都刪不掉。
alter table public.item_images
  drop constraint item_images_item_id_fkey;

alter table public.item_images
  add constraint item_images_item_id_fkey
  foreign key (item_id) references public.items(id) on delete cascade;

-- 前台商品網址的最後防線；前端送出前的查重擋不住兩人同時送出同一個 slug。
alter table public.items
  add constraint items_slug_key unique (slug);

-- display_order 不由前端決定，否則多人同時新增會拿到同一個值。
-- advisory lock 讓同一交易內的取號序列化，單純的 max + 1 在並行下仍會撞號。
create or replace function public.set_item_display_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.display_order is null then
    perform pg_advisory_xact_lock(hashtext('public.items.display_order'));
    select coalesce(max(display_order), 0) + 1
      into new.display_order
      from public.items;
  end if;
  return new;
end;
$$;

create trigger set_items_display_order
  before insert on public.items
  for each row
  execute function public.set_item_display_order();
