import { memo, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { shallowEqual } from "react-redux";
import { openContextMenu } from "@/states/modules/ui";
import {
  beginSelectionDrag,
  moveArmyToTile,
  updateSelectionDrag,
} from "@/states/modules/army";
import { resetBattleMoveMode } from "@/states/modules/battle";
import { triggerMapEffect } from "@/states/modules/map";
import { calculateMoveDirection } from "@/lib/armyMovement";
import {
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
} from "@/states/battle";
import { TERRAIN_COLORS } from "../../../designs/colors";
import { TERRAIN_TYPE, type Terrain } from "../../../states/terrain";
import { TILE_SIZE } from "@/states/map";
import { isValidPlacementZone } from "@/lib/placement";
import type { SoldierType } from "@/states/soldier";
import type { LucideIcon } from "lucide-react";
import { Crown, Swords, Target, Shield, Flame } from "lucide-react";
import { getTerrainEffect } from "@/lib/terrainEffect";
import { TroopTooltip } from "./TroopTooltip";
import { useTileDrop } from "./useTileDrop";
import { useTileStyles } from "./useTileStyles";

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

export const Tile = memo(function Tile({ x, y, terrain, isSelected }: Props) {
  const dispatch = useAppDispatch();

  const {
    placedTroops,
    isDraggingTroop,
    armyFormationMode,
    selectionDragStart,
    battleMoveMode,
    movingArmyId,
    movableTiles,
    armies,
  } = useAppSelector(
    (state) => ({
      placedTroops: state.army.placedTroops,
      isDraggingTroop: state.army.isDraggingTroop,
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
  const troopOnTile = useMemo(
    () => placedTroops.find((t) => t.x === x && t.y === y),
    [placedTroops, x, y]
  );

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

  // スタイル計算（カスタムフックで抽出）
  const tileStyles = useTileStyles({
    backgroundColor,
    isMovableTile,
    isSelected,
    isPlacementZone,
    isDropTarget,
    isDraggingTroop,
    armyFormationMode,
  });

  const TroopIcon = troopOnTile ? TROOP_ICON_MAP[troopOnTile.type] : null;

  // 地形効果の計算をメモ化
  const terrainEffect = useMemo(
    () => (troopOnTile ? getTerrainEffect(troopOnTile.type, terrain) : null),
    [troopOnTile, terrain]
  );

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
          placedTroops
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
    placedTroops,
  ]);

  const handleContextMenuOpen = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // ブラウザデフォルトメニューを防止
      dispatch(
        openContextMenu({
          x: e.clientX,
          y: e.clientY,
          tileX: x,
          tileY: y,
        })
      );
    },
    [dispatch, x, y]
  );

  const tileContent = (
    <div
      ref={ref}
      {...dropProps}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
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

  // 兵がいる場合はTooltipでラップ
  if (troopOnTile && TroopIcon) {
    return (
      <TroopTooltip
        troopOnTile={troopOnTile}
        terrainEffect={terrainEffect}
        TroopIcon={TroopIcon}
      >
        {tileContent}
      </TroopTooltip>
    );
  }

  // 兵がいない場合はそのまま返す
  return tileContent;
});
