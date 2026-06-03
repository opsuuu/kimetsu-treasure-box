import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Category = Pick<Tables<'categories'>, 'id' | 'name_tw' | 'key'>;

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_tw, key')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
