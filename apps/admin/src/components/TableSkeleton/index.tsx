import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 8, cols = 6 }: Props) {
  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={j === 0 ? "h-12 w-12 rounded-xl shrink-0" : "h-4 flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
