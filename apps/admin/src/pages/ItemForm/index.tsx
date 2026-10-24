import { useRef, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateItem, toErrorMessage } from "@/hooks";
import { fetchCategories } from "@/services/categories";
import { fetchCharacters } from "@/services/characters";
import { fetchSeries } from "@/services/series";
import {
  SLUG_TAKEN_MESSAGE,
  isSlugConflict,
  isSlugTaken,
} from "@/services/items";
import { FormSection } from "./FormSection";
import { Field } from "./Field";
import { ItemBasicFields } from "./ItemBasicFields";
import { SlugField } from "./SlugField";
import { ItemImageFields } from "./ItemImageFields";
import { ItemPublishSettings } from "./ItemPublishSettings";
import {
  getCharacterSlugs,
  itemFormDefaults,
  itemFormSchema,
  type ItemFormInput,
  type ItemFormOutput,
} from "./schema";

export default function ItemFormPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  // isSubmitting 要等 re-render 才會擋住按鈕，同步鎖確保同一時間只跑一次送出流程
  const submittingRef = useRef(false);

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

  const { mutation, createdItemId } = useCreateItem();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ItemFormInput, unknown, ItemFormOutput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: itemFormDefaults,
  });

  async function submitItem(values: ItemFormOutput) {
    setFormError(null);
    const { cover, gallery, ...itemValues } = values;

    // 商品已經建立過的重送只需要補圖片，slug 就是它自己，不必再查重
    if (!createdItemId.current) {
      try {
        if (await isSlugTaken(values.slug)) {
          setError("slug", { message: SLUG_TAKEN_MESSAGE });
          return;
        }
      } catch (error) {
        setFormError(toErrorMessage(error, "網址名稱檢查失敗，請稍後再試"));
        return;
      }
    }

    try {
      const itemId = await mutation.mutateAsync({
        values: itemValues,
        cover,
        gallery: gallery.map((image) => image.file),
        characterSlugs: getCharacterSlugs(values.character_ids, characters),
      });
      navigate(`/items/${itemId}/edit`);
    } catch (error) {
      if (isSlugConflict(error)) {
        setError("slug", { message: SLUG_TAKEN_MESSAGE });
        setFormError(SLUG_TAKEN_MESSAGE);
        return;
      }
      setFormError(
        createdItemId.current
          ? `${toErrorMessage(error, "其他圖片儲存失敗")}（商品已建立，可直接再次送出補上圖片）`
          : toErrorMessage(error, "儲存失敗，請稍後再試"),
      );
    }
  }

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (submittingRef.current) {
      event.preventDefault();
      return;
    }
    submittingRef.current = true;
    try {
      await handleSubmit(submitItem)(event);
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/items")}
          className="text-gray-400 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">新增週邊</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            標記 <span className="text-red-500">*</span> 為必填欄位
          </p>
        </div>
      </div>

      {formError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* 主欄 */}
        <div className="space-y-5">
          <ItemBasicFields
            control={control}
            register={register}
            errors={errors}
            characters={characters}
            categories={categories}
            seriesList={seriesList}
          />

          <SlugField
            control={control}
            register={register}
            setValue={setValue}
            error={errors.slug}
            isSubmitted={isSubmitted}
            characters={characters}
            categories={categories}
            seriesList={seriesList}
          />

          <ItemImageFields
            control={control}
            errors={errors}
            disabled={isSubmitting}
            onError={setFormError}
          />

          <FormSection title="商品詳細資訊" description="以下欄位皆為選填">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="商品金額"
                hint="填寫日幣金額，前台顯示為 ¥1,800"
                error={errors.price?.message}
              >
                <Input type="number" placeholder="例：1800" {...register("price")} />
              </Field>
              <Field label="發售日期">
                <Input type="date" {...register("release_date")} />
              </Field>
            </div>

            <Field label="商品描述">
              <Textarea
                rows={3}
                placeholder="商品的簡短介紹…"
                {...register("description")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="商品規格">
                <Textarea
                  rows={2}
                  placeholder="例：約 H150 × W80 mm"
                  {...register("specification")}
                />
              </Field>
              <Field label="商品材質">
                <Textarea
                  rows={2}
                  placeholder="例：壓克力、合金"
                  {...register("material")}
                />
              </Field>
            </div>

            <Field
              label="官方連結／參考資料"
              error={errors.official_url?.message}
            >
              <Input
                type="url"
                placeholder="https://..."
                {...register("official_url")}
              />
            </Field>

            <Field
              label="備註說明"
              hint="會顯示在前台的補充說明，例：此款立牌為盲抽"
            >
              <Textarea
                rows={2}
                placeholder="給前台使用者看的補充說明…"
                {...register("note")}
              />
            </Field>
          </FormSection>
        </div>

        <ItemPublishSettings
          control={control}
          register={register}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/items")}
        />
      </div>
    </form>
  );
}
