import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { AlertCircle } from "lucide-react";
import { useReleaseDateOrder } from "@/hooks";
import { OrderCard } from "./components/OrderCard";
import { ReleaseDateList } from "./components/ReleaseDateList";
import { isItemHit, releaseDateLabel, toTokens } from "./search";

const JUST_MOVED_MS = 1400;

export default function FrontOrderPage() {
  const {
    groups,
    isGroupsLoading,
    isGroupsError,
    releaseDate,
    selectReleaseDate,
    items,
    positionOf,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    moveTo,
    isSaving,
    isStale,
  } = useReleaseDateOrder();
  const [query, setQuery] = useState("");
  const [justMovedId, setJustMovedId] = useState<string | null>(null);
  const tokens = toTokens(query);

  useEffect(() => {
    if (!justMovedId) return;
    const timer = setTimeout(() => setJustMovedId(null), JUST_MOVED_MS);
    return () => clearTimeout(timer);
  }, [justMovedId]);

  const groupIndex = groups.findIndex((g) => g.releaseDate === releaseDate);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">前台排序</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          前台依發售日由新到舊顯示，這裡調整同一天發售的週邊先後順序
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ReleaseDateList
          groups={groups}
          isLoading={isGroupsLoading}
          isError={isGroupsError}
          selected={releaseDate}
          onSelect={selectReleaseDate}
          query={query}
          onQueryChange={setQuery}
          tokens={tokens}
        />

        <div>
          {isStale && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>資料已變動，已重新載入這一組，請再操作一次。</span>
            </div>
          )}
          <p className="mb-2 text-xs text-gray-400">
            {isSaving
              ? "儲存中..."
              : "拖曳卡片調整順序，拖到畫面上下緣會自動捲動；長距離移動可以點號碼直接輸入順位"}
          </p>

          <div className="rounded-xl border border-gray-200 bg-white px-6 pb-6">
            <div className="-mx-6 mb-6 flex items-center justify-between border-b border-gray-200 px-6 py-3 text-xs">
              <span className="font-semibold text-gray-900">前台預覽</span>
              {groupIndex >= 0 && (
                <span className="text-gray-400">
                  {releaseDateLabel(releaseDate ?? null)} · 第 {groupIndex + 1} / {groups.length} 組
                </span>
              )}
            </div>

            {isGroupsLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                載入中...
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                {isGroupsError ? "載入失敗，請重新整理頁面" : "尚無週邊"}
              </div>
            ) : (
              <div className="relative mt-2 rounded-xl border border-giyu/20 bg-linear-to-br from-giyu/5 to-shinobu/5 px-4.5 pt-6 pb-4.5">
                <span className="absolute -top-2.5 left-3.5 flex items-baseline gap-2 rounded-full border border-giyu/25 bg-white px-2.5 py-0.5 text-xs font-semibold text-giyu">
                  {releaseDateLabel(releaseDate ?? null)}
                  <small className="text-[11px] font-normal text-gray-400">
                    {items.length} 件
                  </small>
                </span>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  autoScroll={{ threshold: { x: 0, y: 0.15 }, acceleration: 15 }}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
                      {items.map((item) => (
                        <OrderCard
                          key={item.id}
                          item={item}
                          position={positionOf(item.id)}
                          total={items.length}
                          disabled={isSaving}
                          isHit={isItemHit(item, releaseDate ?? null, tokens)}
                          tokens={tokens}
                          isJustMoved={item.id === justMovedId}
                          onMoveTo={(position) => {
                            moveTo(item.id, position);
                            setJustMovedId(item.id);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
