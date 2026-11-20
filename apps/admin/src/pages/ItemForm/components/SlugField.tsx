import { useEffect, useId, useState, type ChangeEvent } from "react";
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
import {
  SLUG_LENGTH_HINT,
  SLUG_MODIFIER_SUGGESTIONS,
  SLUG_VARIANT_SUGGESTIONS,
  buildSlug,
  toSlugSegment,
  type ItemFormControl,
  type ItemFormInput,
} from "../schema";

/** 有輸入但轉換後為空（例如只打了日文），這段會在 slug 裡被略過 */
function droppedSegmentError(value: string): string | undefined {
  return value.trim() && !toSlugSegment(value)
    ? "只能使用英文與數字，這段會被略過"
    : undefined;
}

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
  // 只用來組 slug，不存 DB
  const [modifier, setModifier] = useState("");
  const [variant, setVariant] = useState("");
  const modifierListId = useId();
  const variantListId = useId();

  const [characterIds, categoryId, seriesId, slug] = useWatch({
    control,
    name: ["character_ids", "category_id", "series_id", "slug"],
  });

  const generatedSlug = buildSlug({
    characterIds,
    categoryId,
    seriesId,
    modifier,
    variant,
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
      {/* 手填段：商品修飾、款式 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="商品修飾"
          error={droppedSegmentError(modifier)}
          hint="選填。商品名稱的一部分，例 tsunagaru、big、tsunagaru-big"
        >
          <Input
            className="font-mono"
            list={modifierListId}
            value={modifier}
            onChange={(event) => setModifier(event.target.value)}
          />
          <datalist id={modifierListId}>
            {SLUG_MODIFIER_SUGGESTIONS.map((word) => (
              <option key={word} value={word} />
            ))}
          </datalist>
        </Field>
        <Field
          label="款式"
          error={droppedSegmentError(variant)}
          hint="選填。活動裡的哪一款，例 key-visual-a、tokyo、2"
        >
          <Input
            className="font-mono"
            list={variantListId}
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
          />
          <datalist id={variantListId}>
            {SLUG_VARIANT_SUGGESTIONS.map((word) => (
              <option key={word} value={word} />
            ))}
          </datalist>
        </Field>
      </div>

      {/* Slug 本身 */}
      <Field
        label="Slug"
        required
        error={error?.message}
        hint="僅允許小寫英文字母、數字與連字號；預設由角色＋類別＋商品修飾＋系列＋款式組成，手動改過可按右側還原"
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

      {/* 預覽與長度提示：手動改過 slug 後，手填段的變化不會反映在輸入框，需要另外顯示 */}
      <div className="-mt-2 space-y-1 text-[11px]">
        {slugEdited && generatedSlug && slug !== generatedSlug && (
          <p className="text-gray-400">
            自動產生：<span className="font-mono">{generatedSlug}</span>
          </p>
        )}
        <p
          className={
            slug.length > SLUG_LENGTH_HINT ? "text-amber-600" : "text-gray-400"
          }
        >
          {slug.length} / {SLUG_LENGTH_HINT} 字元
          {slug.length > SLUG_LENGTH_HINT && "，建議精簡（不影響送出）"}
        </p>
      </div>

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
