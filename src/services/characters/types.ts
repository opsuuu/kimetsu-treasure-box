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
