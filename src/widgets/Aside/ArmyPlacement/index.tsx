import { useAppSelector } from "@/states";
import type { Army } from "@/states/army";
import { ARMY_COLORS, MAX_TROOP_HEALTH } from "@/states/army";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/designs/ui/card";
import { Shield } from "lucide-react";

// 軍カードコンポーネント
function ArmyCard({ army }: { army: Army }) {
  const placedTroops = useAppSelector((state) => state.app.placedTroops);

  // 軍の色を取得
  const armyColor = ARMY_COLORS[army.color];

  // 軍内の兵を取得（army.positionsと一致するplacedTroops）
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  // 合計兵力を計算
  const totalHealth = troopsInArmy.reduce((sum, troop) => sum + troop.hp, 0);
  // 最大兵力を計算（兵数 × 最大兵力）
  const maxHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
  // 兵力の割合（パーセンテージ）
  const healthPercentage = maxHealth > 0 ? (totalHealth / maxHealth) * 100 : 0;

  return (
    <Card
      className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm"
      style={{
        borderColor: armyColor.border,
        borderWidth: "2px",
      }}
    >
      {/* カードの上部に軍の色のアクセント */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${armyColor.border}, ${armyColor.shadow})`,
          boxShadow: `0 2px 8px ${armyColor.shadow}`,
        }}
      />

      <CardHeader className="pt-8 pb-4">
        <div className="flex items-center gap-3">
          {/* 左装飾 */}
          <div
            className="h-[2px] w-8 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${armyColor.border})`,
              boxShadow: `0 0 8px ${armyColor.shadow}`,
            }}
          />

          {/* タイトル */}
          <CardTitle
            className="flex-1 text-center font-bold tracking-wide"
            style={{
              color: armyColor.border,
              filter: `drop-shadow(0 0 10px ${armyColor.shadow})`,
            }}
          >
            {army.name}
          </CardTitle>

          {/* 右装飾 */}
          <div
            className="h-[2px] w-8 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${armyColor.border}, transparent)`,
              boxShadow: `0 0 8px ${armyColor.shadow}`,
            }}
          />
        </div>

        {/* 下部アクセント */}
        <div
          className="mt-3 h-[1px] w-3/4 mx-auto rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${armyColor.border}, transparent)`,
            boxShadow: `0 0 6px ${armyColor.shadow}`,
          }}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 合計兵力 */}
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <label className="text-xs font-bold flex items-center gap-1.5"
              style={{ color: armyColor.border }}
            >
              <Shield className="w-3 h-3" /> 合計兵力
            </label>
            <span
              className="text-xs font-mono font-bold"
              style={{
                color: armyColor.border,
                filter: `drop-shadow(0 0 5px ${armyColor.shadow})`,
              }}
            >
              {Math.round(healthPercentage)}%
            </span>
          </div>

          <div className="relative bg-slate-900/30 rounded-full">
            {/* 背景のグリッドパターン */}
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                backgroundImage: `linear-gradient(90deg, transparent 50%, ${armyColor.shadow} 50%)`,
                backgroundSize: "4px 100%",
              }}
            />

            {/* プログレスバー本体 */}
            <div className="relative h-5 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out relative"
                style={{
                  width: `${healthPercentage}%`,
                  background: `linear-gradient(90deg, ${armyColor.border}, ${armyColor.background})`,
                  boxShadow: `0 0 12px ${armyColor.shadow}`,
                }}
              >
                {/* 光の反射（シマー） */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* 数値表示 */}
          <div className="flex justify-between px-1 text-sm">
            <span className="text-slate-400">兵数</span>
            <span className="text-white font-medium">
              {troopsInArmy.length}
            </span>
          </div>

          <div className="flex justify-between px-1 text-xs">
            <span className="text-slate-500">兵力</span>
            <span className="font-mono">
              <span
                className="font-bold"
                style={{ color: armyColor.border }}
              >
                {totalHealth.toLocaleString()}
              </span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-slate-400">
                {maxHealth.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ArmyPlacement() {
  const armies = useAppSelector((state) => state.app.armies);

  return (
    <div className="space-y-4">
      {armies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            まだ軍が編成されていません
          </p>
          <p className="text-slate-500 text-xs mt-2">
            マップ上で兵を選択して軍を編成してください
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              編成済み軍
            </h2>
            <span className="text-sm text-slate-400">
              {armies.length} / 9
            </span>
          </div>

          {/* 軍カードのリスト */}
          <div className="space-y-3">
            {armies.map((army) => (
              <ArmyCard key={army.id} army={army} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
