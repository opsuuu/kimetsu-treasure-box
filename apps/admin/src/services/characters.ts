import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Character = Pick<Tables<'characters'>, 'id' | 'name' | 'slug'>;

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
