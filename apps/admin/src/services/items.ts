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

export async function updateItemsOrder(
  updates: { id: string; display_order: number }[],
): Promise<void> {
  await Promise.all(
    updates.map(({ id, display_order }) =>
      supabase.from('items').update({ display_order }).eq('id', id),
    ),
  );
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
