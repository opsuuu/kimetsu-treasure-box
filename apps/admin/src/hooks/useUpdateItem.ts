import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  hasServerErrorCode,
  updateItem,
  type ItemFormValues,
} from "@/services/items";
import { deleteItemImage, uploadItemImage } from "@/services/storage";
import type { FormImage } from "@/pages/ItemForm/schema";
import { toErrorMessage } from "./useCreateItem";

export interface UpdateItemInput {
  id: string;
  expectedUpdatedAt: string;
  values: ItemFormValues;
  cover: FormImage;
  gallery: FormImage[];
  characterSlugs: string[];
}

/** 上傳階段就失敗，DB 還沒有被寫入 */
export class ImageUploadError extends Error {
  constructor(cause: unknown) {
    super(toErrorMessage(cause, "圖片上傳失敗"), { cause });
    this.name = "ImageUploadError";
  }
}

async function discardUploads(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map((url) => deleteItemImage(url).catch(() => undefined)),
  );
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      expectedUpdatedAt,
      values,
      cover,
      gallery,
      characterSlugs,
    }: UpdateItemInput): Promise<void> => {
      const images = [cover, ...gallery];
      // 不能用 Promise.all：一張失敗就 reject，之後才傳完的檔拿不到網址，會變成清不掉的孤兒檔。
      // 最終順序由 images 的 index 決定，跟哪張先傳完無關
      const results = await Promise.allSettled(
        images.map((image) =>
          image.kind === "existing"
            ? Promise.resolve(image.url)
            : uploadItemImage(image.file, characterSlugs),
        ),
      );

      const urls: string[] = [];
      // 這一輪新上傳、還沒被任何資料列引用的檔案
      const uploaded: string[] = [];
      const failures: unknown[] = [];
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          failures.push(result.reason);
          return;
        }
        urls.push(result.value);
        if (images[i].kind === "new") uploaded.push(result.value);
      });

      if (failures.length > 0) {
        await discardUploads(uploaded);
        throw new ImageUploadError(failures[0]);
      }

      const [coverUrl, ...imageUrls] = urls;
      let removedUrls: string[];
      try {
        removedUrls = await updateItem({
          id,
          expectedUpdatedAt,
          values,
          coverUrl,
          imageUrls,
        });
      } catch (error) {
        // 沒有 code 代表伺服器可能已經 commit，刪掉剛上傳的檔會讓前台破圖；最壞只是留下孤兒檔
        if (hasServerErrorCode(error)) await discardUploads(uploaded);
        throw error;
      }

      // 商品已經儲存，舊檔刪不掉只會留下孤兒檔，不必讓使用者等待或看到錯誤
      for (const url of removedUrls) {
        deleteItemImage(url).catch((error: unknown) => {
          console.error(`R2 舊圖刪除失敗：${url}`, error);
        });
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-item", id] });
    },
  });
}
