import { supabase } from '@/lib/supabase';
import type { Series } from './types';

// 取得所有系列
export const fetchSeries = async (): Promise<Series[]> => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('is_active', true)
    .order('started_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
};

export const fetchSeriesBySlug = async (slug: string): Promise<Series | null> => {
  const { data, error } = await supabase.from('series').select('*').eq('slug', slug).single();

  if (error) throw error;

  return data;
};
