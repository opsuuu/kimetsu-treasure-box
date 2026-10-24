import { z } from "zod";
import type { Control } from "react-hook-form";
import type { Category } from "@/services/categories";
import type { Character } from "@/services/characters";
import type { Series } from "@/services/series";

/** 其他圖片送出前只存在記憶體，需要穩定 id 才能做拖曳排序 */
export interface GalleryImage {
  id: string;
  file: File;
}

interface BuildSlugParams {
  characterIds: string[];
  categoryId: string;
  seriesId: string;
  characters: Character[];
  categories: Category[];
  seriesList: Series[];
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const itemFormSchema = z.object({
  name_jp: z.string().trim().min(1, "請輸入日文名稱"),
  name_tw: z.string(),
  category_id: z.string(),
  series_id: z.string(),
  character_ids: z.array(z.string()).min(1, "請至少選擇一位角色"),
  slug: z
    .string()
    .trim()
    .min(1, "請輸入網址名稱")
    .regex(/^[a-z0-9-]+$/, "僅允許小寫英文字母、數字與連字號"),
  cover: z
    .custom<File | null>()
    .refine((file): file is File => file instanceof File, "請上傳封面圖片"),
  gallery: z.array(z.custom<GalleryImage>()),
  price: z.string().refine((v) => !v || Number(v) >= 0, "商品金額不可為負數"),
  release_date: z.string(),
  description: z.string(),
  specification: z.string(),
  material: z.string(),
  official_url: z
    .string()
    .refine(
      (v) => !v || /^https?:\/\/\S+$/.test(v),
      "請輸入 http:// 或 https:// 開頭的網址",
    ),
  note: z.string(),
  is_active: z.boolean(),
  display_order: z.string(),
});

export type ItemFormInput = z.input<typeof itemFormSchema>;
export type ItemFormOutput = z.output<typeof itemFormSchema>;

export const itemFormDefaults: ItemFormInput = {
  name_jp: "",
  name_tw: "",
  category_id: "",
  series_id: "",
  character_ids: [],
  slug: "",
  cover: null,
  gallery: [],
  price: "",
  release_date: "",
  description: "",
  specification: "",
  material: "",
  official_url: "",
  note: "",
  is_active: true,
  display_order: "",
};

export type ItemFormControl = Control<ItemFormInput, unknown, ItemFormOutput>;

/** 順序跟著 characters 陣列，而非 characterIds 的點選順序 */
export function getCharacterSlugs(
  characterIds: string[],
  characters: Character[],
): string[] {
  return characters
    .filter((c) => characterIds.includes(c.id))
    .map((c) => c.slug);
}

/**
 * 組出 {角色}-{類別}-{系列}，缺少的區段直接略過。
 * 角色順序取自 characters 陣列本身（fetchCharacters 已依 display_order 排序），
 * 同一組角色才會永遠產生同一個 slug，不受使用者點選先後影響。
 */
export function buildSlug({
  characterIds,
  categoryId,
  seriesId,
  characters,
  categories,
  seriesList,
}: BuildSlugParams): string {
  const characterSlugs = getCharacterSlugs(characterIds, characters);
  const categoryKey = categories.find((c) => c.id === categoryId)?.key;
  const seriesSlug = seriesList.find((s) => s.id === seriesId)?.slug;

  return [...characterSlugs, categoryKey, seriesSlug]
    .filter((part): part is string => Boolean(part))
    .join("-");
}
