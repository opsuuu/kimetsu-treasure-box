import { supabase } from '@/lib/supabase';
import type { ItemDetail, ItemsPage, PageCursor } from './types';

export const PAGE_SIZE = 20;

type CharacterFilter = 'all' | 'giyu' | 'shinobu' | 'both';

/**
 * 依角色篩選取得 item IDs（用於 infinite query 的前置查詢）
 * 回傳 null 代表不需過濾（all）
 */
export const fetchFilteredItemIds = async (
  characterFilter: CharacterFilter,
): Promise<string[] | null> => {
  if (characterFilter === 'all') return null;

  if (characterFilter === 'both') {
    const [{ data: giyuRows }, { data: shinobuRows }] = await Promise.all([
      supabase
        .from('item_characters')
        .select('item_id, characters!inner(slug)')
        .eq('characters.slug', 'giyu'),
      supabase
        .from('item_characters')
        .select('item_id, characters!inner(slug)')
        .eq('characters.slug', 'shinobu'),
    ]);

    const giyuIds = new Set((giyuRows ?? []).map((r) => r.item_id));
    const shinobuIds = new Set((shinobuRows ?? []).map((r) => r.item_id));
    return [...giyuIds].filter((id) => shinobuIds.has(id));
  }

  const { data, error } = await supabase
    .from('item_characters')
    .select('item_id, characters!inner(slug)')
    .eq('characters.slug', characterFilter);

  if (error) throw error;

  return (data ?? []).map((r) => r.item_id);
};

/**
 * 分頁查詢商品（cursor pagination）
 */
export const fetchItemsPage = async ({
  itemIds = null,
  categoryKey = null,
  cursor = null,
}: {
  itemIds?: string[] | null;
  categoryKey?: string | null;
  cursor?: PageCursor | null;
}): Promise<ItemsPage> => {
  // categories!inner(*) 使用 INNER JOIN，確保 .eq() 能過濾 items 本身；
  // 一般 categories(*) 是 LEFT JOIN，filter 只作用在 embed 資料，不過濾 parent rows
  const categoriesJoin = categoryKey !== null ? 'categories!inner(*)' : 'categories(*)';

  let query = supabase
    .from('items')
    .select(`*, item_characters(characters(*)), ${categoriesJoin}, series(*)`)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true })
    .limit(PAGE_SIZE + 1);

  if (itemIds !== null) {
    query = query.in('id', itemIds.length > 0 ? itemIds : ['']);
  }

  if (categoryKey !== null) {
    query = query.eq('categories.key', categoryKey);
  }

  if (cursor !== null) {
    query = query.or(
      `display_order.gt.${cursor.displayOrder},and(display_order.eq.${cursor.displayOrder},id.gt.${cursor.id})`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  const rows = (data as ItemDetail[]) ?? [];
  const hasNextPage = rows.length > PAGE_SIZE;
  const items = hasNextPage ? rows.slice(0, PAGE_SIZE) : rows;
  const last = items[items.length - 1];

  return {
    items,
    nextCursor: hasNextPage && last ? { displayOrder: last.display_order ?? 0, id: last.id } : null,
  };
};

/**
 * 取得商品列表（含關聯資料）
 */
export const fetchItems = async (): Promise<ItemDetail[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(
      `
      *,
      item_characters(
        characters(*)
       ),
      categories(*),
      series(*)
    `,
    )
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return data ?? [];
};

/**
 * 取得單一商品（用 slug）
 */
export const fetchItemBySlug = async (slug: string): Promise<ItemDetail | null> => {
  const { data, error } = await supabase
    .from('items')
    .select(
      `
        *,
       item_characters(
         characters(*)
        ),
        categories(*),
        series(*)
      `,
    )
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return data;
};

/**
 * 依分類 key 篩選商品
 */
export const fetchItemsByCategory = async (categoryKey: string): Promise<ItemDetail[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(
      `
        *,
       item_characters(
         characters(*)
        ),
        categories!inner(*),
        series(*)
      `,
    )
    .eq('categories.key', categoryKey)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return data ?? [];
};

/**
 * 取得商品所有圖片（不含封面）
 */
export const fetchItemImages = async (itemId: string) => {
  const { data, error } = await supabase
    .from('item_images')
    .select('*')
    .eq('item_id', itemId)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return data ?? [];
};
