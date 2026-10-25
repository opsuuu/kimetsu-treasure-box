import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import type { ReleaseDateItem } from "@/services/items";
import { Highlight } from "./Highlight";

interface Props {
  item: ReleaseDateItem;
  position: number;
  total: number;
  disabled: boolean;
  isHit: boolean;
  tokens: string[];
  /** 剛用「移到第 N 位」移過來，捲到畫面中間並閃一下 */
  isJustMoved: boolean;
  onMoveTo: (position: number) => void;
}

// 卡片版面對應前台 apps/web 的 ItemCard，前台卡片改版時要一起調整
function accentClass(item: ReleaseDateItem) {
  const slugs = item.item_characters.map((ic) => ic.characters?.slug);
  const giyu = slugs.includes("giyu");
  const shinobu = slugs.includes("shinobu");
  if (giyu && shinobu) return "bg-linear-to-r from-giyu to-shinobu";
  if (giyu) return "bg-giyu";
  if (shinobu) return "bg-shinobu";
  return "bg-gray-300";
}

export function OrderCard({
  item,
  position,
  total,
  disabled,
  isHit,
  tokens,
  isJustMoved,
  onMoveTo,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled });
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isJumpOpen, setIsJumpOpen] = useState(false);

  useEffect(() => {
    if (isJustMoved) {
      nodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isJustMoved]);

  const characterNames = item.item_characters
    .map((ic) => ic.characters?.name)
    .filter(Boolean)
    .join("・");

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        nodeRef.current = node;
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "relative flex touch-none flex-col rounded-[10px] border border-gray-200 bg-white select-none transition-shadow",
        disabled ? "cursor-not-allowed" : "cursor-grab hover:shadow-[0_8px_20px_-12px_rgba(17,24,39,0.35)]",
        isDragging && "z-20 cursor-grabbing shadow-[0_20px_40px_-18px_rgba(17,24,39,0.5)]",
        isHit && "ring-2 ring-yellow-400",
        isJustMoved && "ring-4 ring-giyu/50",
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-0.75 rounded-t-[10px]", accentClass(item))} />

      {/* 順位 */}
      <button
        type="button"
        title="點一下輸入要移到第幾位"
        disabled={disabled}
        onClick={() => setIsJumpOpen(true)}
        className="absolute -top-2.5 -left-2.5 z-10 grid h-7 min-w-7 place-items-center rounded-full bg-linear-to-br from-giyu to-shinobu px-1.5 text-[13px] font-bold text-white tabular-nums shadow-[0_0_0_3px_#fff,0_4px_10px_-4px_rgba(61,124,168,0.7)] transition-transform hover:scale-110 disabled:hover:scale-100"
      >
        {position}
      </button>

      {isJumpOpen && (
        <JumpForm
          position={position}
          total={total}
          onSubmit={(to) => {
            setIsJumpOpen(false);
            onMoveTo(to);
          }}
          onClose={() => setIsJumpOpen(false)}
        />
      )}

      {/* 封面 */}
      <div className={cn("flex aspect-square items-center justify-center overflow-hidden rounded-t-[9px] bg-gray-50", !item.is_active && "opacity-45")}>
        {item.image_cover_url ? (
          <img
            src={item.image_cover_url}
            alt={item.name_jp}
            draggable={false}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-2xl text-gray-300">無</span>
        )}
      </div>

      {!item.is_active && (
        <span className="absolute top-2.5 right-2.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-500">
          已下架 · 前台不顯示
        </span>
      )}

      {/* 內容 */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-gray-500">{item.categories?.name_tw}</span>
          {item.price != null ? (
            <span className="text-xs font-semibold text-gray-900 tabular-nums">
              ¥{item.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-gray-400">尚未記錄</span>
          )}
        </div>

        <p className="line-clamp-3 flex-1 text-[12.5px] leading-normal font-medium text-gray-900">
          <Highlight text={item.name_jp} tokens={isHit ? tokens : []} />
        </p>

        <div className="flex items-center justify-between gap-1 border-t border-gray-100 pt-1.5 text-[11px] text-gray-400">
          <p className="truncate">{item.series?.name_tw ?? item.series?.name_jp}</p>
          {characterNames && <p className="shrink-0">{characterNames}</p>}
        </div>
      </div>
    </div>
  );
}

interface JumpFormProps {
  position: number;
  total: number;
  onSubmit: (position: number) => void;
  onClose: () => void;
}

function JumpForm({ position, total, onSubmit, onClose }: JumpFormProps) {
  const [value, setValue] = useState(String(position));

  return (
    <form
      // 卡片本身掛著拖曳的 listener，表單裡的操作不能被當成拖曳
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        const to = Math.round(Number(value));
        if (Number.isFinite(to)) onSubmit(to);
        else onClose();
      }}
      className="absolute top-6 -left-2.5 z-30 flex w-max max-w-56 cursor-default flex-col gap-1 rounded-lg bg-gray-900 px-3 py-2.5 text-[13px] text-white shadow-[0_16px_30px_-12px_rgba(0,0,0,0.45)]"
    >
      <label>
        移到第
        <input
          type="number"
          min={1}
          max={total}
          value={value}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          onBlur={onClose}
          className="mx-1 w-14 appearance-none rounded-md bg-white px-1.5 py-0.5 text-center font-bold text-gray-900 outline-none focus:ring-2 focus:ring-giyu/60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        位
      </label>
      <span className="text-[11px] text-gray-400">共 {total} 件 · Enter 確認、Esc 取消</span>
    </form>
  );
}
