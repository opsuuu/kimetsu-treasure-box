import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminItems,
  deleteItem,
  toggleItemActive,
  updateItemsOrder,
  type ItemFilters,
} from "@/services/items";

interface UseAdminItemsProps {
  filters: ItemFilters;
  page: number;
}

export function useAdminItems({ filters, page }: UseAdminItemsProps) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-items", filters, page],
    queryFn: () => fetchAdminItems(filters, page),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-items"] });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleItemActive(id, isActive),
    onSuccess: invalidate,
  });

  const orderMutation = useMutation({
    mutationFn: updateItemsOrder,
    onSuccess: invalidate,
  });

  return { query, deleteMutation, toggleMutation, orderMutation };
}
