import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Category = Tables<'categories'>;

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('display_order');

  if (error) throw error;

  return data ?? [];
};
