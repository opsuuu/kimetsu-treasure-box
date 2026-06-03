import { supabase } from '@/lib/supabase';
import type { Tables } from '@kimetsu/supabase';

export type Series = Pick<Tables<'series'>, 'id' | 'name_tw' | 'name_jp'>;

export async function fetchSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('id, name_tw, name_jp')
    .eq('is_active', true)
    .order('name_jp', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
