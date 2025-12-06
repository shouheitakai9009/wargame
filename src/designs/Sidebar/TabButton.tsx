import { cn } from "@/lib/utils";

type Props = {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function TabButton({
  label,
  isActive,
  disabled = false,
  onClick,
}: Props) {
  const baseClasses = "flex-1 px-4 py-3 text-sm font-medium transition-colors";
  const activeClasses = isActive
    ? "bg-slate-700 text-white border-b-2 border-blue-500"
    : "text-slate-400 hover:text-white hover:bg-slate-700/50";
  const disabledClasses = disabled ? "text-slate-600 cursor-not-allowed" : "";

  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={cn(baseClasses, disabledClasses || activeClasses)}
    >
      {label}
    </button>
  );
}
