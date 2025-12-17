import { memo, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { shallowEqual } from "react-redux";
import { openContextMenu, setHoveredTroop } from "@/states/modules/ui";
import {
  beginSelectionDrag,
  moveArmyToTile,
  updateSelectionDrag,
} from "@/states/modules/army";
import { resetBattleMoveMode } from "@/states/modules/battle";
import { triggerMapEffect } from "@/states/modules/map";
import { recalculateAllVisionsThunk } from "@/states/modules/visibility";
import { calculateMoveDirection } from "@/lib/armyMovement";
import {
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
  TURN_PHASE,
} from "@/states/battle";
import { TERRAIN_COLORS } from "../../../designs/colors";
import { TERRAIN_TYPE, type Terrain } from "../../../states/terrain";
import { TILE_SIZE } from "@/states/map";
import { isValidPlacementZone } from "@/lib/placement";
import type { SoldierType } from "@/states/soldier";
import type { LucideIcon } from "lucide-react";
import { Crown, Swords, Target, Shield, Flame } from "lucide-react";
import { useTileDrop } from "./useTileDrop";
import { useTileStyles } from "./useTileStyles";

type Props = {
  x: number;
  y: number;
  terrain: Terrain;
  isSelected: boolean;
  isVisible: boolean;
  attackIntensity: { playerCount: number; enemyCount: number };
};

const TROOP_ICON_MAP: Record<SoldierType, LucideIcon> = {
  GENERAL: Crown,
  INFANTRY: Swords,
  ARCHER: Target,
  SHIELD: Shield,
  CAVALRY: Flame,
};

export const Tile = memo(function Tile({
  x,
  y,
  terrain,
  isSelected,
  isVisible,
  attackIntensity,
}: Props) {
  const dispatch = useAppDispatch();

  const {
    playerTroops,
    enemyTroops,
    armyFormationMode,
    selectionDragStart,
    battleMoveMode,
    movingArmyId,
    movableTiles,
    armies,
    turnPhase,
  } = useAppSelector(
    (state) => ({
      turnPhase: state.battle.turnPhase,
      playerTroops: state.army.playerTroops,
      enemyTroops: state.army.enemyTroops,
      armyFormationMode: state.army.armyFormationMode,
      selectionDragStart: state.army.selectionDragStart,
      battleMoveMode: state.battle.battleMoveMode,
      movingArmyId: state.battle.movingArmyId,
      movableTiles: state.battle.movableTiles,
      armies: state.army.armies,
    }),
    shallowEqual
  );

  // 重い計算をメモ化
  const allTroops = useMemo(
    () => [...playerTroops, ...enemyTroops],
    [playerTroops, enemyTroops]
  );

  const troopOnTile = useMemo(
    () => allTroops.find((t) => t.x === x && t.y === y),
    [allTroops, x, y]
  );

  // 自軍のいずれかの兵から見えるタイルかチェック
  // isVisible logic removed (passed as prop)

  const isPlacementZone = useMemo(() => isValidPlacementZone(x, y), [x, y]);

  // このタイルが移動可能マスかどうか
  const isMovableTile = useMemo(
    () =>
      movableTiles
        ? movableTiles.some((tile) => tile.x === x && tile.y === y)
        : false,
    [movableTiles, x, y]
  );

  // ドロップ処理（カスタムフックで抽出）
  const { ref, dropProps, isDropTarget } = useTileDrop({
    x,
    y,
    terrain,
    isPlacementZone,
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

  // 占有状態判定
  const isOccupiedByPlayer = useMemo(() => {
    return !!troopOnTile && troopOnTile.id.startsWith("player-");
  }, [troopOnTile]);

  const isOccupiedByEnemy = useMemo(() => {
    return !!troopOnTile && troopOnTile.id.startsWith("enemy-");
  }, [troopOnTile]);

  // スタイル計算（カスタムフックで抽出）
  const tileStyles = useTileStyles({
    backgroundColor,
    isMovableTile,
    isSelected,
    isPlacementZone,
    isDropTarget,
    armyFormationMode,
    isVisible,
    attackIntensity,
    isOccupiedByPlayer,
    isOccupiedByEnemy,
  });

  const TroopIcon = troopOnTile ? TROOP_ICON_MAP[troopOnTile.type] : null;

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
    // 範囲選択ドラッグ中
    if (
      (armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
        armyFormationMode === ARMY_FORMATION_MODE.SPLIT) &&
      selectionDragStart
    ) {
      dispatch(updateSelectionDrag({ x, y }));
    }

    // 兵がいる場合はTooltipのホバー状態をセット
    // 視界外の場合は表示しない
    if (troopOnTile && isVisible) {
      // 要素の位置を取得
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        dispatch(
          setHoveredTroop({
            troopId: troopOnTile.id,
            tileX: x,
            tileY: y,
            clientRect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
          })
        );
      }
    }
  }, [
    armyFormationMode,
    selectionDragStart,
    dispatch,
    x,
    y,
    troopOnTile,
    ref,
    isVisible,
  ]);

  const handleMouseLeave = useCallback(() => {
    // ホバー状態を解除
    if (troopOnTile) {
      dispatch(setHoveredTroop(null));
    }
  }, [dispatch, troopOnTile]);

  const handleTileClick = useCallback(() => {
    // 移動モードで移動可能マスをクリックした場合
    if (
      battleMoveMode === BATTLE_MOVE_MODE.MOVE &&
      movingArmyId &&
      isMovableTile
    ) {
      const movingArmy = armies.find((a) => a.id === movingArmyId);

      if (movingArmy) {
        const { direction } = calculateMoveDirection(
          movingArmy,
          x,
          y,
          allTroops
        );

        if (direction) {
          dispatch(
            triggerMapEffect({
              type: MAP_EFFECT.DIRECTION_CHANGE,
              direction: direction.toUpperCase() as
                | "UP"
                | "DOWN"
                | "LEFT"
                | "RIGHT",
            })
          );
        }
      }

      dispatch(
        moveArmyToTile({ armyId: movingArmyId, targetX: x, targetY: y })
      );
      // 移動完了後に視界を再計算
      dispatch(recalculateAllVisionsThunk());
      dispatch(resetBattleMoveMode());
    }
  }, [
    battleMoveMode,
    movingArmyId,
    isMovableTile,
    dispatch,
    x,
    y,
    armies,
    allTroops,
  ]);

  const handleContextMenuOpen = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // ブラウザデフォルトメニューを防止

      // 敵フェーズ中は操作不可
      if (turnPhase === TURN_PHASE.ENEMY) {
        return;
      }

      // 敵兵がいる場合はメニューを開かない
      if (troopOnTile && enemyTroops.some((t) => t.id === troopOnTile.id)) {
        return;
      }

      dispatch(
        openContextMenu({
          x: e.clientX,
          y: e.clientY,
          tileX: x,
          tileY: y,
        })
      );
    },
    [dispatch, x, y, troopOnTile, enemyTroops, turnPhase]
  );

  // 射程オーバーレイのクラス計算
  let rangeOverlayClass = "";
  // 敵の射程は「敵軍フェーズ」かつ「視界内」の場合のみ表示する
  const showEnemyRange =
    attackIntensity &&
    attackIntensity.enemyCount > 0 &&
    !isOccupiedByEnemy &&
    isVisible &&
    turnPhase === TURN_PHASE.ENEMY;

  // 自軍の射程は「自軍フェーズ」の場合のみ表示する
  const showPlayerRange =
    attackIntensity &&
    attackIntensity.playerCount > 0 &&
    !isOccupiedByPlayer &&
    turnPhase === TURN_PHASE.PLAYER;

  if (showEnemyRange && showPlayerRange) {
    rangeOverlayClass = "range-overlay-conflict";
  } else if (showEnemyRange) {
    rangeOverlayClass = "range-overlay-enemy";
  } else if (showPlayerRange) {
    rangeOverlayClass = "range-overlay-player";
  }

  return (
    <div
      ref={ref}
      {...dropProps}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTileClick}
      onContextMenu={handleContextMenuOpen}
      className="transition-all duration-200 relative flex items-center justify-center overflow-hidden"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        ...tileStyles,
      }}
      data-x={x}
      data-y={y}
    >
      {/* 射程オーバーレイ */}
      {rangeOverlayClass && (
        <>
          <div className={`range-overlay ${rangeOverlayClass}`} />
          <div className="range-icon-container">
            <Swords size={20} className="range-icon-anim" strokeWidth={2.5} />
          </div>
        </>
      )}
      {TroopIcon && troopOnTile && isVisible && (
        <div
          className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: troopOnTile.theme.primary,
          }}
        >
          <TroopIcon size={20} className="text-white" />
        </div>
      )}
    </div>
  );
});
