import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Series = Pick<
  Tables<'series'>,
  'id' | 'name_tw' | 'name_jp' | 'slug' | 'is_active'
>;

/** 包含停用中的系列：編輯頁要能顯示商品原本引用的停用系列，其他地方自行過濾 */
export async function fetchSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('id, name_tw, name_jp, slug, is_active')
    .order('name_jp', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
