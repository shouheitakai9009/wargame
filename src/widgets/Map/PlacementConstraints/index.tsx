import { FloatingInfo } from "@/designs/FloatingInfo";
import { CardContent } from "@/designs/ui/card";
import { useAppSelector } from "@/states";
import { BATTLE_PHASE } from "@/states/battle";

export function PlacementConstraints() {
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const armies = useAppSelector((state) => state.app.armies);
  const phase = useAppSelector((state) => state.app.phase);

  // 準備フェーズ以外では表示しない
  if (phase !== BATTLE_PHASE.PREPARATION) {
    return null;
  }

  // Count troops by type
  const totalCount = placedTroops.length;
  const cavalryCount = placedTroops.filter((t) => t.type === "CAVALRY").length;
  const generalCount = placedTroops.filter((t) => t.type === "GENERAL").length;

  // Check if limits reached
  const isTotalLimitReached = totalCount >= 30;
  const isCavalryLimitReached = cavalryCount >= 10;
  const isGeneralLimitReached = generalCount >= 1;
  const isArmyLimitReached = armies.length >= 9;

  return (
    <FloatingInfo
      position="bottom"
      className="bg-white/70 backdrop-blur-md shadow-xl"
    >
      <CardContent className="py-3 px-8">
        <div className="flex gap-8 text-sm">
          {/* Total Placement */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-600 text-xs">最大配置数</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-bold tabular-nums transition-all duration-300 ${
                  isTotalLimitReached
                    ? "text-red-600 animate-pulse scale-110"
                    : "text-slate-900"
                }`}
                key={totalCount}
                style={{
                  animation: "countUp 0.3s ease-out",
                }}
              >
                {totalCount}
              </span>
              <span className="text-slate-600 text-sm">/ 30</span>
            </div>
          </div>

          {/* Cavalry Limit */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-600 text-xs">騎兵上限</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-bold tabular-nums transition-all duration-300 ${
                  isCavalryLimitReached
                    ? "text-red-600 animate-pulse scale-110"
                    : "text-slate-900"
                }`}
                key={cavalryCount}
                style={{
                  animation: "countUp 0.3s ease-out",
                }}
              >
                {cavalryCount}
              </span>
              <span className="text-slate-600 text-sm">/ 10</span>
            </div>
          </div>

          {/* General Limit */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-600 text-xs">将軍上限</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-bold tabular-nums transition-all duration-300 ${
                  isGeneralLimitReached
                    ? "text-red-600 animate-pulse scale-110"
                    : "text-slate-900"
                }`}
                key={generalCount}
                style={{
                  animation: "countUp 0.3s ease-out",
                }}
              >
                {generalCount}
              </span>
              <span className="text-slate-600 text-sm">/ 1</span>
            </div>
          </div>

          {/* Army Limit */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-600 text-xs">軍数上限</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-4xl font-bold tabular-nums transition-all duration-300 ${
                  isArmyLimitReached
                    ? "text-red-600 animate-pulse scale-110"
                    : "text-slate-900"
                }`}
                key={armies.length}
                style={{
                  animation: "countUp 0.3s ease-out",
                }}
              >
                {armies.length}
              </span>
              <span className="text-slate-600 text-sm">/ 9</span>
            </div>
          </div>
        </div>
      </CardContent>

      <style>{`
        @keyframes countUp {
          0% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </FloatingInfo>
  );
}
