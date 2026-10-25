import { useEffect, useState, type ChangeEvent } from "react";
import {
  useWatch,
  type FieldError,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/Modal";
import type { Category } from "@/services/categories";
import type { Character } from "@/services/characters";
import type { Series } from "@/services/series";
import { Field } from "./Field";
import { FormSection } from "./FormSection";
import { buildSlug, type ItemFormControl, type ItemFormInput } from "../schema";

interface Props {
  control: ItemFormControl;
  register: UseFormRegister<ItemFormInput>;
  setValue: UseFormSetValue<ItemFormInput>;
  error?: FieldError;
  isSubmitted: boolean;
  characters: Character[];
  categories: Category[];
  seriesList: Series[];
}

export function SlugField({
  control,
  register,
  setValue,
  error,
  isSubmitted,
  characters,
  categories,
  seriesList,
}: Props) {
  // true = 使用者已手動接管 slug，自動產生不再覆蓋
  const [slugEdited, setSlugEdited] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const [characterIds, categoryId, seriesId, slug] = useWatch({
    control,
    name: ["character_ids", "category_id", "series_id", "slug"],
  });

  const generatedSlug = buildSlug({
    characterIds,
    categoryId,
    seriesId,
    characters,
    categories,
    seriesList,
  });

  // 送出前不驗證，避免一進頁面空 slug 就跳錯；送出後才驗證，讓補選角色時舊錯誤能消失
  useEffect(() => {
    if (slugEdited) return;
    setValue("slug", generatedSlug, { shouldValidate: isSubmitted });
  }, [generatedSlug, slugEdited, isSubmitted, setValue]);

  const slugField = register("slug");
  const canRestoreSlug = Boolean(generatedSlug) && slug !== generatedSlug;

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    slugField.onChange(event);
  }

  function regenerateSlug() {
    setValue("slug", generatedSlug, { shouldValidate: true, shouldDirty: true });
    setSlugEdited(false);
    setRegenerateOpen(false);
  }

  return (
    <FormSection
      title="網址名稱"
      description="前台商品頁網址，建立後請盡量不要再更動"
    >
      <Field
        label="Slug"
        required
        error={error?.message}
        hint="僅允許小寫英文字母、數字與連字號；預設由角色＋類別＋系列組成，手動改過可按右側還原"
      >
        <div className="flex gap-2">
          <Input
            className="font-mono"
            {...slugField}
            onChange={handleSlugChange}
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="shrink-0"
            disabled={!canRestoreSlug}
            onClick={() =>
              slugEdited ? setRegenerateOpen(true) : regenerateSlug()
            }
          >
            <RotateCcw size={14} />
            還原自動產生
          </Button>
        </div>
      </Field>

      <Modal
        open={regenerateOpen}
        onClose={() => setRegenerateOpen(false)}
        title="還原網址名稱"
        variant="warning"
        icon={<RotateCcw size={18} />}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegenerateOpen(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={regenerateSlug}>
              確認還原
            </Button>
          </>
        }
      >
        {`目前的網址名稱是手動修改過的，還原後會變成「${generatedSlug}」。`}
      </Modal>
    </FormSection>
  );
}
