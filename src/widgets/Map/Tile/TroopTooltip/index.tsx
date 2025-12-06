import { memo } from "react";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/designs/ui/tooltip";
import { Shield, type LucideIcon } from "lucide-react";
import { SOLDIER_STATS } from "@/states/soldier";
import type { TerrainEffect } from "@/lib/terrainEffect";
import type { PlacedTroop } from "@/lib/placement";
import { TroopStats } from "./TroopStats";
import { ActiveEffects } from "./ActiveEffects";

type Props = {
  troopOnTile: PlacedTroop;
  terrainEffect: TerrainEffect | null;
  TroopIcon: LucideIcon;
  children: React.ReactNode;
};

export const TroopTooltip = memo(function TroopTooltip({
  troopOnTile,
  terrainEffect,
  TroopIcon,
  children,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className="p-0 border-0 bg-transparent shadow-none"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex gap-2 bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-xl">
          {/* 左エリア：兵種情報 */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {/* 兵種アイコンと名前 */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: troopOnTile.theme.primary,
                }}
              >
                <TroopIcon size={18} className="text-white" />
              </div>
              <span className="text-white font-bold">
                {SOLDIER_STATS[troopOnTile.type].name}
              </span>
            </div>

            {/* 兵力プログレスバー */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end px-1">
                <label className="text-emerald-300 text-xs font-medium flex items-center gap-1">
                  <Shield size={12} /> 兵力
                </label>
                <span className="text-emerald-400 text-xs font-bold">
                  {Math.round((troopOnTile.hp / 1000) * 100)}%
                </span>
              </div>
              <div className="relative bg-slate-900/30 rounded-full">
                {/* 背景グリッド */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.5) 50%)",
                    backgroundSize: "4px 100%",
                  }}
                />
                {/* プログレスバー本体 */}
                <div
                  className="relative h-4 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: `${(troopOnTile.hp / 1000) * 100}%`,
                    background:
                      "linear-gradient(90deg, rgba(20,83,45,1) 0%, rgba(21,128,61,1) 50%, rgba(22,163,74,1) 100%)",
                    boxShadow: "0 0 15px rgba(16, 185, 129, 0.6)",
                  }}
                >
                  {/* 光沢ハイライト */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/10 to-transparent rounded-full" />
                </div>
              </div>
              <div className="flex justify-end px-1 gap-1 text-xs">
                <span className="text-green-400 font-bold">
                  {troopOnTile.hp}
                </span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">1000</span>
              </div>
            </div>

            {/* ステータス */}
            <TroopStats
              troopType={troopOnTile.type}
              terrainEffect={terrainEffect}
            />
          </div>

          {/* 右エリア：かかっている効果 */}
          <ActiveEffects terrainEffect={terrainEffect} />
        </div>
      </TooltipContent>
    </Tooltip>
  );
});
