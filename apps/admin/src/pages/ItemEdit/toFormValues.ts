import type { ItemForEdit } from "@/services/items";
import type { ItemFormInput } from "@/pages/ItemForm/schema";

export function toFormValues(item: ItemForEdit): ItemFormInput {
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
