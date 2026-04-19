import { useQuery } from '@tanstack/react-query';
import { fetchItemImages } from '@/services/items';

export const useItemImages = (itemId?: string) => {
  return useQuery({
    queryKey: ['item-images', itemId],
    queryFn: () => fetchItemImages(itemId!),
    enabled: !!itemId,
  });
};
