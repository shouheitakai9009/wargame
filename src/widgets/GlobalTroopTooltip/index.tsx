import { memo } from "react";
import { useAppSelector } from "@/states";
import { SOLDIER_STATS } from "@/states/soldier";
import { getTerrainEffect } from "@/lib/terrainEffect";
import {
  Shield,
  Crown,
  Swords,
  Target,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { TroopStats } from "./TroopStats";
import { ActiveEffects } from "./ActiveEffects";
import { initialMap } from "@/data/initialMap";

const TROOP_ICON_MAP: Record<string, LucideIcon> = {
  GENERAL: Crown,
  INFANTRY: Swords,
  ARCHER: Target,
  SHIELD: Shield,
  CAVALRY: Flame,
};

export const GlobalTroopTooltip = memo(function GlobalTroopTooltip() {
  const hoveredTroop = useAppSelector((state) => state.ui.hoveredTroop);
  const troops = useAppSelector((state) => [
    ...state.army.playerTroops,
    ...state.army.enemyTroops,
  ]);

  // 地形情報は静的データから取得
  const mapData = initialMap;

  // hoveredTroopがない場合は何も表示しない
  if (!hoveredTroop) return null;

  const troop = troops.find((t) => t.id === hoveredTroop.troopId);
  if (!troop) return null;

  const terrain = mapData[hoveredTroop.tileY * 30 + hoveredTroop.tileX];
  const terrainEffect = terrain ? getTerrainEffect(troop.type, terrain) : null;

  const TroopIcon = TROOP_ICON_MAP[troop.type];
  if (!TroopIcon) return null;

  // 画面端の処理などを考慮して位置を調整
  // 基本は要素の右上に表示するが、画面からはみ出る場合は左などにずらす
  const { top, left, width } = hoveredTroop.clientRect;

  // ツールチップの概算サイズ
  const TOOLTIP_WIDTH = 320;
  const TOOLTIP_HEIGHT = 160;

  let tooltipLeft = left + width + 10;
  let tooltipTop = top - 20;

  // 画面右端を超える場合は左側に表示
  if (tooltipLeft + TOOLTIP_WIDTH > window.innerWidth) {
    tooltipLeft = left - TOOLTIP_WIDTH - 10;
  }

  // 画面下端を超える場合は上にずらす（簡易対応）
  if (tooltipTop + TOOLTIP_HEIGHT > window.innerHeight) {
    tooltipTop = window.innerHeight - TOOLTIP_HEIGHT - 10;
  }

  // 画面上端を超える場合
  if (tooltipTop < 10) {
    tooltipTop = 10;
  }

  return (
    <div
      className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: tooltipLeft,
        top: tooltipTop,
      }}
    >
      <div className="flex gap-2 bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        {/* 左エリア：兵種情報 */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          {/* 兵種アイコンと名前 */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: troop.theme.primary,
              }}
            >
              <TroopIcon size={18} className="text-white" />
            </div>
            <span className="text-white font-bold">
              {SOLDIER_STATS[troop.type].name}
            </span>
          </div>

          {/* 兵力プログレスバー */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end px-1">
              <label className="text-emerald-300 text-xs font-medium flex items-center gap-1">
                <Shield size={12} /> 兵力
              </label>
              <span className="text-emerald-400 text-xs font-bold">
                {Math.round((troop.hp / 1000) * 100)}%
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
                  width: `${(troop.hp / 1000) * 100}%`,
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
              <span className="text-green-400 font-bold">{troop.hp}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">1000</span>
            </div>
          </div>

          {/* ステータス */}
          <TroopStats troopType={troop.type} terrainEffect={terrainEffect} />
        </div>

        {/* 右エリア：かかっている効果 */}
        <ActiveEffects terrainEffect={terrainEffect} />
      </div>
    </div>
  );
});
