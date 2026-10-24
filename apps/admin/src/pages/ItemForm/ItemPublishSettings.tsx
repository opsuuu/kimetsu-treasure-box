import { Controller, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { Field } from "./Field";
import type { ItemFormControl, ItemFormInput } from "./schema";

const STATUS_OPTIONS = [
  [true, "已上架"],
  [false, "已下架"],
] as const;

interface Props {
  control: ItemFormControl;
  register: UseFormRegister<ItemFormInput>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ItemPublishSettings({
  control,
  register,
  isSubmitting,
  onCancel,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-0 lg:self-start">
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">發布設定</h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Field label="商品狀態" required>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200",
                        field.value === value
                          ? "border-giyu/40 bg-giyu/10 text-giyu shadow-[inset_0_2px_6px_rgba(61,124,168,0.18),0_1px_2px_rgba(61,124,168,0.08)]"
                          : "border-gray-200 bg-gray-50/80 text-gray-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] hover:bg-gray-100 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.07)]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
          </Field>

          <Field label="顯示排序" hint="留空則自動排到最後">
            <Input
              type="number"
              placeholder="自動"
              {...register("display_order")}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full border-transparent bg-linear-to-r from-giyu to-shinobu text-white hover:from-[#336a91] hover:to-[#6a4f91]"
          >
            {isSubmitting ? "儲存中..." : "儲存週邊"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            取消
          </Button>
        </div>
      </div>
    </aside>
  );
}
