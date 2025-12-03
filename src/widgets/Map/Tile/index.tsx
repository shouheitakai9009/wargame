import { memo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import {
  placeTroop,
  removeTroop,
  showError,
  switchArmyFormationMode,
  beginSelectionDrag,
  updateSelectionDrag,
} from "@/states/slice";
import { ARMY_FORMATION_MODE } from "@/states/battle";
import { TERRAIN_COLORS } from "../../../designs/colors";
import { TERRAIN_TYPE, type Terrain } from "../../../states/terrain";
import { TILE_SIZE } from "@/states/map";
import {
  isValidPlacementZone,
  canPlaceTroop,
  isPositionOccupied,
} from "@/lib/placement";
import type { SoldierType } from "@/states/soldier";
import type { LucideIcon } from "lucide-react";
import { Crown, Swords, Target, Shield, Flame } from "lucide-react";
import { useDrop } from "@react-aria/dnd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/designs/ui/context-menu";

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
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const isDraggingTroop = useAppSelector((state) => state.app.isDraggingTroop);
  const armyFormationMode = useAppSelector(
    (state) => state.app.armyFormationMode
  );
  const selectionDragStart = useAppSelector(
    (state) => state.app.selectionDragStart
  );
  const ref = useRef<HTMLDivElement>(null);

  const troopOnTile = placedTroops.find((t) => t.x === x && t.y === y);
  const isPlacementZone = isValidPlacementZone(x, y);

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

          if (!canPlaceTroop(data.type, placedTroops)) {
            // Determine reason for failure
            const total = placedTroops.length;
            const counts = placedTroops.reduce((acc, troop) => {
              acc[troop.type] = (acc[troop.type] || 0) + 1;
              return acc;
            }, {} as Record<SoldierType, number>);

            if (total >= 30) {
              dispatch(showError("最大配置数（30体）を超えています"));
            } else if (data.type === "GENERAL" && (counts.GENERAL || 0) >= 1) {
              dispatch(showError("将軍は1体までしか配置できません"));
            } else if (data.type === "CAVALRY" && (counts.CAVALRY || 0) >= 10) {
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
              theme: data.theme,
            })
          );
        } catch (error) {
          console.error("Failed to parse drop data", error);
        }
      }
    },
  });

  const getBackgroundColor = (terrain: Terrain) => {
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
  };

  const TroopIcon = troopOnTile ? TROOP_ICON_MAP[troopOnTile.type] : null;

  const handleRemoveTroop = () => {
    dispatch(removeTroop({ x, y }));
  };

  // 矩形選択のマウスイベントハンドラー
  const handleMouseDown = (e: React.MouseEvent) => {
    if (armyFormationMode === ARMY_FORMATION_MODE.SELECT) {
      e.preventDefault();
      dispatch(beginSelectionDrag({ x, y }));
    }
  };

  const handleMouseEnter = () => {
    if (
      armyFormationMode === ARMY_FORMATION_MODE.SELECT &&
      selectionDragStart
    ) {
      dispatch(updateSelectionDrag({ x, y }));
    }
  };

  const handleContextMenu = (item: string) => {
    if (item === "軍選択モード") {
      dispatch(switchArmyFormationMode(ARMY_FORMATION_MODE.SELECT));
    } else if (item === "軍分割モード") {
      dispatch(switchArmyFormationMode(ARMY_FORMATION_MODE.SPLIT));
    }
  };

  const tileContent = (
    <div
      ref={ref}
      {...dropProps}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      className="transition-all duration-200 relative flex items-center justify-center overflow-hidden"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: getBackgroundColor(terrain),
        filter:
          isPlacementZone && isDropTarget
            ? "brightness(1.5)"
            : isPlacementZone && isDraggingTroop
            ? "brightness(1.2)"
            : undefined,
        border: isSelected
          ? "2px dashed rgba(147, 51, 234, 0.8)"
          : isPlacementZone && isDropTarget
          ? "2px solid rgba(34, 197, 94, 0.8)"
          : "1px solid rgba(100, 116, 139, 0.2)",
        boxShadow: isSelected
          ? "0 0 12px rgba(147, 51, 234, 0.6), inset 0 0 20px rgba(147, 51, 234, 0.3)"
          : isPlacementZone && isDropTarget
          ? "0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.3)"
          : undefined,
        cursor:
          armyFormationMode === ARMY_FORMATION_MODE.SELECT
            ? "crosshair"
            : undefined,
        userSelect:
          armyFormationMode === ARMY_FORMATION_MODE.SELECT ? "none" : undefined,
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

  // 常にコンテキストメニューを表示
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tileContent}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => handleContextMenu("軍選択モード")}>
          軍選択モード
          {armyFormationMode === ARMY_FORMATION_MODE.SELECT && " ✓"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleContextMenu("軍分割モード")}>
          軍分割モード
          {armyFormationMode === ARMY_FORMATION_MODE.SPLIT && " ✓"}
        </ContextMenuItem>

        {troopOnTile && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleRemoveTroop} variant="destructive">
              兵の削除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}, (prevProps, nextProps) => {
  // propsが変わっていなければ再レンダリングしない
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.terrain === nextProps.terrain &&
    prevProps.isSelected === nextProps.isSelected
  );
});
