import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItem, createItemImages, type ItemFormValues } from "@/services/items";
import { deleteItemImage, uploadItemImage } from "@/services/storage";

export interface CreateItemInput {
  values: ItemFormValues;
  cover: File;
  gallery: File[];
  characterSlugs: string[];
}

export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  // 跨次送出存活：商品建立成功後即使後續步驟失敗也不會重建，避免重送時撞 slug 唯一限制
  const createdItemId = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      values,
      cover,
      gallery,
      characterSlugs,
    }: CreateItemInput): Promise<string> => {
      // 已上傳到 R2、但還沒被任何資料列引用的檔案
      const orphans: string[] = [];

      async function uploadGallery(): Promise<string[]> {
        const urls: string[] = [];
        for (const file of gallery) {
          const url = await uploadItemImage(file, characterSlugs);
          orphans.push(url);
          urls.push(url);
        }
        return urls;
      }

      try {
        if (createdItemId.current) {
          await createItemImages(createdItemId.current, await uploadGallery());
          return createdItemId.current;
        }

        const coverUrl = await uploadItemImage(cover, characterSlugs);
        orphans.push(coverUrl);
        const galleryUrls = await uploadGallery();

        const itemId = await createItem(values, coverUrl);
        createdItemId.current = itemId;
        // 封面已被 image_cover_url 引用，不再是孤檔
        orphans.splice(orphans.indexOf(coverUrl), 1);

        await createItemImages(itemId, galleryUrls);
        return itemId;
      } catch (error) {
        await Promise.all(
          orphans.map((url) => deleteItemImage(url).catch(() => undefined)),
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
    },
  });

  return { mutation, createdItemId };
}
