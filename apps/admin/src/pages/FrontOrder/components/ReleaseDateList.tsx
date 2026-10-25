import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReleaseDateGroup } from "@/services/items";
import { Highlight } from "./Highlight";
import { matchGroups, releaseDateLabel } from "../search";

interface Props {
  groups: ReleaseDateGroup[];
  isLoading: boolean;
  isError: boolean;
  selected: string | null | undefined;
  onSelect: (releaseDate: string | null) => void;
  query: string;
  onQueryChange: (query: string) => void;
  tokens: string[];
}

export function ReleaseDateList({
  groups,
  isLoading,
  isError,
  selected,
  onSelect,
  query,
  onQueryChange,
  tokens,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = matchGroups(groups, tokens);

  // 在頁面任何地方按 / 都能跳到搜尋框，正在輸入其他欄位時不攔
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && matches[0]) {
      onSelect(matches[0].group.releaseDate);
    } else if (e.key === "Escape") {
      onQueryChange("");
    }
  }

  return (
    <nav className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white lg:sticky lg:top-0 lg:max-h-[calc(100vh-10rem)]">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white px-3 focus-within:shadow-[inset_0_-2px_0_rgba(61,124,168,0.5)]">
        <Search size={15} className="shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="日期、商品、系列"
          aria-label="搜尋發售日"
          autoComplete="off"
          className="peer min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <kbd className="rounded border border-gray-200 px-1.5 text-[10px] text-gray-400 peer-focus:hidden">
          /
        </kbd>
      </div>

      <div className="p-2">
        {isLoading ? (
          <p className="px-3 py-2 text-sm text-gray-400">載入中...</p>
        ) : isError ? (
          <p className="px-3 py-2 text-sm text-red-500">載入失敗，請重新整理頁面</p>
        ) : groups.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-400">尚無週邊</p>
        ) : matches.length === 0 ? (
          <p className="px-3 py-5 text-center text-xs leading-relaxed text-gray-400">
            找不到符合「{query}」的發售日
            <br />
            可以試試日期、商品名稱或系列
          </p>
        ) : (
          matches.map(({ group, hits }) => {
            const isSelected = group.releaseDate === selected;
            const firstHit = hits[0];
            return (
              <button
                key={group.releaseDate ?? "none"}
                type="button"
                onClick={() => onSelect(group.releaseDate)}
                className={cn(
                  "grid w-full grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-linear-to-r from-giyu/10 to-shinobu/10 font-medium text-giyu"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <span>
                  <Highlight text={releaseDateLabel(group.releaseDate)} tokens={tokens} />
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{group.items.length}</span>

                {firstHit && (
                  <span className="col-span-2 truncate text-[11px] font-normal text-gray-500">
                    <Highlight text={firstHit.name_tw ?? firstHit.name_jp} tokens={tokens} />
                    {hits.length > 1 && ` 等 ${hits.length} 件`}
                  </span>
                )}

                {isSelected && (
                  <span className="col-span-2 mt-0.5 flex gap-0.5">
                    {group.items.slice(0, 8).map((item) =>
                      item.image_cover_url ? (
                        <img
                          key={item.id}
                          src={item.image_cover_url}
                          alt=""
                          className="size-4.5 rounded-sm bg-gray-100 object-contain"
                        />
                      ) : null,
                    )}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </nav>
  );
}
