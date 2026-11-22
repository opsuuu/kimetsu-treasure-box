import { Controller, type FieldErrors } from "react-hook-form";
import { Field } from "./Field";
import { FormSection } from "./FormSection";
import { CoverUploader, GalleryUploader } from "./ImageUploader";
import type { ItemFormControl, ItemFormInput } from "../schema";

interface Props {
  control: ItemFormControl;
  errors: FieldErrors<ItemFormInput>;
  disabled: boolean;
  onError: (message: string) => void;
}

export function ItemImageFields({ control, errors, disabled, onError }: Props) {
  return (
    <FormSection title="商品圖片">
      <Field label="封面圖片" required error={errors.cover?.message}>
        <Controller
          control={control}
          name="cover"
          render={({ field }) => (
            <CoverUploader
              value={field.value}
              onChange={field.onChange}
              onError={onError}
              disabled={disabled}
            />
          )}
        />
      </Field>
      <Field label="其他圖片" hint="可拖曳縮圖調整顯示順序，滑鼠移上縮圖可刪除">
        <Controller
          control={control}
          name="gallery"
          render={({ field }) => (
            <GalleryUploader
              value={field.value}
              onChange={field.onChange}
              onError={onError}
              disabled={disabled}
            />
          )}
        />
      </Field>
    </FormSection>
  );
}
