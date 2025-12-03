import type { LucideIcon } from "lucide-react";
import { Crown, Swords, Target, Shield, Flame } from "lucide-react";
import { SOLDIER_STATS, type SoldierType } from "../../../states/soldier";
import { TroopCard } from "./TroopCard";

const ICON_MAP: Record<SoldierType, LucideIcon> = {
  GENERAL: Crown,
  INFANTRY: Swords,
  ARCHER: Target,
  SHIELD: Shield,
  CAVALRY: Flame,
};

export function SoldierPlacement() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 px-4 pt-4">兵配置</h2>
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-1 gap-4 py-2">
          {(Object.keys(SOLDIER_STATS) as SoldierType[]).map((type) => (
            <TroopCard
              key={type}
              type={type}
              name={SOLDIER_STATS[type].name}
              icon={ICON_MAP[type]}
              stats={SOLDIER_STATS[type]}
              theme={SOLDIER_STATS[type].theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
