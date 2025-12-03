import { memo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { placeTroop } from "@/states/slice";
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

type Props = {
  x: number;
  y: number;
  terrain: Terrain;
};

const TROOP_ICON_MAP: Record<SoldierType, LucideIcon> = {
  GENERAL: Crown,
  INFANTRY: Swords,
  ARCHER: Target,
  SHIELD: Shield,
  CAVALRY: Flame,
};

export const Tile = memo(function Tile({ x, y, terrain }: Props) {
  const dispatch = useAppDispatch();
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const isDraggingTroop = useAppSelector((state) => state.app.isDraggingTroop);
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
            console.warn("Position already occupied");
            return;
          }

          if (!canPlaceTroop(data.type, placedTroops)) {
            console.warn("Cannot place troop: limit reached");
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

  return (
    <div
      ref={ref}
      {...dropProps}
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
        border:
          isPlacementZone && isDropTarget
            ? "2px solid rgba(34, 197, 94, 0.8)"
            : "1px solid rgba(100, 116, 139, 0.2)",
        boxShadow:
          isPlacementZone && isDropTarget
            ? "0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.3)"
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
});
