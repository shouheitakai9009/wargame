import type { Army } from "@/states/army";
import type { PlacedTroop } from "./placement";
import { SOLDIER_STATS } from "@/states/soldier";
import { getTerrainEffect } from "./terrainEffect";
import { initialMap } from "@/data/initialMap";
import { MAP_SIZE } from "@/states/map";

/**
 * 軍の速度を計算する
 * バトルルール：軍内で、ステータス効果も加味した最小の速度を探し、それを軍の速度とする。最低速度は1。
 */
export function calculateArmySpeed(
  army: Army,
  placedTroops: PlacedTroop[]
): number {
  // 軍内の全兵を取得
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  if (troopsInArmy.length === 0) {
    return 1; // デフォルトの最低速度
  }

  let minSpeed = Infinity;

  for (const troop of troopsInArmy) {
    // 基本速度を取得
    const baseStat = SOLDIER_STATS[troop.type];
    let effectiveSpeed = baseStat.speed;

    // 地形効果を取得
    const terrainIndex = troop.y * MAP_SIZE + troop.x;
    const terrain = initialMap[terrainIndex];
    const terrainEffect = getTerrainEffect(troop.type, terrain);

    // 地形効果による速度変化を適用
    if (terrainEffect) {
      const speedEffect = terrainEffect.effects.find((e) => e.stat === "speed");
      if (speedEffect) {
        effectiveSpeed += speedEffect.change;
      }
    }

    // 最低速度は1
    effectiveSpeed = Math.max(1, effectiveSpeed);

    // 最小速度を更新
    minSpeed = Math.min(minSpeed, effectiveSpeed);
  }

  return Math.max(1, minSpeed); // 最低速度保証
}

/**
 * 指定された位置に移動可能かチェック
 * @param army 移動する軍
 * @param newPositions 移動後の全positions
 * @param placedTroops 配置済み兵のリスト
 */
function canMoveToPosition(
  army: Army,
  newPositions: Array<{ x: number; y: number }>,
  placedTroops: PlacedTroop[]
): boolean {
  // 軍内の兵を取得
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  // 騎兵がいるかチェック
  const hasCavalry = troopsInArmy.some((troop) => troop.type === "CAVALRY");

  // 移動元の平均高さを計算
  let totalHeight = 0;
  for (const troop of troopsInArmy) {
    const terrainIndex = troop.y * MAP_SIZE + troop.x;
    const terrain = initialMap[terrainIndex];
    totalHeight += terrain.height;
  }
  const avgFromHeight = totalHeight / troopsInArmy.length;

  // 移動先の各positionをチェック
  for (const newPos of newPositions) {
    const terrainIndex = newPos.y * MAP_SIZE + newPos.x;
    const terrain = initialMap[terrainIndex];

    // 騎兵は水マスに移動できない
    if (hasCavalry && terrain.type === 2) {
      // TERRAIN_TYPE.WATER = 2
      return false;
    }

    // 水マスは高さチェックから除外（水マスへの移動は騎兵のみ禁止）
    if (terrain.type !== 2) {
      // 高さチェック：高低差が1以下でなければ移動不可
      const heightDiff = Math.abs(terrain.height - avgFromHeight);
      if (heightDiff > 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 軍の移動可能なマスを計算する
 * バトルルール：向きに関係なく上下左右に移動できる
 * - 軍の中心から上下左右それぞれの方向に速度分まで移動可能
 */
export function calculateMovableTiles(
  army: Army,
  armySpeed: number,
  placedTroops: PlacedTroop[],
  armies: Army[]
): Array<{ x: number; y: number }> {
  const movableTiles: Array<{ x: number; y: number }> = [];

  // 軍内に実際に兵がいる座標を取得
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  if (troopsInArmy.length === 0) {
    return movableTiles;
  }

  // 軍の現在の位置をSetに変換（除外用）
  const currentPositionsSet = new Set(
    army.positions.map((pos) => `${pos.x},${pos.y}`)
  );

  // 4方向（上下左右）それぞれに対して移動可能マスを計算
  const directions = [
    { dx: 0, dy: -1 }, // 上
    { dx: 0, dy: 1 }, // 下
    { dx: -1, dy: 0 }, // 左
    { dx: 1, dy: 0 }, // 右
  ];

  for (const direction of directions) {
    // 各方向に速度分だけ移動可能マスを計算
    for (let distance = 1; distance <= armySpeed; distance++) {
      const offsetX = direction.dx * distance;
      const offsetY = direction.dy * distance;

      // 移動後の軍の全positionsを計算
      const newPositions = army.positions.map((pos) => ({
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }));

      // 全positionsがマップ境界内かチェック
      const allInBounds = newPositions.every(
        (pos) =>
          pos.x >= 0 && pos.x < MAP_SIZE && pos.y >= 0 && pos.y < MAP_SIZE
      );

      if (!allInBounds) {
        break; // この方向のこれ以上の移動は不可
      }

      // 他の兵や他の軍と衝突しないかチェック
      const hasCollision = newPositions.some((pos) => {
        // 他の兵がいるかチェック（自軍の兵は除外）
        const troopExists = placedTroops.some(
          (troop) =>
            troop.x === pos.x &&
            troop.y === pos.y &&
            !army.positions.some(
              (armyPos) => armyPos.x === troop.x && armyPos.y === troop.y
            )
        );

        if (troopExists) return true;

        // 他の軍の兵がいるかチェック
        const otherArmyExists = armies.some(
          (otherArmy) =>
            otherArmy.id !== army.id &&
            otherArmy.positions.some(
              (armyPos) => armyPos.x === pos.x && armyPos.y === pos.y
            )
        );

        return otherArmyExists;
      });

      if (hasCollision) {
        break; // この方向のこれ以上の移動は不可
      }

      // 地形・兵種によるバリデーション（騎兵の水マス、高さレベル制限）
      if (!canMoveToPosition(army, newPositions, placedTroops)) {
        break; // この方向のこれ以上の移動は不可
      }

      // 軍の全positionsを移動可能マスとして追加（現在の位置は除外）
      const validPositions = newPositions.filter(
        (pos) => !currentPositionsSet.has(`${pos.x},${pos.y}`)
      );
      movableTiles.push(...validPositions);
    }
  }

  return movableTiles;
}

/**
 * 軍を移動する
 * 軍の全positionsを目標地点までのオフセット分移動する
 */
export function moveArmy(army: Army, targetX: number, targetY: number): Army {
  // 軍の中心座標を計算
  const avgX =
    army.positions.reduce((sum, pos) => sum + pos.x, 0) / army.positions.length;
  const avgY =
    army.positions.reduce((sum, pos) => sum + pos.y, 0) / army.positions.length;

  const centerX = Math.round(avgX);
  const centerY = Math.round(avgY);

  // オフセットを計算
  const offsetX = targetX - centerX;
  const offsetY = targetY - centerY;

  // 全positionsを移動
  const newPositions = army.positions.map((pos) => ({
    x: pos.x + offsetX,
    y: pos.y + offsetY,
  }));

  return {
    ...army,
    positions: newPositions,
  };
}
