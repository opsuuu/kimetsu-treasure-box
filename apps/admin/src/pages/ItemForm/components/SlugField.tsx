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
  type ItemOriginal,
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
  /** false = 載入時就是手動模式，掛載時不會用自動產生值覆蓋既有 slug（編輯頁） */
  initialAutoGenerate: boolean;
  /** 載入時的 slug 與上架狀態；只有編輯頁會傳，有值代表編輯模式 */
  original?: ItemOriginal;
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
  initialAutoGenerate,
  original,
}: Props) {
  // true = 使用者已手動接管 slug，自動產生不再覆蓋
  const [slugEdited, setSlugEdited] = useState(!initialAutoGenerate);
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

  // 送出前不驗證，避免一進頁面空 slug 就跳錯；送出後才驗證，讓補選角色時舊錯誤能消失。
  // shouldDirty 讓 RHF 重算整張表單的 isDirty：取消選取角色時，角色欄位先變回預設、slug 晚一步才清空，
  // 沒有重算的話 isDirty 會停在 true，改回原值後儲存按鈕不會恢復停用
  useEffect(() => {
    if (slugEdited) return;
    setValue("slug", generatedSlug, {
      shouldValidate: isSubmitted,
      shouldDirty: true,
    });
  }, [generatedSlug, slugEdited, isSubmitted, setValue]);

  const slugField = register("slug");
  const canRestoreSlug = Boolean(generatedSlug) && slug !== generatedSlug;
  const isEditMode = original !== undefined;
  const willBreakLiveUrl = original?.isActive === true && slug !== original.slug;

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
      {/* 手填段：商品修飾、款式。不存 DB，也不從既有 slug 反推（角色、系列 slug 本身含連字號，拆法有歧義），所以編輯時一定是空的 */}
      {isEditMode && (
        <p className="text-xs text-gray-500">
          編輯時這兩欄不會帶入原值，只影響下方「自動產生」與還原結果
        </p>
      )}
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
        {willBreakLiveUrl && (
          <p className="text-amber-600">
            修改後，前台舊網址 /items/{original.slug} 將失效
          </p>
        )}
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
        {isEditMode ? (
          <>
            {`還原後會變成「${generatedSlug}」。`}
            {!modifier.trim() &&
              !variant.trim() &&
              "目前沒有填商品修飾、款式，還原後不會包含這兩段。"}
            {original.isActive && "前台舊網址會失效。"}
          </>
        ) : (
          `目前的網址名稱是手動修改過的，還原後會變成「${generatedSlug}」。`
        )}
      </Modal>
    </FormSection>
  );
}
