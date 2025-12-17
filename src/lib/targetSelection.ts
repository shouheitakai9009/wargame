import type { SoldierType } from "@/states/soldier";
import type { Army } from "@/states/army";
import type { PlacedTroop } from "./placement";
import type { Terrain } from "@/states/terrain";
import { calculateAttackRange } from "./range";

/**
 * 兵種の優先順位
 * 将軍が最優先、次に弓兵、騎兵、歩兵、盾兵の順
 */
const TROOP_PRIORITY: Record<SoldierType, number> = {
  GENERAL: 5,
  ARCHER: 4,
  CAVALRY: 3,
  INFANTRY: 2,
  SHIELD: 1,
};

/**
 * マンハッタン距離を計算
 */
function getManhattanDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * 軍の中心座標を計算
 */
function calculateArmyCenter(
  positions: Array<{ x: number; y: number }>
): { x: number; y: number } {
  const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
  const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
  return {
    x: Math.round(sumX / positions.length),
    y: Math.round(sumY / positions.length),
  };
}

/**
 * 攻撃対象を選定する
 *
 * 選定ルール:
 * 1. 射程内 AND 視界内 AND 生存中の敵をフィルタ
 * 2. 最も近い敵を優先（軍の中心からの距離）
 * 3. 同距離の場合、兵種の優先順位で判定（将軍 > 弓兵 > 騎兵 > 歩兵 > 盾兵）
 *
 * @param params - 攻撃対象選定パラメータ
 * @returns 攻撃対象の兵、なければnull
 */
export function selectAttackTarget(params: {
  attackerArmy: Army;
  attackerTroops: PlacedTroop[];
  enemyTroops: PlacedTroop[];
  visibleTiles: Set<string>;
  mapData: Terrain[];
}): PlacedTroop | null {
  const { attackerArmy, attackerTroops, enemyTroops, visibleTiles } = params;

  // ① 軍内の全兵の攻撃範囲を統合
  const attackRangeSet = new Set<string>();
  attackerTroops.forEach((troop) => {
    const range = calculateAttackRange(troop, attackerArmy.direction);
    range.forEach((tile) => attackRangeSet.add(tile));
  });

  // ② 射程内 AND 視界内 AND 生存中の敵をフィルタ
  const validTargets = enemyTroops.filter((enemy) => {
    const enemyKey = `${enemy.x},${enemy.y}`;
    return (
      attackRangeSet.has(enemyKey) &&
      visibleTiles.has(enemyKey) &&
      !enemy.isDead
    );
  });

  if (validTargets.length === 0) return null;

  // ③ 最も近い敵を選定（軍の中心からの距離）
  const armyCenter = calculateArmyCenter(attackerArmy.positions);

  const targetsWithDistance = validTargets.map((enemy) => ({
    troop: enemy,
    distance: getManhattanDistance(armyCenter, { x: enemy.x, y: enemy.y }),
    priority: TROOP_PRIORITY[enemy.type],
  }));

  // ④ 優先順位でソート（距離 昇順 → 優先度 降順）
  targetsWithDistance.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return b.priority - a.priority;
  });

  return targetsWithDistance[0].troop;
}
