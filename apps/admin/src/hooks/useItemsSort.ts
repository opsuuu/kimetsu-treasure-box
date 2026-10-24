import { useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PAGE_SIZE, type AdminItem } from "@/services/items";

interface UseItemsSortProps {
  serverItems: AdminItem[];
  page: number;
  disabled: boolean;
  onReorder: (updates: { id: string; display_order: number }[]) => Promise<void>;
}

interface LocalOrder {
  base: AdminItem[];
  page: number;
  items: AdminItem[];
}

export function useItemsSort({ serverItems, page, disabled, onReorder }: UseItemsSortProps) {
  const [localOrder, setLocalOrder] = useState<LocalOrder | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // 拖曳結果只對當下那份 serverItems 與頁碼有效，伺服器資料更新或換頁就改回伺服器順序
  const items =
    localOrder?.base === serverItems && localOrder.page === page
      ? localOrder.items
      : serverItems;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (disabled || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setLocalOrder({ base: serverItems, page, items: reordered });

    const baseOrder = (page - 1) * PAGE_SIZE + 1;
    const updates = reordered.map((item, i) => ({
      id: item.id,
      display_order: baseOrder + i,
    }));

    // 寫入全部失敗時重抓到的資料會沿用同一個參考，不會自動蓋掉本地順序
    onReorder(updates).catch(() => setLocalOrder(null));
  }

  return {
    items,
    sensors,
    handleDragEnd,
  };
}
