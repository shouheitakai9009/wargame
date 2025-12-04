import { MAP_SIZE } from "@/states/map";
import type { SoldierType } from "@/states/soldier";

export type PlacedTroop = {
  x: number;
  y: number;
  type: SoldierType;
  hp: number;
  theme: {
    primary: string;
    secondary: string;
  };
};

/**
 * Check if a tile is in the valid placement zone (bottom 1/3 of map)
 */
export function isValidPlacementZone(x: number, y: number): boolean {
  const placementStartY = Math.floor((MAP_SIZE * 2) / 3);
  return y >= placementStartY && y < MAP_SIZE && x >= 0 && x < MAP_SIZE;
}

/**
 * Check if a troop can be placed based on type limits
 */
export function canPlaceTroop(
  type: SoldierType,
  placedTroops: PlacedTroop[]
): boolean {
  const counts = placedTroops.reduce((acc, troop) => {
    acc[troop.type] = (acc[troop.type] || 0) + 1;
    return acc;
  }, {} as Record<SoldierType, number>);

  const total = placedTroops.length;

  // Max 30 troops total
  if (total >= 30) return false;

  // Type-specific limits
  switch (type) {
    case "GENERAL":
      return (counts.GENERAL || 0) < 1;
    case "CAVALRY":
      return (counts.CAVALRY || 0) < 10;
    default:
      return true; // Infantry, Archer, Shield have no limits
  }
}

/**
 * Check if a position is already occupied
 */
export function isPositionOccupied(
  x: number,
  y: number,
  placedTroops: PlacedTroop[]
): boolean {
  return placedTroops.some((troop) => troop.x === x && troop.y === y);
}
