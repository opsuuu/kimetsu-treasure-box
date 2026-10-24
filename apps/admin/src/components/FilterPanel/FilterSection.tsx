import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface Props {
  title: string;
  children: ReactNode;
}

export function FilterSection({ title, children }: Props) {
  return (
    <div>
      <Label className="mb-2 text-gray-600">{title}</Label>
      {children}
    </div>
  );
}
