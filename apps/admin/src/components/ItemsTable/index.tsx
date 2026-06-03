import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Trash2 } from "lucide-react";
import { SortableRow } from "@/components/SortableRow";
import { Button } from "@/components/ui/button";
import { CharacterTags } from "./CharacterTags";
import { StatusToggle } from "./StatusToggle";
import { COLUMNS } from "./columns";
import { cn } from "@/lib/cn";
import type { AdminItem } from "@/services/items";

interface Props {
  items: AdminItem[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onDelete: (id: string, name: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  isTogglePending: boolean;
}

export function ItemsTable({ items, sensors, onDragEnd, onDelete, onToggle, isTogglePending }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500">
            <th className="px-2 py-3 w-8" />
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3",
                  col.width,
                  col.align === 'center' && "text-center",
                  col.className,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <SortableRow key={item.id} id={item.id}>
                  {() => (
                    <>
                      {/* 封面 */}
                      <td className="px-4 py-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-1.5">
                          {item.image_cover_url && (
                            <img
                              src={item.image_cover_url}
                              alt={item.name_jp}
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                      </td>

                      {/* 名稱 */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{item.name_jp}</p>
                        {item.name_tw && (
                          <p className="text-xs text-gray-400 line-clamp-1">{item.name_tw}</p>
                        )}
                      </td>

                      {/* 分類 */}
                      <td className="px-4 py-3">
                        {item.categories ? (
                          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">
                            {item.categories.name_tw}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* 系列 */}
                      <td className="hidden md:table-cell px-4 py-3">
                        {item.series ? (
                          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600">
                            {item.series.name_tw ?? item.series.name_jp}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* 角色 */}
                      <td className="hidden lg:table-cell px-4 py-3">
                        <CharacterTags characters={item.item_characters} />
                      </td>

                      {/* 售價 */}
                      <td className="px-4 py-3 text-gray-600">
                        {item.price != null ? `¥${item.price.toLocaleString()}` : "—"}
                      </td>

                      {/* 發售日 */}
                      <td className="hidden md:table-cell px-4 py-3 text-gray-600">
                        {item.release_date ?? "—"}
                      </td>

                      {/* 排序 */}
                      <td className="hidden lg:table-cell px-4 py-3 text-center text-gray-500">
                        {item.display_order ?? "—"}
                      </td>

                      {/* 狀態 */}
                      <td className="px-4 py-3 text-center">
                        <StatusToggle
                          isActive={item.is_active}
                          isPending={isTogglePending}
                          onToggle={() => onToggle(item.id, !item.is_active)}
                        />
                      </td>

                      {/* 操作 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="編輯"
                            className="text-gray-400 hover:bg-giyu/10 hover:text-giyu"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => onDelete(item.id, item.name_jp)}
                            title="刪除"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </SortableRow>
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  );
}
