import { cn } from "@/lib/utils";

type Props = {
  label: string;
  onClick: () => void;
  checked?: boolean;
  disabled?: boolean;
  variant?: "default" | "danger";
};

export function ContextMenuItem({
  label,
  onClick,
  checked = false,
  disabled = false,
  variant = "default",
}: Props) {
  const baseClasses =
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors";

  const variantClasses =
    variant === "danger"
      ? "hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-50"
      : "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50";

  const disabledClasses = disabled ? "pointer-events-none opacity-50" : "";

  return (
    <div
      className={cn(baseClasses, variantClasses, disabledClasses)}
      onClick={onClick}
    >
      {label}
      {checked && " ✓"}
    </div>
  );
}
