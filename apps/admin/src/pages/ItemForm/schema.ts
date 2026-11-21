import { z } from "zod";
import type { Control } from "react-hook-form";
import type { Category } from "@/services/categories";
import type { Character } from "@/services/characters";
import type { Series } from "@/services/series";

/**
 * existing 是已存在 R2 的圖片，new 是尚未上傳、只在記憶體裡的檔案。
 *
 * isDirty 依賴 RHF（7.92）的 deepEqual：File 沒有 own keys，會改用 Object.is 比對參照，
 * 而 defaultValues 的 clone 也保留 File 原參照，所以同一個 File 相等、不同 File 不相等。
 * 這是 RHF 內部行為，改資料模型或升級 RHF 時要回頭確認。
 */
export type FormImage =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File };

/** id 一律 crypto.randomUUID()，只給 dnd-kit 當 key，不代表圖片身分 */
export type GalleryImage = FormImage & { id: string };

/** 編輯頁載入時的 slug 與上架狀態，用來判斷改 slug 會不會讓前台舊網址失效 */
export interface ItemOriginal {
  slug: string;
  isActive: boolean;
}

interface BuildSlugParams {
  characterIds: string[];
  categoryId: string;
  seriesId: string;
  /** 商品修飾：商品名稱的一部分，例 tsunagaru、big */
  modifier: string;
  /** 款式：活動裡的哪一款，例 key-visual-a、tokyo、2 */
  variant: string;
  characters: Character[];
  categories: Category[];
  seriesList: Series[];
}

export const SLUG_LENGTH_HINT = 60;

export const SLUG_MODIFIER_SUGGESTIONS = [
  "tsunagaru",
  "yurugao",
  "big",
  "mini",
  "box",
  "set",
];

// 地名依北到南排列
export const SLUG_VARIANT_SUGGESTIONS = [
  "key-visual",
  "hashira-hyakkei",
  "common",
  "gotochi",
  "hokkaido",
  "tokyo",
  "ishikawa",
  "aichi",
  "kyoto",
  "osaka",
  "fukuoka",
  "kagoshima",
];

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
    .custom<FormImage | null>()
    .refine((image): image is FormImage => image !== null, "請上傳封面圖片"),
  gallery: z.array(z.custom<GalleryImage>()),
  // DB 是 bigint，小數送出會被拒絕
  price: z
    .string()
    .refine((v) => !v || Number(v) >= 0, "商品金額不可為負數")
    .refine((v) => !v || Number.isInteger(Number(v)), "商品金額須為整數"),
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

// categories.key 是 snake_case（acrylic_stand），且同時是前台 ?category= 的篩選值，不能改成連字號
export function toSlugSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 組出 {角色}-{類別}-{商品修飾}-{系列}-{款式}，缺少的區段直接略過。
 * 商品修飾是商品名稱的一部分（繋がる的 acrylic-stand），所以緊接在類別後。
 * 角色順序取自 characters 陣列本身（fetchCharacters 已依 display_order 排序），
 * 同一組角色才會永遠產生同一個 slug，不受使用者點選先後影響。
 */
export function buildSlug({
  characterIds,
  categoryId,
  seriesId,
  modifier,
  variant,
  characters,
  categories,
  seriesList,
}: BuildSlugParams): string {
  const characterSlugs = getCharacterSlugs(characterIds, characters);
  const categoryKey = categories.find((c) => c.id === categoryId)?.key;
  const seriesSlug = seriesList.find((s) => s.id === seriesId)?.slug;

  return [...characterSlugs, categoryKey, modifier, seriesSlug, variant]
    .filter((part): part is string => Boolean(part))
    .map(toSlugSegment)
    .filter(Boolean)
    .join("-");
}
