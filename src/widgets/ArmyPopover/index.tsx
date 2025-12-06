import { useState, useEffect } from "react";
import {
  Check,
  X,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/designs/ui/popover";
import { Input } from "@/designs/ui/input";
import { Button } from "@/designs/ui/button";
import { useAppDispatch, useAppSelector } from "@/states";
import { closeArmyPopover, updateArmyName, confirmArmy } from "@/states/slice";
import { MAX_MORALE, MAX_TROOP_HEALTH } from "@/states/army";

export function ArmyPopover() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.app.isArmyPopoverOpen);
  const editingArmy = useAppSelector((state) => state.app.editingArmy);
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const [isEditMode, setIsEditMode] = useState(true);
  const [localName, setLocalName] = useState("");

  // editingArmyが変わったらlocalNameをリセット
  useEffect(() => {
    if (editingArmy) {
      setLocalName(editingArmy.name);
      setIsEditMode(true);
    }
  }, [editingArmy]);

  if (!editingArmy) return null;

  // 軍の合計兵力を計算
  const troopsInArmy = placedTroops.filter((troop) =>
    editingArmy.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );
  const totalHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
  const maxHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
  const healthPercentage = (totalHealth / maxHealth) * 100;

  const handleConfirm = () => {
    dispatch(updateArmyName(localName));
    dispatch(confirmArmy());
    setIsEditMode(false);
  };

  const handleCancel = () => {
    dispatch(closeArmyPopover());
    setIsEditMode(true);
  };

  // 向きアイコンの取得
  const getDirectionIcon = () => {
    switch (editingArmy.direction) {
      case "UP":
        return <ArrowUp className="h-8 w-8" />;
      case "DOWN":
        return <ArrowDown className="h-8 w-8" />;
      case "LEFT":
        return <ArrowLeft className="h-8 w-8" />;
      case "RIGHT":
        return <ArrowRight className="h-8 w-8" />;
      default:
        return <ArrowUp className="h-8 w-8" />;
    }
  };

  // 選択範囲の中心座標を計算
  const centerX =
    editingArmy.positions.reduce((sum, p) => sum + p.x, 0) /
    editingArmy.positions.length;
  const centerY =
    editingArmy.positions.reduce((sum, p) => sum + p.y, 0) /
    editingArmy.positions.length;

  return (
    <>
      {/* トリガー要素を選択範囲の中心に配置 */}
      <div
        style={{
          position: "absolute",
          left: centerX * 50, // TILE_SIZE
          top: centerY * 50,
          width: 1,
          height: 1,
          pointerEvents: "none",
        }}
      >
        <Popover open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
          <PopoverTrigger asChild>
            <div style={{ width: 1, height: 1 }} />
          </PopoverTrigger>
          <PopoverContent
            className="group w-96 relative overflow-hidden border-0 shadow-2xl p-0" // p-0を追加
            side="top"
            align="center"
            sideOffset={20}
            collisionPadding={20}
            style={{
              background:
                "linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)",
              boxShadow: `
                0 0 60px 8px rgba(59, 130, 246, 0.4),
                0 0 40px 4px rgba(59, 130, 246, 0.3),
                0 12px 48px rgba(59, 130, 246, 0.5),
                0 0 0 1px rgba(59, 130, 246, 0.6),
                inset 0 0 20px rgba(59, 130, 246, 0.15)
              `,
            }}
          >
            {/* Animated background glow */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.3), transparent 70%)",
              }}
            />

            {/* Shimmer effect - 無限ループ（控えめ） */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), transparent)",
                  animation: "shimmer 4s linear infinite",
                }}
              />
            </div>

            <div className="relative space-y-5">
              {/* ヘッダー装飾 - 背景なし、文字とラインで装飾 */}
              <div className="relative pt-6 pb-2 px-4">
                <div className="flex items-center justify-center gap-4">
                  {/* 左装飾 */}
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-blue-500/50 to-blue-500" />

                  {/* タイトル */}
                  <h3 className="text-white font-bold text-xl tracking-widest drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                    {editingArmy.name || "軍 編 成"}
                  </h3>

                  {/* 右装飾 */}
                  <div className="h-px flex-1 bg-linear-to-l from-transparent via-blue-500/50 to-blue-500" />
                </div>

                {/* 下部のアクセント光 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-blue-400/50 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>

              {/* コンテンツ部分にパディングを追加 */}
              <div className="px-4 pb-4 space-y-5">
                {/* 軍名 */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-blue-300 flex items-center gap-2">
                    軍名
                  </label>
                  {isEditMode ? (
                    <div className="flex gap-2">
                      <Input
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        placeholder="軍名を入力"
                        className="flex-1 border border-blue-500/50 focus:border-blue-500 bg-slate-800/50 text-white font-medium placeholder:text-slate-400 shadow-inner"
                        style={{
                          boxShadow: "inset 0 0 10px rgba(59, 130, 246, 0.2)",
                        }}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        onClick={handleConfirm}
                        className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                        style={{
                          boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      {editingArmy.name}
                    </div>
                  )}
                </div>

                {/* 士気と向きを横並び */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 士気 */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-bold text-blue-300 flex items-center gap-2">
                      士気
                    </label>
                    <div
                      className="flex gap-1 p-3 bg-slate-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm flex-1 items-center justify-center"
                      style={{
                        boxShadow:
                          "inset 0 0 20px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      {Array.from({ length: MAX_MORALE }).map((_, i) => (
                        <Flame
                          key={i}
                          className={`h-8 w-8 transition-all duration-300 ${
                            i < editingArmy.morale
                              ? "text-blue-400 fill-blue-400 animate-pulse"
                              : "text-slate-600"
                          }`}
                          style={{
                            filter:
                              i < editingArmy.morale
                                ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))"
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 向き */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-bold text-blue-300 flex items-center gap-2">
                      向き
                    </label>
                    <div
                      className="p-3 bg-slate-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm flex-1 flex items-center justify-center"
                      style={{
                        boxShadow:
                          "inset 0 0 20px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-400/50"
                        style={{
                          boxShadow:
                            "0 0 15px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <div
                          className="text-blue-400"
                          style={{
                            filter:
                              "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))",
                          }}
                        >
                          {getDirectionIcon()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 合計兵力 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-bold text-green-400 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> 合計兵力
                    </label>
                    <span className="text-xs font-mono text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
                      {Math.round(healthPercentage)}%
                    </span>
                  </div>

                  <div className="relative bg-slate-900/30 rounded-full">
                    {/* 背景のグリッドパターン */}
                    <div
                      className="absolute inset-0 rounded-full opacity-20"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, transparent 50%, rgba(22, 163, 74, 0.5) 50%)",
                        backgroundSize: "4px 100%",
                      }}
                    />

                    {/* プログレスバー本体 */}
                    <div className="relative h-6 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out relative"
                        style={{
                          width: `${healthPercentage}%`,
                          background:
                            "linear-gradient(90deg, rgba(20,83,45,1) 0%, rgba(21,128,61,1) 50%, rgba(22,163,74,1) 100%)",
                          boxShadow: "0 0 15px rgba(22, 163, 74, 0.6)",
                        }}
                      >
                        {/* 光の反射（シマー） */}
                        <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* 数値表示 */}
                  <div className="flex justify-end px-1">
                    <span className="text-sm font-bold font-mono text-white drop-shadow-[0_0_5px_rgba(22,163,74,0.8)]">
                      <span className="text-green-500">
                        {totalHealth.toLocaleString()}
                      </span>
                      <span className="text-slate-600 mx-2">/</span>
                      <span className="text-slate-400 text-xs">
                        {maxHealth.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 装飾的なフッター */}
                <div
                  className="relative -mb-2 -mx-4 h-1"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent)",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
