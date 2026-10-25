import {
  Controller,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Category } from "@/services/categories";
import type { Character } from "@/services/characters";
import type { Series } from "@/services/series";
import { Field } from "./Field";
import { FormSection } from "./FormSection";
import type { ItemFormControl, ItemFormInput } from "../schema";

interface Props {
  control: ItemFormControl;
  register: UseFormRegister<ItemFormInput>;
  errors: FieldErrors<ItemFormInput>;
  characters: Character[];
  categories: Category[];
  seriesList: Series[];
}

export function ItemBasicFields({
  control,
  register,
  errors,
  characters,
  categories,
  seriesList,
}: Props) {
  return (
    <FormSection title="基本資訊">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="日文名稱" required error={errors.name_jp?.message}>
          <Input
            placeholder="例：冨岡義勇 アクリルスタンド"
            {...register("name_jp")}
          />
        </Field>
        <Field label="中文名稱">
          <Input
            placeholder="例：富岡義勇 壓克力立牌"
            {...register("name_tw")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="商品類別">
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇類別..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_tw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="商品系列">
          <Controller
            control={control}
            name="series_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇系列..." />
                </SelectTrigger>
                <SelectContent>
                  {seriesList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name_tw ?? s.name_jp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Controller
        control={control}
        name="character_ids"
        render={({ field }) => (
          <Field
            label="商品角色"
            required
            error={errors.character_ids?.message}
            hint={
              field.value.length === 2
                ? "兩位角色皆選，圖片將歸入 both／資料夾"
                : "至少選擇一位角色"
            }
          >
            <div className="flex gap-2">
              {characters.map(({ id, slug, name }) => {
                const isGiyu = slug === "giyu";
                const selected = field.value.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      field.onChange(
                        selected
                          ? field.value.filter((c) => c !== id)
                          : [...field.value, id],
                      )
                    }
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200",
                      selected
                        ? isGiyu
                          ? "border-giyu/40 bg-giyu/10 text-giyu shadow-[inset_0_2px_6px_rgba(61,124,168,0.18),0_1px_2px_rgba(61,124,168,0.08)]"
                          : "border-shinobu/40 bg-shinobu/10 text-shinobu shadow-[inset_0_2px_6px_rgba(126,93,168,0.18),0_1px_2px_rgba(126,93,168,0.08)]"
                        : "border-gray-200 bg-gray-50/80 text-gray-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] hover:bg-gray-100 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.07)]",
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      />
    </FormSection>
  );
}
