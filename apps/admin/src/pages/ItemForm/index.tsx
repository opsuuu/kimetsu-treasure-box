import { useRef, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/Modal";
import { useUnsavedChangesGuard } from "@/hooks";
import { fetchCategories } from "@/services/categories";
import { fetchCharacters } from "@/services/characters";
import { fetchSeries } from "@/services/series";
import { FormSection } from "./components/FormSection";
import { Field } from "./components/Field";
import { ItemBasicFields } from "./components/ItemBasicFields";
import { SlugField } from "./components/SlugField";
import { ItemImageFields } from "./components/ItemImageFields";
import { ItemPublishSettings } from "./components/ItemPublishSettings";
import {
  itemFormSchema,
  type ItemFormInput,
  type ItemFormOutput,
  type ItemOriginal,
} from "./schema";

interface FormErrorAction {
  label: string;
  onClick: () => void;
  /** true = 按下後會離開這頁，先解除未儲存提示 */
  leave?: boolean;
}

export type SubmitResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      field?: "slug";
      action?: FormErrorAction;
    };

interface FormError {
  message: string;
  action?: FormErrorAction;
}

interface ItemFormProps {
  title: string;
  defaultValues: ItemFormInput;
  initialSlugAutoGenerate: boolean;
  /** 載入時的 slug 與上架狀態，用來判斷是否顯示「舊網址會失效」警告；新增頁不傳 */
  original?: ItemOriginal;
  onSubmit: (values: ItemFormOutput) => Promise<SubmitResult>;
}

/** 新增頁與編輯頁共用的表單；送出邏輯由外殼提供，成功後的導頁統一在這裡處理 */
export function ItemForm({
  title,
  defaultValues,
  initialSlugAutoGenerate,
  original,
  onSubmit,
}: ItemFormProps) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<FormError | null>(null);
  // isSubmitting 要等 re-render 才會擋住按鈕，同步鎖確保同一時間只跑一次送出流程
  const submittingRef = useRef(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  // 只列啟用中的，加上 defaultValues 引用到的停用項目，編輯頁才能顯示並換掉它們。
  // 新增頁的預設值是空的，所以只會看到啟用中的
  const { data: characters = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
    select: (list) =>
      list.filter(
        (c) => c.is_active || defaultValues.character_ids.includes(c.id),
      ),
  });
  const { data: seriesList = [] } = useQuery({
    queryKey: ["series"],
    queryFn: fetchSeries,
    select: (list) =>
      list.filter((s) => s.is_active || s.id === defaultValues.series_id),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isSubmitted, isDirty },
  } = useForm<ItemFormInput, unknown, ItemFormOutput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues,
  });

  // 送出中也要攔：離開後 submitItem 仍在背景執行，成功時的 navigate 會把使用者從別頁拉回列表
  const { blocker, allowLeave } = useUnsavedChangesGuard(isDirty);

  async function submitItem(values: ItemFormOutput) {
    setFormError(null);
    const result = await onSubmit(values);

    if (result.ok) {
      allowLeave();
      toast.success("已儲存");
      // 列表依最近更新排序，回到列表第 1 頁就能看到剛儲存的商品
      navigate("/items");
      return;
    }

    if (result.field === "slug") {
      setError("slug", { message: result.message });
    }
    setFormError({ message: result.message, action: result.action });
  }

  async function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
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

  function handleErrorAction(action: FormErrorAction) {
    if (action.leave) allowLeave();
    // 重新載入後資料沒變時表單不會 remount，不先清掉的話橫幅會一直停在畫面上
    setFormError(null);
    action.onClick();
  }

  return (
    <form onSubmit={handleFormSubmit}>
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
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            標記 <span className="text-red-500">*</span> 為必填欄位
          </p>
        </div>
      </div>

      {/* 錯誤橫幅 */}
      {formError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="flex-1">{formError.message}</span>
          {formError.action && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => formError.action && handleErrorAction(formError.action)}
            >
              {formError.action.label}
            </Button>
          )}
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
            initialAutoGenerate={initialSlugAutoGenerate}
            original={original}
          />

          <ItemImageFields
            control={control}
            errors={errors}
            disabled={isSubmitting}
            onError={(message) => setFormError({ message })}
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

            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-0.5 size-4 cursor-pointer accent-giyu"
                {...register("is_blind_box")}
              />
              <span>
                <span className="block text-sm font-medium text-gray-600">
                  盲抽商品
                </span>
                <span className="block text-[11px] text-gray-400">
                  勾選後前台顯示「盲抽」標籤
                </span>
              </span>
            </label>

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
              hint="會顯示在前台的補充說明，例：會場限定販售、附贈特典"
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
          isSubmitting={isSubmitting}
          isDirty={isDirty}
          onCancel={() => navigate("/items")}
        />
      </div>

      {/* 未儲存離開確認 */}
      <Modal
        open={blocker.state === "blocked"}
        onClose={() => blocker.reset?.()}
        title="尚未儲存"
        variant="warning"
        icon={<TriangleAlert size={18} />}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => blocker.reset?.()}
            >
              留在此頁
            </Button>
            <Button type="button" onClick={() => blocker.proceed?.()}>
              確定離開
            </Button>
          </>
        }
      >
        有未儲存的修改，確定離開？
      </Modal>
    </form>
  );
}
