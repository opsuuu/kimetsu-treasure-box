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
  displayOrderFrom: string;
  displayOrderTo: string;
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
  displayOrderFrom: '',
  displayOrderTo: '',
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
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
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
  if (filters.displayOrderFrom) {
    query = query.gte('display_order', Number(filters.displayOrderFrom));
  }
  if (filters.displayOrderTo) {
    query = query.lte('display_order', Number(filters.displayOrderTo));
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
  display_order: string;
  is_active: boolean;
  official_url: string;
  description: string;
  note: string;
  material: string;
  specification: string;
}

export const SLUG_TAKEN_MESSAGE = '此網址名稱已被使用，請修改後再試。';

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

export async function createItem(
  values: ItemFormValues,
  imageCoverUrl: string,
): Promise<string> {
  const { character_ids, ...rest } = values;

  const { data: item, error } = await supabase
    .from('items')
    .insert({
      name_jp: rest.name_jp,
      name_tw: rest.name_tw || null,
      slug: rest.slug,
      category_id: rest.category_id || null,
      series_id: rest.series_id || null,
      price: rest.price ? Number(rest.price) : null,
      release_date: rest.release_date || null,
      // 留空時整個欄位不送出，交由 DB 端補上排序值，避免多人同時新增撞號
      ...(rest.display_order ? { display_order: Number(rest.display_order) } : {}),
      is_active: rest.is_active,
      official_url: rest.official_url || null,
      description: rest.description || null,
      note: rest.note || null,
      material: rest.material || null,
      specification: rest.specification || null,
      image_cover_url: imageCoverUrl || null,
    })
    .select('id')
    .single();

  if (error) throw error;

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

export async function updateItemsOrder(
  updates: { id: string; display_order: number }[],
): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, display_order }) =>
      supabase.from('items').update({ display_order }).eq('id', id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleItemActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw error;
}
