import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export const PAGE_SIZE = 20;

export type AdminItem = Tables<'items'> & {
  categories: Pick<Tables<'categories'>, 'id' | 'name_tw' | 'key'> | null;
  series: Pick<Tables<'series'>, 'id' | 'name_tw' | 'name_jp'> | null;
  item_characters: {
    characters: Pick<Tables<'characters'>, 'id' | 'name' | 'slug'> | null;
  }[];
};

export interface AdminItemsResult {
  items: AdminItem[];
  total: number;
}

export interface ItemFilters {
  name: string;
  categoryIds: string[];
  seriesIds: string[];
  characterSlugs: string[];
  releaseDateFrom: string;
  releaseDateTo: string;
  isActive: 'all' | 'active' | 'inactive';
  priceFrom: string;
  priceTo: string;
}

export const defaultFilters: ItemFilters = {
  name: '',
  categoryIds: [],
  seriesIds: [],
  characterSlugs: [],
  releaseDateFrom: '',
  releaseDateTo: '',
  isActive: 'all',
  priceFrom: '',
  priceTo: '',
};

export async function fetchAdminItems(
  filters: ItemFilters,
  page = 1,
): Promise<AdminItemsResult> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const categoriesJoin =
    filters.categoryIds.length > 0
      ? 'categories!inner(id, name_tw, key)'
      : 'categories(id, name_tw, key)';

  const seriesJoin =
    filters.seriesIds.length > 0
      ? 'series!inner(id, name_tw, name_jp)'
      : 'series(id, name_tw, name_jp)';

  const characterJoin =
    filters.characterSlugs.length > 0
      ? 'item_characters!inner(characters!inner(id, name, slug))'
      : 'item_characters(characters(id, name, slug))';

  let query = supabase
    .from('items')
    .select(`*, ${categoriesJoin}, ${seriesJoin}, ${characterJoin}`, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, to);

  if (filters.name.trim()) {
    query = query.or(
      `name_jp.ilike.%${filters.name}%,name_tw.ilike.%${filters.name}%`,
    );
  }
  if (filters.categoryIds.length > 0) {
    query = query.in('categories.id', filters.categoryIds);
  }
  if (filters.seriesIds.length > 0) {
    query = query.in('series.id', filters.seriesIds);
  }
  if (filters.characterSlugs.length > 0) {
    query = query.in('item_characters.characters.slug', filters.characterSlugs);
  }
  if (filters.isActive !== 'all') {
    query = query.eq('is_active', filters.isActive === 'active');
  }
  if (filters.priceFrom) {
    query = query.gte('price', Number(filters.priceFrom));
  }
  if (filters.priceTo) {
    query = query.lte('price', Number(filters.priceTo));
  }
  if (filters.releaseDateFrom) {
    query = query.gte('release_date', filters.releaseDateFrom);
  }
  if (filters.releaseDateTo) {
    query = query.lte('release_date', filters.releaseDateTo);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    items: (data ?? []) as unknown as AdminItem[],
    total: count ?? 0,
  };
}

export interface ItemFormValues {
  name_jp: string;
  name_tw: string;
  slug: string;
  category_id: string;
  series_id: string;
  character_ids: string[];
  price: string;
  release_date: string;
  is_active: boolean;
  is_blind_box: boolean;
  official_url: string;
  description: string;
  note: string;
  material: string;
  specification: string;
}

export const SLUG_TAKEN_MESSAGE =
  '此網址名稱已被使用。若是自動產生的網址，代表已有同角色＋類別＋系列的商品，請填寫商品修飾或款式。';

/** Postgres unique_violation，用來判斷 slug 撞上 DB 的 UNIQUE 限制 */
export function isSlugConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505'
  );
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('items')
    .select('id')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

/** update_item 的 p_item 白名單欄位，新增與編輯都用同一份正規化，前端一律送齊所有 key */
type ItemRow = Pick<
  Tables<'items'>,
  | 'name_jp'
  | 'name_tw'
  | 'slug'
  | 'category_id'
  | 'series_id'
  | 'price'
  | 'release_date'
  | 'is_active'
  | 'is_blind_box'
  | 'official_url'
  | 'description'
  | 'note'
  | 'material'
  | 'specification'
  | 'image_cover_url'
>;

/**
 * 空字串一律轉 null：DB 存的是 null，編輯時送 '' 會被 trigger 判定內容有變而改掉 updated_at；
 * update_item 逐欄 ::uuid、::date 轉型，'' 也會得到 22P02。價格由 schema 保證是純數字的安全整數，Number() 後才能原樣通過 ::bigint。
 */
function toItemRow(values: ItemFormValues, imageCoverUrl: string): ItemRow {
  return {
    name_jp: values.name_jp,
    name_tw: values.name_tw || null,
    slug: values.slug,
    category_id: values.category_id || null,
    series_id: values.series_id || null,
    price: values.price ? Number(values.price) : null,
    release_date: values.release_date || null,
    is_active: values.is_active,
    is_blind_box: values.is_blind_box,
    official_url: values.official_url || null,
    description: values.description || null,
    note: values.note || null,
    material: values.material || null,
    specification: values.specification || null,
    image_cover_url: imageCoverUrl || null,
  };
}

export async function createItem(
  values: ItemFormValues,
  imageCoverUrl: string,
): Promise<string> {
  const { data: item, error } = await supabase
    .from('items')
    .insert(toItemRow(values, imageCoverUrl))
    .select('id')
    .single();

  if (error) throw error;

  const { character_ids } = values;
  if (character_ids.length > 0) {
    const { error: charError } = await supabase
      .from('item_characters')
      .insert(character_ids.map((character_id) => ({ item_id: item.id, character_id })));
    if (charError) {
      // 角色是必填，關聯建不起來就把商品收回，否則會留下一筆查不到角色的孤兒商品
      await supabase.from('items').delete().eq('id', item.id);
      throw charError;
    }
  }

  return item.id;
}

export async function createItemImages(
  itemId: string,
  imageUrls: string[],
): Promise<void> {
  if (imageUrls.length === 0) return;
  const { error } = await supabase.from('item_images').insert(
    imageUrls.map((image_url, i) => ({
      item_id: itemId,
      image_url,
      display_order: i + 1,
    })),
  );
  if (error) throw error;
}

// 對照 migration 20261125120000_items_is_blind_box.sql 的 update_item（最新定義），兩邊要一起改
/** update_item：載入後已被其他人更新（p_expected_updated_at 不符） */
export const ITEM_CONFLICT = 'KT409';
/** update_item：商品不存在（已被刪除） */
export const ITEM_NOT_FOUND = 'KT404';

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return undefined;
}

export function hasErrorCode(error: unknown, code: string): boolean {
  return getErrorCode(error) === code;
}

/**
 * 伺服器明確回錯（交易確定沒有 commit）才是 true。
 * supabase-js 在網路失敗時 code 是 ''，閘道回的 502／504 也不會帶 code，這些情況伺服器可能已經 commit。
 */
export function hasServerErrorCode(error: unknown): boolean {
  return Boolean(getErrorCode(error));
}

export type ItemForEdit = NonNullable<Awaited<ReturnType<typeof fetchItemForEdit>>>;

/** 查不到時回傳 null；updated_at 保留 PostgREST 的原始字串（含微秒），送出時原樣交給 update_item 比對 */
export async function fetchItemForEdit(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select(
      'id, name_jp, name_tw, slug, category_id, series_id, price, release_date, is_active, is_blind_box, official_url, description, note, material, specification, image_cover_url, updated_at, item_images(image_url, display_order), item_characters(character_id)',
    )
    .eq('id', id)
    .order('display_order', { referencedTable: 'item_images', ascending: true })
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface UpdateItemParams {
  id: string;
  expectedUpdatedAt: string;
  values: ItemFormValues;
  coverUrl: string;
  /** 其他圖片的最終網址，依顯示順序排列 */
  imageUrls: string[];
}

/** 回傳已經沒有被引用、可以從 R2 刪除的舊網址 */
export async function updateItem({
  id,
  expectedUpdatedAt,
  values,
  coverUrl,
  imageUrls,
}: UpdateItemParams): Promise<string[]> {
  const { data, error } = await supabase.rpc('update_item', {
    p_id: id,
    p_expected_updated_at: expectedUpdatedAt,
    p_item: toItemRow(values, coverUrl),
    p_character_ids: values.character_ids,
    p_images: imageUrls,
  });
  if (error) throw error;
  return data;
}

export type ReleaseDateItem = Pick<
  Tables<'items'>,
  'id' | 'name_jp' | 'name_tw' | 'image_cover_url' | 'is_active' | 'price'
> & {
  categories: Pick<Tables<'categories'>, 'name_tw'> | null;
  series: Pick<Tables<'series'>, 'name_tw' | 'name_jp'> | null;
  item_characters: {
    characters: Pick<Tables<'characters'>, 'name' | 'slug'> | null;
  }[];
};

export interface ReleaseDateGroup {
  /** null 代表未填發售日 */
  releaseDate: string | null;
  /** 依前台的同日順序排列，包含下架商品 */
  items: ReleaseDateItem[];
}

/**
 * 全部商品依前台順序分組：發售日由新到舊、未填發售日排在最後，同一天依 display_order。
 * 一次抓回全部商品，切換日期和搜尋都在前端處理；商品多到拖慢載入時，要改成分頁或伺服器端搜尋。
 */
export async function fetchReleaseDateGroups(): Promise<ReleaseDateGroup[]> {
  const { data, error } = await supabase
    .from('items')
    .select(
      'id, name_jp, name_tw, image_cover_url, is_active, price, release_date, categories(name_tw), series(name_tw, name_jp), item_characters(characters(name, slug))',
    )
    .order('release_date', { ascending: false, nullsFirst: false })
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;

  const groups: ReleaseDateGroup[] = [];
  for (const { release_date, ...item } of data ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.releaseDate === release_date) {
      last.items.push(item);
    } else {
      groups.push({ releaseDate: release_date, items: [item] });
    }
  }
  return groups;
}

/** ids 必須是同一個發售日的整組商品，DB 端會拒絕不完整或過期的資料 */
export async function reorderItems(ids: string[]): Promise<void> {
  const { error } = await supabase.rpc('reorder_items', { p_ids: ids });
  if (error) throw error;
}

/** 回傳已經沒有被引用、可以從 R2 刪除的網址；商品不存在時回傳空清單 */
export async function deleteItem(id: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('delete_item', { p_id: id });
  if (error) throw error;
  return data;
}

export async function toggleItemActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw error;
}
