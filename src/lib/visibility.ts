import type { PlacedTroop } from "./placement";
import type { Terrain } from "@/states/terrain";
import { VISION_RANGE, SAME_TERRAIN_VISION_LIMIT } from "@/states/visibility";
import { MAP_SIZE } from "@/states/map";

/**
 * マンハッタン距離を計算
 * @param from 開始位置
 * @param to 終了位置
 * @returns マンハッタン距離
 */
export function getManhattanDistance(
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * 座標から地形情報を取得
 * @param x X座標
 * @param y Y座標
 * @param mapData マップデータ
 * @returns 地形情報
 */
export function getTerrainAt(
  x: number,
  y: number,
  mapData: Terrain[]
): Terrain | null {
  if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
    return null;
  }
  const index = y * MAP_SIZE + x;
  return mapData[index] || null;
}

/**
 * 兵の視界を計算する（マンハッタン距離ベース）
 * @param troop 兵の情報
 * @param mapData マップデータ
 * @returns 視界内のタイル座標のSet（"x,y"形式）
 */
export function calculateTroopVision(
  troop: PlacedTroop,
  mapData: Terrain[]
): Set<string> {
  const visibleTiles = new Set<string>();
  const myTerrain = getTerrainAt(troop.x, troop.y, mapData);

  if (!myTerrain) {
    return visibleTiles;
  }

  const visionRange = VISION_RANGE[myTerrain.type] || 5;

  // マンハッタン距離でループ
  for (let dy = -visionRange; dy <= visionRange; dy++) {
    for (let dx = -visionRange; dx <= visionRange; dx++) {
      const targetX = troop.x + dx;
      const targetY = troop.y + dy;

      // マップ範囲外チェック
      if (
        targetX < 0 ||
        targetX >= MAP_SIZE ||
        targetY < 0 ||
        targetY >= MAP_SIZE
      ) {
        continue;
      }

      // マンハッタン距離チェック
      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance <= visionRange) {
        visibleTiles.add(`${targetX},${targetY}`);
      }
    }
  }

  return visibleTiles;
}

/**
 * 敵が視界内にいるかチェック
 * 同じ地形タイプの場合の制限を考慮
 * @param myPosition 自分の位置
 * @param myTerrain 自分の地形
 * @param enemyPosition 敵の位置
 * @param enemyTerrain 敵の地形
 * @param myVisibleTiles 自分の視界内のタイル
 * @returns 敵が視認可能かどうか
 */
export function isEnemyVisible(
  myPosition: { x: number; y: number },
  myTerrain: Terrain,
  enemyPosition: { x: number; y: number },
  enemyTerrain: Terrain,
  myVisibleTiles: Set<string>
): boolean {
  // まず視界範囲内かチェック
  const enemyTileKey = `${enemyPosition.x},${enemyPosition.y}`;
  if (!myVisibleTiles.has(enemyTileKey)) {
    return false;
  }

  // 同じ地形タイプの場合、視認距離制限をチェック
  if (myTerrain.type === enemyTerrain.type) {
    const limit = SAME_TERRAIN_VISION_LIMIT[myTerrain.type];
    if (limit !== undefined) {
      const distance = getManhattanDistance(myPosition, enemyPosition);
      return distance <= limit;
    }
  }

  // それ以外は通常の視界距離で視認可能
  return true;
}
