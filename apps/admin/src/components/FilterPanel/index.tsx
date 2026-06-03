import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, RotateCcw } from "lucide-react";
import { fetchCategories } from "@/services/categories";
import { fetchCharacters } from "@/services/characters";
import { fetchSeries } from "@/services/series";
import { type ItemFilters, defaultFilters } from "@/services/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSection } from "./FilterSection";
import { MultiSelectField } from "./MultiSelectField";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  filters: ItemFilters;
  onApply: (filters: ItemFilters) => void;
  onClose: () => void;
}

export function FilterPanel({ open, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<ItemFilters>(filters);

  // 每次開啟 panel 時，從當前已套用的 filters 重新初始化
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });

  const { data: seriesList = [] } = useQuery({
    queryKey: ["series"],
    queryFn: fetchSeries,
  });

  function updateFilter<K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setDraft(defaultFilters);
  }

  const hasActiveFilters = Object.entries(draft).some(([k, v]) => {
    const def = defaultFilters[k as keyof ItemFilters];
    if (Array.isArray(v)) return v.length > 0;
    return v !== def;
  });

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-40 flex h-full w-80 flex-col bg-white shadow-xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-900">進階篩選</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* 品名 */}
          <FilterSection title="品名">
            <Input
              placeholder="日文或中文名稱"
              value={draft.name}
              onChange={(e) => updateFilter("name", e.target.value)}
              className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
            />
          </FilterSection>

          {/* 商品分類 */}
          <FilterSection title="商品分類（可複選）">
            <MultiSelectField
              placeholder="選擇分類..."
              options={categories.map((c) => ({ id: c.id, label: c.name_tw }))}
              value={draft.categoryIds}
              onChange={(ids) => updateFilter("categoryIds", ids)}
            />
          </FilterSection>

          {/* 系列 */}
          <FilterSection title="系列（可複選）">
            <MultiSelectField
              placeholder="選擇系列..."
              options={seriesList.map((s) => ({ id: s.id, label: s.name_tw ?? s.name_jp }))}
              value={draft.seriesIds}
              onChange={(ids) => updateFilter("seriesIds", ids)}
            />
          </FilterSection>

          {/* 角色 */}
          <FilterSection title="角色分類（可複選）">
            <div className="flex gap-2">
              {characters.map((c) => {
                const isGiyu = c.slug === "giyu";
                const selected = draft.characterSlugs.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      const next = selected
                        ? draft.characterSlugs.filter((s) => s !== c.slug)
                        : [...draft.characterSlugs, c.slug];
                      updateFilter("characterSlugs", next);
                    }}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200",
                      selected
                        ? isGiyu
                          ? "border-giyu/40 bg-giyu/10 text-giyu shadow-[inset_0_2px_6px_rgba(61,124,168,0.18),0_1px_2px_rgba(61,124,168,0.08)]"
                          : "border-shinobu/40 bg-shinobu/10 text-shinobu shadow-[inset_0_2px_6px_rgba(126,93,168,0.18),0_1px_2px_rgba(126,93,168,0.08)]"
                        : "border-gray-200 bg-gray-50/80 text-gray-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] hover:bg-gray-100 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.07)]",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            {draft.characterSlugs.length === 2 && (
              <p className="mt-1.5 text-[11px] text-gray-400">
                顯示同時包含兩位角色的週邊
              </p>
            )}
          </FilterSection>

          {/* 狀態 */}
          <FilterSection title="狀態">
            <div className="flex gap-2">
              {(
                [
                  ["all", "全部"],
                  ["active", "上架中"],
                  ["inactive", "已下架"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => updateFilter("isActive", value)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200",
                    draft.isActive === value
                      ? "border-giyu/40 bg-giyu/10 text-giyu shadow-[inset_0_2px_6px_rgba(61,124,168,0.18),0_1px_2px_rgba(61,124,168,0.08)]"
                      : "border-gray-200 bg-gray-50/80 text-gray-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] hover:bg-gray-100 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.07)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* 售價區間 */}
          <FilterSection title="售價區間（¥）">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最低"
                min={0}
                value={draft.priceFrom}
                onChange={(e) => updateFilter("priceFrom", e.target.value)}
                className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
              />
              <span className="text-gray-400 text-sm">–</span>
              <Input
                type="number"
                placeholder="最高"
                min={0}
                value={draft.priceTo}
                onChange={(e) => updateFilter("priceTo", e.target.value)}
                className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
              />
            </div>
          </FilterSection>

          {/* 發售日區間 */}
          <FilterSection title="發售日區間">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-gray-400">從</span>
                <Input
                  type="date"
                  value={draft.releaseDateFrom}
                  onChange={(e) => updateFilter("releaseDateFrom", e.target.value)}
                  className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-gray-400">到</span>
                <Input
                  type="date"
                  value={draft.releaseDateTo}
                  onChange={(e) => updateFilter("releaseDateTo", e.target.value)}
                  className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
                />
              </div>
            </div>
          </FilterSection>

          {/* 排序區間 */}
          <FilterSection title="排序區間">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="從"
                min={0}
                value={draft.displayOrderFrom}
                onChange={(e) => updateFilter("displayOrderFrom", e.target.value)}
                className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
              />
              <span className="text-gray-400 text-sm">–</span>
              <Input
                type="number"
                placeholder="到"
                min={0}
                value={draft.displayOrderTo}
                onChange={(e) => updateFilter("displayOrderTo", e.target.value)}
                className="bg-gray-50 focus-visible:border-giyu focus-visible:ring-giyu/20"
              />
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-4 flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="gap-1.5"
          >
            <RotateCcw size={13} />
            清除
          </Button>
          <Button
            className="flex-1 bg-linear-to-r from-giyu to-shinobu hover:from-[#336a91] hover:to-[#6a4f91] text-white border-transparent"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            套用篩選
          </Button>
        </div>
      </div>
    </>
  );
}
