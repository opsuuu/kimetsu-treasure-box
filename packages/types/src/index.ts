export type Category = {
  id: string;
  key: string;
  name_tw: string;
  name_en: string | null;
  icon: string | null;
  display_order: number | null;
  created_at: string;
};

export type Series = {
  id: string;
  name_jp: string;
  name_tw: string | null;
  slug: string;
  description: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  is_active: boolean;
};

export type Character = {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  description: string | null;
  image_url: string | null;
  theme: string | null;
  created_at: string;
  is_active: boolean;
  display_order: number | null;
  sub_name: string | null;
};

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
  note: string | null;
};

export type ItemImage = {
  id: string;
  item_id: string;
  url: string;
  display_order: number;
  created_at: string;
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

export type AdminRole = 'super_admin' | 'admin';

export type AdminProfile = {
  user_id: string;
  role: AdminRole;
  display_name: string;
  created_at: string;
};

export type AuditAction = 'create' | 'update' | 'delete';

export type AuditLog = {
  id: string;
  admin_id: string;
  action: AuditAction;
  table_name: string;
  record_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};
