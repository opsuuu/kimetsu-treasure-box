import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Character = Pick<
  Tables<'characters'>,
  'id' | 'name' | 'slug' | 'is_active'
>;

/** 包含停用中的角色：編輯頁要能顯示商品原本引用的停用角色，其他地方自行過濾 */
export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, slug, is_active')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
