import { supabase } from '@/lib/supabase';
import type { Character } from './types';

// 取得全部角色
export const fetchCharacters = async (): Promise<Character[]> => {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_active', true)
    .order('created_at');

  if (error) throw error;

  return data ?? [];
};

export const fetchCharacterBySlug = async (slug: string): Promise<Character | null> => {
  const { data, error } = await supabase.from('characters').select('*').eq('slug', slug).single();

  if (error) throw error;

  return data;
};
