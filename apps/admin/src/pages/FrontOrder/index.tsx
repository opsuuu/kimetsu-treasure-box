import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AlertCircle } from "lucide-react";
import { useReleaseDateOrder } from "@/hooks";
import { SortableRow } from "@/components/SortableRow";
import { TableSkeleton } from "@/components/TableSkeleton";
import { cn } from "@/lib/cn";

const NO_RELEASE_DATE_LABEL = "未填發售日";

export default function FrontOrderPage() {
  const {
    groups,
    isGroupsLoading,
    releaseDate,
    selectReleaseDate,
    items,
    isItemsLoading,
    sensors,
    handleDragEnd,
    isSaving,
    isStale,
  } = useReleaseDateOrder();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">前台排序</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          前台依發售日由新到舊顯示，這裡調整同一天發售的週邊先後順序
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* 發售日 */}
        <nav className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 lg:max-h-[calc(100vh-12rem)]">
          {isGroupsLoading ? (
            <p className="px-3 py-2 text-sm text-gray-400">載入中...</p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">尚無週邊</p>
          ) : (
            groups.map((group) => (
              <button
                key={group.releaseDate ?? "none"}
                type="button"
                onClick={() => selectReleaseDate(group.releaseDate)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  group.releaseDate === releaseDate
                    ? "bg-linear-to-r from-giyu/10 to-shinobu/10 font-medium text-giyu"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <span>{group.releaseDate ?? NO_RELEASE_DATE_LABEL}</span>
                <span className="text-xs text-gray-400">{group.count}</span>
              </button>
            ))
          )}
        </nav>

        {/* 當天的週邊 */}
        <div>
          {isStale && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>資料已變動，已重新載入這一組，請再拖曳一次。</span>
            </div>
          )}
          <p className="mb-2 text-xs text-gray-400">
            {isSaving ? "儲存中..." : "拖曳左側把手調整順序，放開後自動儲存"}
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {isGroupsLoading || isItemsLoading ? (
              <TableSkeleton rows={5} cols={3} />
            ) : items.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                尚無週邊
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full text-sm">
                  <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <SortableRow key={item.id} id={item.id} disabled={isSaving}>
                          {() => (
                            <>
                              {/* 封面 */}
                              <td className="w-20 px-4 py-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-1">
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
                                <p className="font-medium text-gray-900 line-clamp-1">
                                  {item.name_jp}
                                </p>
                                {item.name_tw && (
                                  <p className="text-xs text-gray-400 line-clamp-1">
                                    {item.name_tw}
                                  </p>
                                )}
                              </td>

                              {/* 狀態 */}
                              <td className="w-20 px-4 py-3 text-center">
                                {!item.is_active && (
                                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500">
                                    已下架
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                        </SortableRow>
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
