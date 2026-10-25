import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  fetchItemsByReleaseDate,
  fetchReleaseDateGroups,
  reorderItems,
  type ReleaseDateItem,
} from "@/services/items";

interface LocalOrder {
  base: ReleaseDateItem[];
  items: ReleaseDateItem[];
}

/** 前台排序頁：一次處理一個發售日的整組商品 */
export function useReleaseDateOrder() {
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor));
  // undefined 代表還沒選，預設第一組；null 是「未填發售日」那一組
  const [selected, setSelected] = useState<string | null | undefined>(undefined);
  const [localOrder, setLocalOrder] = useState<LocalOrder | null>(null);
  const [isStale, setIsStale] = useState(false);

  const groupsQuery = useQuery({
    queryKey: ["release-date-groups"],
    queryFn: fetchReleaseDateGroups,
  });
  const groups = groupsQuery.data ?? [];

  // 選中的那組可能在重新載入後消失（例如整組都改了發售日），這時退回第一組
  const releaseDate =
    selected !== undefined && groups.some((g) => g.releaseDate === selected)
      ? selected
      : groups[0]?.releaseDate;

  const itemsQuery = useQuery({
    queryKey: ["release-date-items", releaseDate],
    queryFn: () => fetchItemsByReleaseDate(releaseDate ?? null),
    enabled: releaseDate !== undefined,
  });
  const serverItems = itemsQuery.data;

  // 拖曳結果只對當下那份伺服器資料有效，重新載入後改回伺服器順序
  const items =
    localOrder && localOrder.base === serverItems
      ? localOrder.items
      : (serverItems ?? []);

  const reloadGroup = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["release-date-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["release-date-items"] }),
    ]);

  const reorderMutation = useMutation({
    mutationFn: reorderItems,
    onSuccess: () => setIsStale(false),
    // 筆數不符、發售日被改、取鎖時 deadlock 都可能失敗，一律當成資料已變動，重新載入再拖一次
    onError: () => {
      setIsStale(true);
      setLocalOrder(null);
    },
    onSettled: reloadGroup,
  });

  function selectReleaseDate(date: string | null) {
    setSelected(date);
    setIsStale(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!serverItems || reorderMutation.isPending) return;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setLocalOrder({ base: serverItems, items: reordered });
    reorderMutation.mutate(reordered.map((i) => i.id));
  }

  return {
    groups,
    isGroupsLoading: groupsQuery.isLoading,
    releaseDate,
    selectReleaseDate,
    items,
    isItemsLoading: itemsQuery.isLoading,
    sensors,
    handleDragEnd,
    isSaving: reorderMutation.isPending,
    isStale,
  };
}
