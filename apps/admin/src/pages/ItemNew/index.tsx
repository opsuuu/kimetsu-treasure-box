import { useQuery } from "@tanstack/react-query";
import { useCreateItem, toErrorMessage } from "@/hooks";
import { fetchCharacters } from "@/services/characters";
import {
  SLUG_TAKEN_MESSAGE,
  isSlugConflict,
  isSlugTaken,
} from "@/services/items";
import { ItemForm, type SubmitResult } from "@/pages/ItemForm";
import {
  getCharacterSlugs,
  itemFormDefaults,
  type FormImage,
  type ItemFormOutput,
} from "@/pages/ItemForm/schema";

// 新增頁的預設值沒有既有圖片，上傳元件也只會產生 new，走到 existing 代表資料流出錯
function toNewFile(image: FormImage): File {
  if (image.kind !== "new") throw new Error("新增商品不應包含既有圖片");
  return image.file;
}

export default function ItemNewPage() {
  // 與 ItemForm 共用 query cache，不會多打一次 API
  const { data: characters = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });

  const { mutation, createdItemId } = useCreateItem();

  async function submitItem(values: ItemFormOutput): Promise<SubmitResult> {
    const { cover, gallery, ...itemValues } = values;

    // 商品已經建立過的重送只需要補圖片，slug 就是它自己，不必再查重
    if (!createdItemId.current) {
      try {
        if (await isSlugTaken(values.slug)) {
          return { ok: false, field: "slug", message: SLUG_TAKEN_MESSAGE };
        }
      } catch (error) {
        return {
          ok: false,
          message: toErrorMessage(error, "網址名稱檢查失敗，請稍後再試"),
        };
      }
    }

    try {
      await mutation.mutateAsync({
        values: itemValues,
        cover: toNewFile(cover),
        gallery: gallery.map(toNewFile),
        characterSlugs: getCharacterSlugs(values.character_ids, characters),
      });
      return { ok: true };
    } catch (error) {
      if (isSlugConflict(error)) {
        return { ok: false, field: "slug", message: SLUG_TAKEN_MESSAGE };
      }
      return {
        ok: false,
        message: createdItemId.current
          ? `${toErrorMessage(error, "其他圖片儲存失敗")}（商品已建立，可直接再次送出補上圖片）`
          : toErrorMessage(error, "儲存失敗，請稍後再試"),
      };
    }
  }

  return (
    <ItemForm
      title="新增週邊"
      defaultValues={itemFormDefaults}
      initialSlugAutoGenerate
      onSubmit={submitItem}
    />
  );
}
