import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUploadError, useUpdateItem } from "@/hooks";
import { fetchCategories } from "@/services/categories";
import { fetchCharacters, type Character } from "@/services/characters";
import { fetchSeries } from "@/services/series";
import {
  ITEM_CONFLICT,
  ITEM_NOT_FOUND,
  SLUG_TAKEN_MESSAGE,
  fetchItemForEdit,
  hasErrorCode,
  hasServerErrorCode,
  isSlugConflict,
  isSlugTaken,
  type ItemForEdit,
} from "@/services/items";
import { ItemForm, type SubmitResult } from "@/pages/ItemForm";
import {
  getCharacterSlugs,
  type ItemFormInput,
  type ItemFormOutput,
} from "@/pages/ItemForm/schema";

function toFormValues(item: ItemForEdit): ItemFormInput {
  return {
    name_jp: item.name_jp,
    name_tw: item.name_tw ?? "",
    category_id: item.category_id ?? "",
    series_id: item.series_id ?? "",
    character_ids: item.item_characters.map((c) => c.character_id),
    slug: item.slug,
    cover: item.image_cover_url
      ? { kind: "existing", url: item.image_cover_url }
      : null,
    gallery: item.item_images.map((image) => ({
      kind: "existing",
      url: image.image_url,
      id: crypto.randomUUID(),
    })),
    price: item.price === null ? "" : String(item.price),
    release_date: item.release_date ?? "",
    description: item.description ?? "",
    specification: item.specification ?? "",
    material: item.material ?? "",
    official_url: item.official_url ?? "",
    note: item.note ?? "",
    is_active: item.is_active,
  };
}

function PageMessage({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-gray-400">
      {message}
      {actionLabel && onAction && (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ItemEditFormProps {
  item: ItemForEdit;
  characters: Character[];
  onReload: () => void;
}

function ItemEditForm({ item, characters, onReload }: ItemEditFormProps) {
  const navigate = useNavigate();
  const mutation = useUpdateItem();
  // 只在 mount 時算一次，gallery 的 id 才不會每次 render 都換掉
  const defaultValues = useMemo(() => toFormValues(item), [item]);

  function toSubmitError(error: unknown): SubmitResult {
    if (error instanceof ImageUploadError) {
      return { ok: false, message: `圖片上傳失敗：${error.message}` };
    }
    if (isSlugConflict(error)) {
      return { ok: false, field: "slug", message: SLUG_TAKEN_MESSAGE };
    }
    if (hasErrorCode(error, ITEM_CONFLICT)) {
      return {
        ok: false,
        message: "此商品已被其他人更新，重新載入會捨棄你目前的修改",
        action: { label: "重新載入", onClick: onReload },
      };
    }
    if (hasErrorCode(error, ITEM_NOT_FOUND)) {
      return {
        ok: false,
        message: "此商品已被刪除",
        action: {
          label: "回到列表",
          onClick: () => navigate("/items"),
          leave: true,
        },
      };
    }
    // 第一次其實已經 commit 的話，重新載入前再送一次會得到 KT409，一樣會引導使用者重新載入
    if (!hasServerErrorCode(error)) {
      return {
        ok: false,
        message: "無法確認是否已儲存，請重新載入確認",
        action: { label: "重新載入", onClick: onReload },
      };
    }
    return { ok: false, message: "儲存失敗，請稍後再試" };
  }

  async function submitItem(values: ItemFormOutput): Promise<SubmitResult> {
    const { cover, gallery, ...itemValues } = values;

    if (values.slug !== item.slug) {
      try {
        if (await isSlugTaken(values.slug)) {
          return { ok: false, field: "slug", message: SLUG_TAKEN_MESSAGE };
        }
      } catch {
        // 查重只是為了省掉白傳的圖片，真正的檢查是 RPC 的 23505，查詢失敗不擋送出
      }
    }

    try {
      await mutation.mutateAsync({
        id: item.id,
        expectedUpdatedAt: item.updated_at,
        values: itemValues,
        cover,
        gallery,
        characterSlugs: getCharacterSlugs(values.character_ids, characters),
      });
      return { ok: true };
    } catch (error) {
      return toSubmitError(error);
    }
  }

  return (
    <ItemForm
      title="編輯週邊"
      defaultValues={defaultValues}
      initialSlugAutoGenerate={false}
      original={{ slug: item.slug, isActive: item.is_active }}
      onSubmit={submitItem}
    />
  );
}

export default function ItemEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const itemQuery = useQuery({
    queryKey: ["admin-item", id],
    queryFn: () => fetchItemForEdit(id),
    // 表單以 updated_at 當 key，背景重抓到新版本會 remount 並丟掉未儲存的修改；
    // 別人改過的情況交給送出時的 KT409 處理
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 每次進入都重新載入，避免先顯示快取的舊版本、背景重抓完又 remount 一次
    gcTime: 0,
  });
  // 與 ItemForm 使用相同的 query key，表單 mount 時直接讀 cache
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const charactersQuery = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });
  const seriesQuery = useQuery({
    queryKey: ["series"],
    queryFn: fetchSeries,
  });

  // 重新載入後 updated_at 變了，表單跟著 key 改變而 remount；沒變則保留目前的修改
  async function reload() {
    const result = await itemQuery.refetch();
    if (result.isError) toast.error("重新載入失敗，請稍後再試");
  }

  const queries = [itemQuery, categoriesQuery, charactersQuery, seriesQuery];
  // 已經有資料、只是重新載入失敗的不算，由 reload() 提示
  const failedQueries = queries.filter((q) => q.isError && q.data === undefined);
  if (failedQueries.length > 0) {
    return (
      <PageMessage
        message="載入失敗，請稍後再試"
        actionLabel="重試"
        onAction={() => failedQueries.forEach((q) => void q.refetch())}
      />
    );
  }

  const item = itemQuery.data;
  if (item === null) {
    return (
      <PageMessage
        message="找不到這筆商品"
        actionLabel="回到列表"
        onAction={() => navigate("/items")}
      />
    );
  }

  const characters = charactersQuery.data;
  // 清單全部載完才 mount 表單，ItemForm 的下拉選單與 slug 自動產生才不會拿到空清單
  if (!item || !categoriesQuery.data || !characters || !seriesQuery.data) {
    return <PageMessage message="載入中..." />;
  }

  return (
    <ItemEditForm
      key={item.updated_at}
      item={item}
      characters={characters}
      onReload={() => void reload()}
    />
  );
}
