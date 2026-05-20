import type { Tables } from '@kimetsu/supabase';
import type { Character } from '@/services/characters';
import type { Category } from '@/services/categories';
import type { Series } from '@/services/series';

export type Item = Tables<'items'>;

export type ItemDetail = Item & {
  item_characters: { characters: Character | null }[];
  categories: Category | null;
  series: Series | null;
};

export type PageCursor = {
  displayOrder: number;
  id: string;
};

export type ItemsPage = {
  items: ItemDetail[];
  nextCursor: PageCursor | null;
};
