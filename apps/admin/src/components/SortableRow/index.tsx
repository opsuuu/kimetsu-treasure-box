import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  id: string;
  disabled?: boolean;
  children: (handleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}

export function SortableRow({ id, disabled = false, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleProps = {
    ...attributes,
    ...listeners,
    style: { cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab' },
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-gray-50 transition-colors',
        isDragging && 'opacity-50 bg-gray-50',
      )}
    >
      <td className="px-2 py-3 w-8">
        <div
          {...handleProps}
          className={cn(
            'flex items-center justify-center text-gray-300 transition-colors',
            disabled ? 'opacity-40' : 'hover:text-gray-500',
          )}
        >
          <GripVertical size={16} />
        </div>
      </td>
      {children(handleProps)}
    </tr>
  );
}
