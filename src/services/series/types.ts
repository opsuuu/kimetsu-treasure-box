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
