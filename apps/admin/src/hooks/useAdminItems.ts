import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminItems,
  deleteItem,
  hasServerErrorCode,
  toggleItemActive,
  type ItemFilters,
} from "@/services/items";
import { deleteItemImage } from "@/services/storage";

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
    mutationFn: async (id: string): Promise<void> => {
      // RPC 拋錯時（包括結果不明）停在這裡，不刪 R2：商品可能還在，刪檔會讓它破圖
      const removedUrls = await deleteItem(id);

      // 商品已經刪除，檔案刪不掉只會留下孤兒檔，不必讓使用者等待或看到錯誤
      for (const url of removedUrls) {
        deleteItemImage(url).catch((error: unknown) => {
          console.error(`R2 圖片刪除失敗：${url}`, error);
        });
      }
    },
    onSuccess: invalidate,
    onError: (error) => {
      // 結果不明時商品可能已經刪除，重抓列表讓畫面反映 DB 的實際狀態
      if (!hasServerErrorCode(error)) invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleItemActive(id, isActive),
    onSuccess: invalidate,
  });

  return { query, deleteMutation, toggleMutation };
}
