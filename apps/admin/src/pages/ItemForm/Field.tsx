import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, error, children }: Props) {
  return (
    <div>
      <Label className="mb-2 text-gray-600">
        {label}
        {required && <span className="-ms-1 text-red-500">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}
