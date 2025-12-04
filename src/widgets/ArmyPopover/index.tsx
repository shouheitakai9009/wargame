import { useState, useEffect } from "react";
import {
  Check,
  X,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/designs/ui/popover";
import { Input } from "@/designs/ui/input";
import { Progress } from "@/designs/ui/progress";
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

  // 向きの日本語表記
  const getDirectionText = () => {
    switch (editingArmy.direction) {
      case "UP":
        return "上";
      case "DOWN":
        return "下";
      case "LEFT":
        return "左";
      case "RIGHT":
        return "右";
      default:
        return "上";
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
            className="group w-96 relative overflow-hidden border-0 shadow-2xl"
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
              {/* ヘッダー装飾 */}
              <div className="relative -mt-2 -mx-4 px-4 py-3 bg-linear-to-r from-blue-600/30 to-cyan-600/30 border-b border-blue-500/50 backdrop-blur-sm">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)",
                  }}
                />
                <h3 className="relative text-white font-bold text-lg text-center tracking-wider drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                  軍 編 成
                </h3>
              </div>

              {/* 軍名 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <span className="inline-block w-1 h-4 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
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
                      variant="outline"
                      onClick={handleCancel}
                      className="shrink-0 border border-red-500/50 hover:bg-red-500/20 text-red-400"
                      style={{
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
                      }}
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <span className="inline-block w-1 h-4 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    士気
                  </label>
                  <div
                    className="flex gap-1 p-3 bg-slate-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm"
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <span className="inline-block w-1 h-4 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    向き
                  </label>
                  <div
                    className="p-3 bg-slate-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm"
                    style={{
                      boxShadow:
                        "inset 0 0 20px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-3">
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
                      <span className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                        {getDirectionText()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 合計兵力 */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <span className="inline-block w-1 h-4 bg-blue-500 rounded shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  合計兵力
                </label>
                <div
                  className="p-4 bg-slate-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm"
                  style={{
                    boxShadow:
                      "inset 0 0 20px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Progress
                      value={healthPercentage}
                      className="flex-1 h-6 bg-slate-700"
                      style={{
                        boxShadow: "inset 0 0 10px rgba(59, 130, 246, 0.3)",
                      }}
                    />
                    <span
                      className="text-lg font-bold font-mono whitespace-nowrap text-white tabular-nums"
                      style={{
                        textShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                      }}
                    >
                      {totalHealth.toLocaleString()} /{" "}
                      {maxHealth.toLocaleString()}
                    </span>
                  </div>
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
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
