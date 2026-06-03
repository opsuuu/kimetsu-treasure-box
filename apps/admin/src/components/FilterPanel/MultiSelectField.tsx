import { XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  id: string;
  label: string;
}

interface Props {
  placeholder: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelectField({ placeholder, options, value, onChange }: Props) {
  const selected = options.filter((o) => value.includes(o.id));
  const remaining = options.filter((o) => !value.includes(o.id));

  function add(id: string) {
    if (!value.includes(id)) onChange([...value, id]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div>
      <Select value="" onValueChange={add}>
        <SelectTrigger className="w-full bg-gray-50 focus:ring-giyu/20 focus:border-giyu">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
          {remaining.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <Badge key={o.id} variant="outline" className="gap-1 text-gray-700">
              {o.label}
              <button
                onClick={() => remove(o.id)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <XCircle size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
