import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

type ModalVariant = "default" | "danger" | "warning" | "success" | "info";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  variant?: ModalVariant;
};

const variantStyles: Record<ModalVariant, string> = {
  default: "bg-gray-100 text-gray-600",
  danger:  "bg-red-100 text-red-600",
  warning: "bg-yellow-100 text-yellow-600",
  success: "bg-green-100 text-green-600",
  info:    "bg-blue-100 text-blue-600",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  icon,
  variant = "default",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  variantStyles[variant],
                )}
              >
                {icon}
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {children && (
          <p className="text-sm text-muted-foreground">{children}</p>
        )}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
