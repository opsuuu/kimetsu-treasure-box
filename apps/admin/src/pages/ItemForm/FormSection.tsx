import { type ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        )}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  );
}
