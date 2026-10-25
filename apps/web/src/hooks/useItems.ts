import { useQuery } from '@tanstack/react-query';
import { fetchItemBySlug } from '@/services/items';

export const useItemBySlug = (slug: string) =>
  useQuery({
    queryKey: ['items', slug],
    queryFn: () => fetchItemBySlug(slug),
    enabled: !!slug,
  });
