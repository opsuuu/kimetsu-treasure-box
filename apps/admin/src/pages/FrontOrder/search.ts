import type { ReleaseDateGroup, ReleaseDateItem } from "@/services/items";

export const NO_RELEASE_DATE_LABEL = "未填發售日";

export const releaseDateLabel = (releaseDate: string | null) =>
  releaseDate ?? NO_RELEASE_DATE_LABEL;

// 全形半形、大小寫都視為相同
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

/** 空白分隔的每個詞都要命中 */
export const toTokens = (query: string) =>
  normalize(query).split(/\s+/).filter(Boolean);

// 日期可以打 2024、02-08 或 20240208
const dateText = (releaseDate: string | null) => {
  const label = releaseDateLabel(releaseDate);
  return normalize(`${label} ${label.replaceAll("-", "")}`);
};

const itemText = (item: ReleaseDateItem) =>
  normalize(
    [
      item.name_jp,
      item.name_tw,
      item.series?.name_tw,
      item.series?.name_jp,
      item.categories?.name_tw,
      ...item.item_characters.map((ic) => ic.characters?.name),
    ]
      .filter(Boolean)
      .join(" "),
  );

/** 每個詞命中日期或商品其中之一，且至少一個詞命中商品本身，才算這個商品被搜到 */
export function isItemHit(
  item: ReleaseDateItem,
  releaseDate: string | null,
  tokens: string[],
): boolean {
  if (tokens.length === 0) return false;
  const date = dateText(releaseDate);
  const text = itemText(item);
  return (
    tokens.every((t) => date.includes(t) || text.includes(t)) &&
    tokens.some((t) => text.includes(t))
  );
}

export interface GroupMatch {
  group: ReleaseDateGroup;
  /** 靠商品命中時，列出命中的商品，讓清單說明為什麼這組會出現 */
  hits: ReleaseDateItem[];
}

export function matchGroups(
  groups: ReleaseDateGroup[],
  tokens: string[],
): GroupMatch[] {
  return groups.flatMap((group) => {
    if (tokens.length === 0) return [{ group, hits: [] }];
    const date = dateText(group.releaseDate);
    if (tokens.every((t) => date.includes(t))) return [{ group, hits: [] }];
    const hits = group.items.filter((item) =>
      isItemHit(item, group.releaseDate, tokens),
    );
    return hits.length > 0 ? [{ group, hits }] : [];
  });
}
