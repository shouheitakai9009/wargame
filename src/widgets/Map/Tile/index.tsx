import { memo, useRef, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { shallowEqual } from "react-redux";
import {
  placeTroop,
  removeTroop,
  showError,
  switchArmyFormationMode,
  beginSelectionDrag,
  updateSelectionDrag,
  changeArmyDirection,
  switchBattleMoveMode,
  moveArmyToTile,
  triggerMapEffect,
  openArmyPopover,
  deleteArmy,
} from "@/states/slice";
import {
  ARMY_FORMATION_MODE,
  BATTLE_PHASE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
} from "@/states/battle";
import { ARMY_DIRECTION } from "@/states/army";
import { TERRAIN_COLORS } from "../../../designs/colors";
import { TERRAIN_TYPE, type Terrain } from "../../../states/terrain";
import { TILE_SIZE } from "@/states/map";
import {
  isValidPlacementZone,
  canPlaceTroop,
  isPositionOccupied,
} from "@/lib/placement";
import { SOLDIER_STATS, type SoldierType } from "@/states/soldier";
import type { LucideIcon } from "lucide-react";
import { Crown, Swords, Target, Shield, Flame } from "lucide-react";
import { getTerrainEffect } from "@/lib/terrainEffect";
import { useDrop } from "@react-aria/dnd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/designs/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/designs/ui/tooltip";

type Props = {
  x: number;
  y: number;
  terrain: Terrain;
  isSelected: boolean;
};

const TROOP_ICON_MAP: Record<SoldierType, LucideIcon> = {
  GENERAL: Crown,
  INFANTRY: Swords,
  ARCHER: Target,
  SHIELD: Shield,
  CAVALRY: Flame,
};

const STAT_ICON_MAP: Record<string, LucideIcon> = {
  attack: Swords,
  defense: Shield,
  range: Target,
  speed: Flame,
};

export const Tile = memo(
  function Tile({ x, y, terrain, isSelected }: Props) {
    const dispatch = useAppDispatch();

    // 必要な状態を1つのセレクターでまとめて取得（shallowEqualで比較）
    const {
      placedTroops,
      isDraggingTroop,
      armyFormationMode,
      selectionDragStart,
      armies,
      phase,
      battleMoveMode,
      movingArmyId,
      movableTiles,
    } = useAppSelector(
      (state) => ({
        placedTroops: state.app.placedTroops,
        isDraggingTroop: state.app.isDraggingTroop,
        armyFormationMode: state.app.armyFormationMode,
        selectionDragStart: state.app.selectionDragStart,
        armies: state.app.armies,
        phase: state.app.phase,
        battleMoveMode: state.app.battleMoveMode,
        movingArmyId: state.app.movingArmyId,
        movableTiles: state.app.movableTiles,
      }),
      shallowEqual
    );

    const ref = useRef<HTMLDivElement>(null);

    // 重い計算をメモ化
    const troopOnTile = useMemo(
      () => placedTroops.find((t) => t.x === x && t.y === y),
      [placedTroops, x, y]
    );

    const isPlacementZone = useMemo(() => isValidPlacementZone(x, y), [x, y]);

    // このタイルが属している軍を見つける
    const belongingArmy = useMemo(
      () =>
        armies.find((army) =>
          army.positions.some((pos) => pos.x === x && pos.y === y)
        ),
      [armies, x, y]
    );

    // このタイルが移動可能マスかどうか
    const isMovableTile = useMemo(
      () =>
        movableTiles
          ? movableTiles.some((tile) => tile.x === x && tile.y === y)
          : false,
      [movableTiles, x, y]
    );

    const { dropProps, isDropTarget } = useDrop({
      ref,
      onDrop: async (e) => {
        if (!isPlacementZone) return;

        const item = e.items.find(
          (item) => item.kind === "text" && item.types.has("application/json")
        );

        if (item && item.kind === "text") {
          try {
            const text = await item.getText("application/json");
            const data = JSON.parse(text) as {
              type: SoldierType;
              theme: { primary: string; secondary: string };
            };

            // Validate placement
            if (isPositionOccupied(x, y, placedTroops)) {
              dispatch(showError("既に配置されています"));
              return;
            }

            // 騎兵は水マスに配置できない
            if (
              data.type === "CAVALRY" &&
              terrain.type === TERRAIN_TYPE.WATER
            ) {
              dispatch(showError("騎兵は水マスに配置できません"));
              return;
            }

            if (!canPlaceTroop(data.type, placedTroops)) {
              // Determine reason for failure
              const total = placedTroops.length;
              const counts = placedTroops.reduce((acc, troop) => {
                acc[troop.type] = (acc[troop.type] || 0) + 1;
                return acc;
              }, {} as Record<SoldierType, number>);

              if (total >= 30) {
                dispatch(showError("最大配置数（30体）を超えています"));
              } else if (
                data.type === "GENERAL" &&
                (counts.GENERAL || 0) >= 1
              ) {
                dispatch(showError("将軍は1体までしか配置できません"));
              } else if (
                data.type === "CAVALRY" &&
                (counts.CAVALRY || 0) >= 10
              ) {
                dispatch(showError("騎兵は10体までしか配置できません"));
              } else {
                dispatch(showError("配置制限を超えています"));
              }
              return;
            }

            // Place troop
            dispatch(
              placeTroop({
                x,
                y,
                type: data.type,
                hp: 1000, // MAX_SOLDIER_HP
                theme: data.theme,
              })
            );
          } catch (error) {
            console.error("Failed to parse drop data", error);
          }
        }
      },
    });

    // 背景色の計算をメモ化
    const backgroundColor = useMemo(() => {
      switch (terrain.type) {
        case TERRAIN_TYPE.GRASS:
          return TERRAIN_COLORS.GRASS;
        case TERRAIN_TYPE.WATER:
          return TERRAIN_COLORS.WATER;
        case TERRAIN_TYPE.FOREST:
          return TERRAIN_COLORS.FOREST;
        case TERRAIN_TYPE.MOUNTAIN_1:
          return TERRAIN_COLORS.MOUNTAIN_1;
        case TERRAIN_TYPE.MOUNTAIN_2:
          return TERRAIN_COLORS.MOUNTAIN_2;
        case TERRAIN_TYPE.MOUNTAIN_3:
          return TERRAIN_COLORS.MOUNTAIN_3;
        default:
          return TERRAIN_COLORS.GRASS;
      }
    }, [terrain.type]);

    const TroopIcon = troopOnTile ? TROOP_ICON_MAP[troopOnTile.type] : null;

    // 地形効果の計算をメモ化
    const terrainEffect = useMemo(
      () =>
        troopOnTile ? getTerrainEffect(troopOnTile.type, terrain) : null,
      [troopOnTile, terrain]
    );

    // イベントハンドラをメモ化
    const handleRemoveTroop = useCallback(() => {
      dispatch(removeTroop({ x, y }));
    }, [dispatch, x, y]);

    // 矩形選択のマウスイベントハンドラー
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        // 右クリック（button === 2）の場合は何もしない
        if (e.button === 2) {
          return;
        }

        if (
          armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
          armyFormationMode === ARMY_FORMATION_MODE.SPLIT
        ) {
          e.preventDefault();
          dispatch(beginSelectionDrag({ x, y }));
        }
      },
      [armyFormationMode, dispatch, x, y]
    );

    const handleMouseEnter = useCallback(() => {
      if (
        (armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
          armyFormationMode === ARMY_FORMATION_MODE.SPLIT) &&
        selectionDragStart
      ) {
        dispatch(updateSelectionDrag({ x, y }));
      }
    }, [armyFormationMode, selectionDragStart, dispatch, x, y]);

    const handleContextMenu = useCallback(
      (item: string) => {
        if (item === "軍選択モード") {
          dispatch(
            switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.SELECT })
          );
        } else if (item === "軍分割モード") {
          // 軍に属している場合、その軍IDを渡して分割モードに切り替える
          if (belongingArmy) {
            dispatch(
              switchArmyFormationMode({
                mode: ARMY_FORMATION_MODE.SPLIT,
                armyId: belongingArmy.id,
              })
            );
          }
        } else if (item === "移動モード") {
          if (belongingArmy) {
            dispatch(
              switchBattleMoveMode({
                mode: BATTLE_MOVE_MODE.MOVE,
                armyId: belongingArmy.id,
              })
            );
          }
        } else if (item === "軍編成") {
          // 軍に属している場合、その軍のポップオーバーを開く
          if (belongingArmy) {
            dispatch(
              openArmyPopover({
                positions: belongingArmy.positions,
                armyId: belongingArmy.id,
              })
            );
          }
        }
      },
      [dispatch, belongingArmy]
    );

    const handleChangeDirection = useCallback(
      (direction: (typeof ARMY_DIRECTION)[keyof typeof ARMY_DIRECTION]) => {
        if (belongingArmy) {
          dispatch(
            changeArmyDirection({ armyId: belongingArmy.id, direction })
          );

          // 向き変更エフェクトを発火
          dispatch(
            triggerMapEffect({
              type: MAP_EFFECT.DIRECTION_CHANGE,
              direction: direction as "UP" | "DOWN" | "LEFT" | "RIGHT",
            })
          );
        }
      },
      [dispatch, belongingArmy]
    );

    const handleDeleteArmy = useCallback(() => {
      if (belongingArmy) {
        dispatch(deleteArmy(belongingArmy.id));
      }
    }, [dispatch, belongingArmy]);

    const handleTileClick = useCallback(() => {
      // 移動モードで移動可能マスをクリックした場合
      if (
        battleMoveMode === BATTLE_MOVE_MODE.MOVE &&
        movingArmyId &&
        isMovableTile
      ) {
        dispatch(
          moveArmyToTile({ armyId: movingArmyId, targetX: x, targetY: y })
        );
      }
    }, [battleMoveMode, movingArmyId, isMovableTile, dispatch, x, y]);

    const tileContent = (
      <div
        ref={ref}
        {...dropProps}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onClick={handleTileClick}
        className="transition-all duration-200 relative flex items-center justify-center overflow-hidden"
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          backgroundColor: backgroundColor,
          filter: isMovableTile
            ? "brightness(1.4)"
            : isPlacementZone && isDropTarget
            ? "brightness(1.5)"
            : isPlacementZone && isDraggingTroop
            ? "brightness(1.2)"
            : undefined,
          border: isMovableTile
            ? "2px solid rgba(59, 130, 246, 0.8)"
            : isSelected
            ? "2px dashed rgba(147, 51, 234, 0.8)"
            : isPlacementZone && isDropTarget
            ? "2px solid rgba(34, 197, 94, 0.8)"
            : "1px solid rgba(100, 116, 139, 0.2)",
          boxShadow: isMovableTile
            ? "0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.3)"
            : isSelected
            ? "0 0 12px rgba(147, 51, 234, 0.6), inset 0 0 20px rgba(147, 51, 234, 0.3)"
            : isPlacementZone && isDropTarget
            ? "0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.3)"
            : undefined,
          cursor: isMovableTile
            ? "pointer"
            : armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
              armyFormationMode === ARMY_FORMATION_MODE.SPLIT
            ? "crosshair"
            : undefined,
          userSelect:
            armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
            armyFormationMode === ARMY_FORMATION_MODE.SPLIT
              ? "none"
              : undefined,
        }}
        data-x={x}
        data-y={y}
      >
        {TroopIcon && troopOnTile && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: troopOnTile.theme.primary,
            }}
          >
            <TroopIcon size={20} className="text-white" />
          </div>
        )}
      </div>
    );

    // ツールチップの内容
    const tooltipContent = troopOnTile ? (
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
                {TroopIcon && <TroopIcon size={18} className="text-white" />}
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
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-300">
                <Swords size={12} className="text-red-400" />
                <span>攻撃:</span>
                <span className="font-bold text-white">
                  {SOLDIER_STATS[troopOnTile.type].attack}
                </span>
                {terrainEffect &&
                  terrainEffect.effects.find((e) => e.stat === "attack") && (
                    <span
                      className={`font-bold text-xs ${
                        terrainEffect.effects.find((e) => e.stat === "attack")!
                          .change > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {terrainEffect.effects.find((e) => e.stat === "attack")!
                        .change > 0
                        ? "+"
                        : ""}
                      {
                        terrainEffect.effects.find((e) => e.stat === "attack")!
                          .change
                      }
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Shield size={12} className="text-blue-400" />
                <span>防御:</span>
                <span className="font-bold text-white">
                  {SOLDIER_STATS[troopOnTile.type].defense}
                </span>
                {terrainEffect &&
                  terrainEffect.effects.find((e) => e.stat === "defense") && (
                    <span
                      className={`font-bold text-xs ${
                        terrainEffect.effects.find((e) => e.stat === "defense")!
                          .change > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {terrainEffect.effects.find((e) => e.stat === "defense")!
                        .change > 0
                        ? "+"
                        : ""}
                      {
                        terrainEffect.effects.find((e) => e.stat === "defense")!
                          .change
                      }
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Target size={12} className="text-green-400" />
                <span>射程:</span>
                <span className="font-bold text-white">
                  {SOLDIER_STATS[troopOnTile.type].range}
                </span>
                {terrainEffect &&
                  terrainEffect.effects.find((e) => e.stat === "range") && (
                    <span
                      className={`font-bold text-xs ${
                        terrainEffect.effects.find((e) => e.stat === "range")!
                          .change > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {terrainEffect.effects.find((e) => e.stat === "range")!
                        .change > 0
                        ? "+"
                        : ""}
                      {
                        terrainEffect.effects.find((e) => e.stat === "range")!
                          .change
                      }
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Flame size={12} className="text-yellow-400" />
                <span>速度:</span>
                <span className="font-bold text-white">
                  {SOLDIER_STATS[troopOnTile.type].speed}
                </span>
                {terrainEffect &&
                  terrainEffect.effects.find((e) => e.stat === "speed") && (
                    <span
                      className={`font-bold text-xs ${
                        terrainEffect.effects.find((e) => e.stat === "speed")!
                          .change > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {terrainEffect.effects.find((e) => e.stat === "speed")!
                        .change > 0
                        ? "+"
                        : ""}
                      {
                        terrainEffect.effects.find((e) => e.stat === "speed")!
                          .change
                      }
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* 右エリア：かかっている効果 */}
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
        </div>
      </TooltipContent>
    ) : null;

    // コンテキストメニューの内容
    const contextMenuContent = (
      <ContextMenuContent>
        {/* 軍に属している場合は「軍編成」を最上部に表示 */}
        {belongingArmy && (
          <>
            <ContextMenuItem onClick={() => handleContextMenu("軍編成")}>
              軍編成
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {/* 軍選択モード（準備フェーズのみ） */}
        {phase === BATTLE_PHASE.PREPARATION && (
          <ContextMenuItem onClick={() => handleContextMenu("軍選択モード")}>
            軍選択モード
            {armyFormationMode === ARMY_FORMATION_MODE.SELECT && " ✓"}
          </ContextMenuItem>
        )}

        {/* 軍に属している場合は「軍分割モード」を表示 */}
        {belongingArmy && (
          <ContextMenuItem onClick={() => handleContextMenu("軍分割モード")}>
            軍分割モード
            {armyFormationMode === ARMY_FORMATION_MODE.SPLIT && " ✓"}
          </ContextMenuItem>
        )}

        {/* 軍に属している場合は「向き」のサブメニューを表示 */}
        {belongingArmy && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>向き</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {Object.entries(ARMY_DIRECTION).map(([key, value]) => (
                <ContextMenuItem
                  key={key}
                  onClick={() => handleChangeDirection(value)}
                >
                  {key === "UP" && "上"}
                  {key === "DOWN" && "下"}
                  {key === "LEFT" && "左"}
                  {key === "RIGHT" && "右"}
                  {belongingArmy.direction === value && " ✓"}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* バトルフェーズかつ軍に属している場合は「移動モード」を表示 */}
        {phase === BATTLE_PHASE.BATTLE && belongingArmy && (
          <ContextMenuItem onClick={() => handleContextMenu("移動モード")}>
            移動モード
          </ContextMenuItem>
        )}

        {/* 軍選択モードまたは軍分割モードの場合は「モードをキャンセル」を表示 */}
        {(armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
          armyFormationMode === ARMY_FORMATION_MODE.SPLIT) && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                dispatch(
                  switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.NONE })
                )
              }
            >
              モードをキャンセル
            </ContextMenuItem>
          </>
        )}

        {/* 移動モードの場合は「モードをキャンセル」を表示 */}
        {battleMoveMode === BATTLE_MOVE_MODE.MOVE && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                dispatch(switchBattleMoveMode({ mode: BATTLE_MOVE_MODE.NONE }))
              }
            >
              モードをキャンセル
            </ContextMenuItem>
          </>
        )}

        {/* 準備フェーズかつ軍に属している場合は「軍の削除」を表示 */}
        {phase === BATTLE_PHASE.PREPARATION && belongingArmy && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDeleteArmy} variant="destructive">
              軍の削除
            </ContextMenuItem>
          </>
        )}

        {troopOnTile && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={handleRemoveTroop}
              variant="destructive"
              disabled={!!belongingArmy} // 軍に所属している場合は削除不可
            >
              兵の削除
              {belongingArmy && " (軍に所属)"}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    );

    // 兵がいる場合はTooltipでラップするが、ContextMenuTriggerが直接DOM要素(tileContent)をラップするように構造を変更
    if (troopOnTile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TooltipTrigger asChild>{tileContent}</TooltipTrigger>
              </ContextMenuTrigger>
              {contextMenuContent}
            </ContextMenu>
            {tooltipContent}
          </Tooltip>
        </TooltipProvider>
      );
    }

    // 兵がいない場合はContextMenuのみ
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{tileContent}</ContextMenuTrigger>
        {contextMenuContent}
      </ContextMenu>
    );
  },
  (prevProps, nextProps) => {}
);
