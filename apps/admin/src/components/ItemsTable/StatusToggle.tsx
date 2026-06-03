import { cn } from "@/lib/cn";

interface Props {
  isActive: boolean;
  isPending: boolean;
  onToggle: () => void;
}

export function StatusToggle({ isActive, isPending, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      title={isActive ? "點擊下架" : "點擊上架"}
      className={cn(
        "relative inline-flex h-7 w-13 items-center rounded-full border transition-all duration-300",
        "backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50",
        isActive
          ? "border-giyu/30 bg-giyu/10 shadow-[inset_0_2px_6px_rgba(61,124,168,0.2)]"
          : "border-gray-200 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
      )}
    >
      <span
        className={cn(
          "absolute flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
          isActive
            ? "left-[calc(100%-22px)] bg-linear-to-br from-giyu to-shinobu shadow-[0_0_8px_rgba(61,124,168,0.55),0_2px_4px_rgba(0,0,0,0.15)]"
            : "left-[3px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.12)]",
        )}
      />
    </button>
  );
}
