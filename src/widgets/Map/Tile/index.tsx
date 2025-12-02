import { memo } from "react";
import { TERRAIN_COLORS } from "../../../designs/colors";
import { TERRAIN_TYPE, type Terrain } from "../../../states/terrain";
import { TILE_SIZE } from "@/states/map";

type Props = {
  x: number;
  y: number;
  terrain: Terrain;
};

export const Tile = memo(function Tile({ x, y, terrain }: Props) {
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

  return (
    <div
      className={`w-[${TILE_SIZE}px] h-[${TILE_SIZE}px] border border-slate-600/20 transition-colors`}
      style={{ backgroundColor: getBackgroundColor(terrain) }}
      data-x={x}
      data-y={y}
    />
  );
});
