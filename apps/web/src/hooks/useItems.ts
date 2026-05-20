import { useQuery } from '@tanstack/react-query';
import { fetchItems, fetchItemsByCategory, fetchItemBySlug } from '@/services/items';

export const useItems = () =>
  useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });

export const useItemsByCategory = (categoryKey: string) =>
  useQuery({
    queryKey: ['items', 'category', categoryKey],
    queryFn: () => fetchItemsByCategory(categoryKey),
  });

export const useItemBySlug = (slug: string) =>
  useQuery({
    queryKey: ['items', slug],
    queryFn: () => fetchItemBySlug(slug),
    enabled: !!slug,
  });
