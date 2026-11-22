import { useMemo } from "react";
import { useNavigate } from "react-router";
import { ImageUploadError, useUpdateItem } from "@/hooks";
import type { Character } from "@/services/characters";
import {
  ITEM_CONFLICT,
  ITEM_NOT_FOUND,
  SLUG_TAKEN_MESSAGE,
  hasErrorCode,
  hasServerErrorCode,
  isSlugConflict,
  isSlugTaken,
  type ItemForEdit,
} from "@/services/items";
import { ItemForm, type SubmitResult } from "@/pages/ItemForm";
import {
  getCharacterSlugs,
  type ItemFormOutput,
} from "@/pages/ItemForm/schema";
import { toFormValues } from "../toFormValues";

interface ItemEditFormProps {
  item: ItemForEdit;
  characters: Character[];
  onReload: () => void;
}

export function ItemEditForm({ item, characters, onReload }: ItemEditFormProps) {
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
    // 沒有 code 代表伺服器可能已經 commit，不能當成儲存失敗
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
