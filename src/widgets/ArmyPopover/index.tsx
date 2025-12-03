import { useState, useEffect } from "react";
import { Check, X, Flame, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/designs/ui/popover";
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
        return <ArrowUp className="h-8 w-8 text-blue-600" />;
      case "DOWN":
        return <ArrowDown className="h-8 w-8 text-blue-600" />;
      case "LEFT":
        return <ArrowLeft className="h-8 w-8 text-blue-600" />;
      case "RIGHT":
        return <ArrowRight className="h-8 w-8 text-blue-600" />;
      default:
        return <ArrowUp className="h-8 w-8 text-blue-600" />;
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
  const centerX = editingArmy.positions.reduce((sum, p) => sum + p.x, 0) / editingArmy.positions.length;
  const centerY = editingArmy.positions.reduce((sum, p) => sum + p.y, 0) / editingArmy.positions.length;

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
            className="w-96 border-4 border-amber-600 shadow-2xl bg-white dark:bg-slate-900"
            style={{
              background: "linear-gradient(135deg, rgb(255, 251, 235) 0%, rgb(254, 243, 199) 50%, rgb(253, 230, 138) 100%)",
            }}
          >
        <div className="space-y-5">
          {/* ヘッダー装飾 */}
          <div className="relative -mt-2 -mx-4 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 border-b-4 border-amber-800">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] opacity-30" />
            <h3 className="relative text-white font-bold text-lg text-center tracking-wider drop-shadow-lg">
              軍 編 成
            </h3>
          </div>

          {/* 軍名 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-amber-600 rounded" />
              軍名
            </label>
            {isEditMode ? (
              <div className="flex gap-2">
                <Input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="軍名を入力"
                  className="flex-1 border-2 border-amber-400 focus:border-amber-600 bg-white font-medium"
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={handleConfirm}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCancel}
                  className="shrink-0 border-2 border-red-400 hover:bg-red-50"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{editingArmy.name}</div>
            )}
          </div>

          {/* 士気と向きを横並び */}
          <div className="grid grid-cols-2 gap-4">
            {/* 士気 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-amber-600 rounded" />
                士気
              </label>
              <div className="flex gap-1 p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 rounded-lg border-2 border-orange-300 shadow-inner">
                {Array.from({ length: MAX_MORALE }).map((_, i) => (
                  <Flame
                    key={i}
                    className={`h-8 w-8 transition-all duration-300 ${
                      i < editingArmy.morale
                        ? "text-orange-500 fill-orange-500 drop-shadow-lg animate-pulse"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 向き */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-amber-600 rounded" />
                向き
              </label>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 rounded-lg border-2 border-blue-300 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-md border-2 border-blue-400 text-blue-600">
                    {getDirectionIcon()}
                  </div>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{getDirectionText()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 合計兵力 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-amber-600 rounded" />
              合計兵力
            </label>
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 rounded-lg border-2 border-emerald-300 shadow-inner">
              <div className="flex items-center gap-3">
                <Progress
                  value={healthPercentage}
                  className="flex-1 h-6 bg-emerald-200 dark:bg-emerald-900"
                />
                <span className="text-lg font-bold font-mono whitespace-nowrap text-emerald-900 dark:text-emerald-100 tabular-nums">
                  {totalHealth.toLocaleString()} / {maxHealth.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 装飾的なフッター */}
          <div className="relative -mb-2 -mx-4 h-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600" />
        </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
