import { memo } from "react";
import { Swords, Target, Shield, Flame, type LucideIcon } from "lucide-react";
import { SOLDIER_STATS, type SoldierType } from "@/states/soldier";
import type { TerrainEffect } from "@/lib/terrainEffect";

type Props = {
  troopType: SoldierType;
  terrainEffect: TerrainEffect | null;
};

type StatConfig = {
  key: "attack" | "defense" | "range" | "speed";
  label: string;
  icon: LucideIcon;
  iconColor: string;
};

const STATS_CONFIG: StatConfig[] = [
  { key: "attack", label: "攻撃", icon: Swords, iconColor: "text-red-400" },
  { key: "defense", label: "防御", icon: Shield, iconColor: "text-blue-400" },
  { key: "range", label: "射程", icon: Target, iconColor: "text-green-400" },
  { key: "speed", label: "速度", icon: Flame, iconColor: "text-yellow-400" },
];

export const TroopStats = memo(function TroopStats({
  troopType,
  terrainEffect,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {STATS_CONFIG.map(({ key, label, icon: Icon, iconColor }) => {
        const baseValue = SOLDIER_STATS[troopType][key];
        const effect = terrainEffect?.effects.find((e) => e.stat === key);

        return (
          <div key={key} className="flex items-center gap-1 text-slate-300">
            <Icon size={12} className={iconColor} />
            <span>{label}:</span>
            <span className="font-bold text-white">{baseValue}</span>
            {effect && (
              <span
                className={`font-bold text-xs ${
                  effect.change > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {effect.change > 0 ? "+" : ""}
                {effect.change}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});
