import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type GalleryImage,
} from "./schema";

interface Preview {
  url: string;
  width: number;
  height: number;
}

interface EmptySlotProps {
  label: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface RemoveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  alwaysVisible?: boolean;
}

interface SortableThumbProps {
  image: GalleryImage;
  order: number;
  onRemove: () => void;
  disabled?: boolean;
}

interface CoverUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

interface GalleryUploaderProps {
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

/** 低於此寬度的圖放到前台主圖會糊掉，提醒管理者自行換圖 */
const LOW_RESOLUTION_WIDTH = 800;

function usePreview(file: File | null): Preview | null {
  const [loaded, setLoaded] = useState<{ file: File; preview: Preview } | null>(
    null,
  );

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) {
        setLoaded({
          file,
          preview: { url, width: probe.naturalWidth, height: probe.naturalHeight },
        });
      }
    };
    probe.onerror = () => {
      if (!cancelled) setLoaded({ file, preview: { url, width: 0, height: 0 } });
    };
    probe.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // 只回傳屬於目前 file 的預覽，否則換圖時 <img> 會短暫指向已經 revoke 的舊網址
  return loaded?.file === file ? loaded.preview : null;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `「${file.name}」格式不支援，僅接受 JPG、PNG 或 WebP`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `「${file.name}」超過 5 MB，請壓縮後再上傳`;
  }
  return null;
}

function EmptySlot({ label, className, onClick, disabled }: EmptySlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 text-gray-400 transition-colors",
        "hover:border-giyu/40 hover:bg-giyu/5 hover:text-giyu",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <ImagePlus size={20} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function RemoveButton({ onClick, disabled, alwaysVisible }: RemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-sm transition-opacity hover:bg-red-500 disabled:pointer-events-none",
        alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      )}
    >
      <X size={12} />
    </button>
  );
}

function SortableThumb({ image, order, onRemove, disabled }: SortableThumbProps) {
  const preview = usePreview(image.file);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative h-28 w-28 overflow-hidden rounded-xl border border-gray-200 bg-gray-50",
        isDragging && "z-10 opacity-60",
      )}
    >
      {preview && (
        <img
          src={preview.url}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* 排序徽章 */}
      <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/45 text-[10px] font-bold text-white backdrop-blur-sm">
        {order}
      </span>

      {/* 刪除 */}
      <RemoveButton onClick={onRemove} disabled={disabled} />

      {/* 拖曳握把 */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/40 py-1 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
      >
        <GripVertical size={12} />
        <span className="text-[10px] font-medium">拖曳排序</span>
      </div>
    </div>
  );
}

export function CoverUploader({
  value,
  onChange,
  onError,
  disabled,
}: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = usePreview(value);
  const isLowResolution =
    preview !== null && preview.width > 0 && preview.width < LOW_RESOLUTION_WIDTH;

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 清掉 value，否則同一個檔案第二次選取不會觸發 change
    event.target.value = "";
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }
    onChange(file);
  }

  return (
    <div className="flex items-start gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleSelect}
      />

      {value ? (
        <div className="group relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {preview && (
            <img src={preview.url} alt="" className="h-full w-full object-cover" />
          )}
          <RemoveButton onClick={() => onChange(null)} disabled={disabled} />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:pointer-events-none"
          >
            更換圖片
          </button>
        </div>
      ) : (
        <EmptySlot
          label="上傳封面"
          className="h-36 w-36 shrink-0"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        />
      )}

      <div className="pt-1 text-xs text-gray-400">
        <p>顯示於後台列表、前台商品卡片與詳細頁主圖。</p>
        <p className="mt-1">建議正方形、JPG／PNG／WebP，單張 5 MB 內。</p>
        {preview && preview.width > 0 && (
          <p className={cn("mt-1", isLowResolution && "text-amber-600")}>
            尺寸 {preview.width} × {preview.height}
            {isLowResolution && "，解析度偏低，建議改用更大的圖"}
          </p>
        )}
      </div>
    </div>
  );
}

export function GalleryUploader({
  value,
  onChange,
  onError,
  disabled,
}: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const accepted: GalleryImage[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        onError(error);
        continue;
      }
      accepted.push({ id: crypto.randomUUID(), file });
    }

    if (accepted.length > 0) onChange([...value, ...accepted]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = value.findIndex((image) => image.id === active.id);
    const newIndex = value.findIndex((image) => image.id === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleSelect}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((image) => image.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-3">
            {value.map((image, index) => (
              <SortableThumb
                key={image.id}
                image={image}
                order={index + 1}
                onRemove={() =>
                  onChange(value.filter((item) => item.id !== image.id))
                }
                disabled={disabled}
              />
            ))}
            <EmptySlot
              label="新增圖片"
              className="h-28 w-28"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            />
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
