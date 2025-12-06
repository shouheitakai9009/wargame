import { ChevronRight } from "lucide-react";
import { ARMY_DIRECTION, type ArmyDirection } from "@/states/army";
import type { Army } from "@/states/army";

type Props = {
  belongingArmy: Army;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectDirection: (direction: ArmyDirection) => void;
};

const DIRECTION_LABELS: Record<keyof typeof ARMY_DIRECTION, string> = {
  UP: "上",
  DOWN: "下",
  LEFT: "左",
  RIGHT: "右",
};

export function DirectionSubMenu({
  belongingArmy,
  isOpen,
  onOpenChange,
  onSelectDirection,
}: Props) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <div className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800">
        向き
        <ChevronRight className="ml-auto h-4 w-4" />
      </div>

      {/* サブメニュー内容 */}
      {isOpen && (
        <div
          className="absolute left-full top-0 z-10000 min-w-32 rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ marginLeft: "-1px" }}
          onMouseEnter={() => onOpenChange(true)}
          onMouseLeave={() => onOpenChange(false)}
        >
          {Object.entries(ARMY_DIRECTION).map(([key, value]) => (
            <div
              key={key}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              onClick={() => onSelectDirection(value)}
            >
              {DIRECTION_LABELS[key as keyof typeof ARMY_DIRECTION]}
              {belongingArmy.direction === value && " ✓"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
