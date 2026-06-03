import { useState, useEffect } from "react";
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
  onReorder: (updates: { id: string; display_order: number }[]) => void;
}

export function useItemsSort({ serverItems, page, onReorder }: UseItemsSortProps) {
  const [localItems, setLocalItems] = useState<AdminItem[] | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setLocalItems(serverItems);
  }, [serverItems]);

  useEffect(() => {
    setLocalItems(null);
  }, [page]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = localItems ?? serverItems;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setLocalItems(reordered);

    const baseOrder = (page - 1) * PAGE_SIZE + 1;
    const updates = reordered.map((item, i) => ({
      id: item.id,
      display_order: baseOrder + i,
    }));

    onReorder(updates);
  }

  return {
    items: localItems ?? serverItems,
    sensors,
    handleDragEnd,
  };
}
