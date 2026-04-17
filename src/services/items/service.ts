import { supabase } from '@/lib/supabase';
import type { ItemDetail } from './types';

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
