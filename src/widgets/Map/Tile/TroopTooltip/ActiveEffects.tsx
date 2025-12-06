import { memo } from "react";
import { Swords, Target, Shield, Flame, type LucideIcon } from "lucide-react";
import type { TerrainEffect } from "@/lib/terrainEffect";

type Props = {
  terrainEffect: TerrainEffect | null;
};

const STAT_ICON_MAP: Record<string, LucideIcon> = {
  attack: Swords,
  defense: Shield,
  range: Target,
  speed: Flame,
};

export const ActiveEffects = memo(function ActiveEffects({
  terrainEffect,
}: Props) {
  return (
    <div className="border-l border-slate-700 pl-3 min-w-[100px]">
      <h4 className="text-slate-400 text-xs font-medium mb-2">
        かかっている効果
      </h4>
      {terrainEffect ? (
        <div className="flex flex-col gap-2">
          {/* 地形名 */}
          <div className="text-white text-sm font-bold">
            {terrainEffect.name}
          </div>
          {/* ステータス変化 */}
          <div className="flex flex-col gap-1">
            {terrainEffect.effects.map((effect) => {
              const StatIcon = STAT_ICON_MAP[effect.stat];
              const isPositive = effect.change > 0;
              const isNegative = effect.change < 0;

              return (
                <div
                  key={effect.stat}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <StatIcon
                    size={14}
                    className={
                      isPositive
                        ? "text-green-400"
                        : isNegative
                        ? "text-red-400"
                        : "text-slate-400"
                    }
                  />
                  <span
                    className={`font-bold font-mono ${
                      isPositive
                        ? "text-green-400"
                        : isNegative
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {effect.change}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-xs">なし</p>
      )}
    </div>
  );
});
