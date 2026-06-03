import { useState } from "react";
import { Plus, Search, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminItems, useItemsSort } from "@/hooks";
import { FilterPanel } from "@/components/FilterPanel";
import { ItemsTable } from "@/components/ItemsTable";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Modal } from "@/components/Modal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/cn";
import { PAGE_SIZE, defaultFilters, type ItemFilters } from "@/services/items";

export default function ItemsPage() {
  const [filters, setFilters] = useState<ItemFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { query, deleteMutation, toggleMutation, orderMutation } =
    useAdminItems({ filters, page });
  const { items, sensors, handleDragEnd } = useItemsSort({
    serverItems: query.data?.items ?? [],
    page,
    onReorder: (updates) => orderMutation.mutate(updates),
  });

  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => {
    const def = defaultFilters[k as keyof ItemFilters];
    return Array.isArray(v) ? v.length > 0 : v !== def;
  });

  function handleApply(newFilters: ItemFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">週邊管理</h1>
          <p className="mt-0.5 text-sm text-gray-500">共 {total} 件週邊</p>
        </div>
        <Button className="bg-linear-to-r from-giyu to-shinobu hover:from-[#336a91] hover:to-[#6a4f91] text-white border-transparent">
          <Plus size={16} />
          新增週邊
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            readOnly
            placeholder="點擊進行進階搜尋..."
            onClick={() => setPanelOpen(true)}
            value={filters.name}
            className={cn(
              "h-9 w-full cursor-pointer rounded-lg border bg-white pr-4 pl-9 text-sm outline-none",
              hasActiveFilters
                ? "border-giyu ring-2 ring-giyu/20"
                : "border-gray-200 hover:border-gray-300",
            )}
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setPanelOpen(true)}
          className={cn(
            hasActiveFilters &&
              "border-giyu bg-giyu/10 text-giyu hover:bg-giyu/20 hover:text-giyu",
          )}
        >
          <SlidersHorizontal size={15} />
          篩選
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-giyu text-[10px] font-bold text-white">
              {
                Object.entries(filters).filter(([k, v]) => {
                  const def = defaultFilters[k as keyof ItemFilters];
                  return Array.isArray(v) ? v.length > 0 : v !== def;
                }).length
              }
            </span>
          )}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {query.isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            {hasActiveFilters ? "找不到符合條件的週邊" : "尚無週邊"}
          </div>
        ) : (
          <ItemsTable
            items={items}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDelete={(id, name) => setDeleteTarget({ id, name })}
            onToggle={(id, isActive) => toggleMutation.mutate({ id, isActive })}
            isTogglePending={toggleMutation.isPending}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:relative">
          <Pagination className="flex-1">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="上一頁"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  className={cn(
                    "hover:text-giyu",
                    page === 1 && "pointer-events-none opacity-40",
                  )}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          page === p &&
                            "border-transparent bg-linear-to-r from-giyu to-shinobu text-white hover:from-[#336a91] hover:to-[#6a4f91] hover:text-white",
                        )}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

              <PaginationItem>
                <PaginationNext
                  text="下一頁"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                  className={cn(
                    "hover:text-shinobu",
                    page === totalPages && "pointer-events-none opacity-40",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <p className="text-xs text-gray-400 md:absolute md:right-0">
            第 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}{" "}
            筆，共 {total} 筆
          </p>
        </div>
      )}

      {/* Filter panel */}
      <FilterPanel
        open={panelOpen}
        filters={filters}
        onApply={handleApply}
        onClose={() => setPanelOpen(false)}
      />

      {/* Delete confirm modal */}
      {deleteTarget && (
        <Modal
          open
          onClose={() => setDeleteTarget(null)}
          title={`刪除「${deleteTarget.name}」`}
          variant="danger"
          icon={<Trash2 size={18} />}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "刪除中..." : "確認刪除"}
              </Button>
            </>
          }
        >
          此操作無法復原，請確認後再執行。
        </Modal>
      )}
    </div>
  );
}
