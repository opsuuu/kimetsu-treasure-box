import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
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
  // 移動超過 5px 才算拖曳，點卡片上的順位號碼才不會被當成拖曳
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  // undefined 代表還沒選，預設第一組；null 是「未填發售日」那一組
  const [selected, setSelected] = useState<string | null | undefined>(undefined);
  const [localOrder, setLocalOrder] = useState<LocalOrder | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [dragging, setDragging] = useState<{
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier | null;
  } | null>(null);

  const groupsQuery = useQuery({
    queryKey: ["release-date-groups"],
    queryFn: fetchReleaseDateGroups,
  });
  const groups = groupsQuery.data ?? [];

  // 選中的那組可能在重新載入後消失（例如整組都改了發售日），這時退回第一組
  const group = groups.find((g) => g.releaseDate === selected) ?? groups[0];
  const serverItems = group?.items;

  // 拖曳結果只對當下那份伺服器資料有效，重新載入後改回伺服器順序
  const items =
    localOrder && localOrder.base === serverItems
      ? localOrder.items
      : (serverItems ?? []);

  // 拖曳中依游標所在位置預覽放下後的順序，順位號碼在放開前就會跟著變
  const previewItems = (() => {
    if (!dragging?.overId) return items;
    const from = items.findIndex((i) => i.id === dragging.activeId);
    const to = items.findIndex((i) => i.id === dragging.overId);
    return from < 0 || to < 0 ? items : arrayMove(items, from, to);
  })();

  const reorderMutation = useMutation({
    mutationFn: reorderItems,
    onSuccess: () => setIsStale(false),
    // 筆數不符、發售日被改、取鎖時 deadlock 都可能失敗，一律當成資料已變動，重新載入再拖一次
    onError: () => {
      setIsStale(true);
      setLocalOrder(null);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["release-date-groups"] }),
  });

  function selectReleaseDate(date: string | null) {
    setSelected(date);
    setIsStale(false);
  }

  function save(reordered: ReleaseDateItem[]) {
    if (!serverItems) return;
    setLocalOrder({ base: serverItems, items: reordered });
    reorderMutation.mutate(reordered.map((i) => i.id));
  }

  function handleDragStart(event: DragStartEvent) {
    setDragging({ activeId: event.active.id, overId: null });
  }

  function handleDragOver(event: DragOverEvent) {
    setDragging({ activeId: event.active.id, overId: event.over?.id ?? null });
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(null);
    const { active, over } = event;
    if (reorderMutation.isPending || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    save(arrayMove(items, oldIndex, newIndex));
  }

  function handleDragCancel() {
    setDragging(null);
  }

  /** position 從 1 開始，超出範圍時夾在第 1 位到最後一位之間 */
  function moveTo(id: string, position: number) {
    if (reorderMutation.isPending) return;
    const from = items.findIndex((i) => i.id === id);
    const to = Math.min(Math.max(position, 1), items.length) - 1;
    if (from < 0 || from === to) return;
    save(arrayMove(items, from, to));
  }

  return {
    groups,
    isGroupsLoading: groupsQuery.isLoading,
    isGroupsError: groupsQuery.isError,
    releaseDate: group?.releaseDate,
    selectReleaseDate,
    items,
    positionOf: (id: string) => previewItems.findIndex((i) => i.id === id) + 1,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    moveTo,
    isSaving: reorderMutation.isPending,
    isStale,
  };
}
