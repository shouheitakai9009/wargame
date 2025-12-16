import { ARMY_DIRECTION, type ArmyDirection } from "@/states/army";
import type { PlacedTroop } from "./placement";
import { MAP_SIZE, MAP_HEIGHT } from "@/states/map";
import { SOLDIER_STATS } from "@/states/soldier";

/**
 * マンハッタン距離を計算
 */
const getManhattanDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

/**
 * 指定された兵の攻撃範囲（座標のSet）を計算する
 * - 射程（range）分のマンハッタン距離
 * - 軍の向き（direction）による180度制限
 */
export const calculateAttackRange = (
  troop: PlacedTroop,
  direction: ArmyDirection
): Set<string> => {
  const rangeSet = new Set<string>();
  const { x, y } = troop;
  const range = SOLDIER_STATS[troop.type].range;

  // 探索範囲の最適化: 射程ボックス内のみループ
  const minX = Math.max(0, x - range);
  const maxX = Math.min(MAP_SIZE - 1, x + range);
  const minY = Math.max(0, y - range);
  const maxY = Math.min(MAP_HEIGHT - 1, y + range);

  for (let tx = minX; tx <= maxX; tx++) {
    for (let ty = minY; ty <= maxY; ty++) {
      // 自身のマスは除外
      if (tx === x && ty === y) continue;

      // 1. 距離チェック (マンハッタン距離 <= 射程)
      const dist = getManhattanDistance(x, y, tx, ty);
      if (dist > range) continue;

      // 2. 方向チェック (Straight Line: 直線のみ)
      // 「上方向にnマス」という指示通り、横幅を持たせず直線のみを描画する
      let isDirectionMatch = false;

      switch (direction) {
        case ARMY_DIRECTION.UP:
          // xが同じ かつ 上方向
          isDirectionMatch = tx === x && ty < y;
          break;
        case ARMY_DIRECTION.DOWN:
          isDirectionMatch = tx === x && ty > y;
          break;
        case ARMY_DIRECTION.LEFT:
          // yが同じ かつ 左方向
          isDirectionMatch = ty === y && tx < x;
          break;
        case ARMY_DIRECTION.RIGHT:
          isDirectionMatch = ty === y && tx > x;
          break;
      }

      if (isDirectionMatch) {
        rangeSet.add(`${tx},${ty}`);
      }
    }
  }

  return rangeSet;
};

export type AttackHeatMap = Record<
  string,
  { playerCount: number; enemyCount: number }
>;

export const calculateAttackHeatMap = (
  troops: PlacedTroop[],
  troopDirections: Record<string, ArmyDirection>
): AttackHeatMap => {
  const heatMap: AttackHeatMap = {};

  troops.forEach((troop) => {
    const dir = troopDirections[troop.id];
    if (!dir) return;

    // 攻撃範囲計算
    const rangeTiles = calculateAttackRange(troop, dir);

    // ヒートマップ更新
    const isEnemy = troop.id.startsWith("enemy-");

    rangeTiles.forEach((tileKey) => {
      if (!heatMap[tileKey]) {
        heatMap[tileKey] = { playerCount: 0, enemyCount: 0 };
      }
      if (isEnemy) {
        heatMap[tileKey].enemyCount++;
      } else {
        heatMap[tileKey].playerCount++;
      }
    });
  });

  return heatMap;
};
