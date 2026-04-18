import type { Character } from '@/services/characters';
import type { Category } from '@/services/categories';
import type { Series } from '@/services/series';

export type Item = {
  id: string;
  name_jp: string;
  name_tw: string | null;
  series_id: string;
  category_id: string | null;
  image_cover_url: string | null;
  price: number | null;
  release_date: string | null;
  description: string | null;
  slug: string;
  display_order: number | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  official_url: string | null;
  specification: string | null;
  material: string | null;
};

export type ItemDetail = Item & {
  item_characters: {
    item_id: string;
    character_id: string;
    characters: Character;
  }[];
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
