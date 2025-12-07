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
 * - 各方向の最遠点（代表点）のみを返す
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

  // 4方向（上下左右）それぞれの前線を計算
  const frontlines = {
    up: Math.min(...troopsInArmy.map((t) => t.y)),
    down: Math.max(...troopsInArmy.map((t) => t.y)),
    left: Math.min(...troopsInArmy.map((t) => t.x)),
    right: Math.max(...troopsInArmy.map((t) => t.x)),
  };

  // 軍の中心座標を計算（代表点として使用）
  const centerX = Math.round(
    troopsInArmy.reduce((sum, t) => sum + t.x, 0) / troopsInArmy.length
  );
  const centerY = Math.round(
    troopsInArmy.reduce((sum, t) => sum + t.y, 0) / troopsInArmy.length
  );

  // 4方向（上下左右）それぞれに対して移動可能マスを計算
  const directions = [
    { name: "up", dx: 0, dy: -1, frontX: centerX, frontY: frontlines.up },
    { name: "down", dx: 0, dy: 1, frontX: centerX, frontY: frontlines.down },
    { name: "left", dx: -1, dy: 0, frontX: frontlines.left, frontY: centerY },
    { name: "right", dx: 1, dy: 0, frontX: frontlines.right, frontY: centerY },
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

      // この方向・距離の代表点を1つだけ追加（前線から移動した位置）
      const representativeTile = {
        x: direction.frontX + offsetX,
        y: direction.frontY + offsetY,
      };

      movableTiles.push(representativeTile);
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

/**
 * 移動方向を計算する
 */
export function calculateMoveDirection(
  army: Army,
  targetX: number,
  targetY: number,
  placedTroops: PlacedTroop[]
): {
  direction: "up" | "down" | "left" | "right" | null;
  offsetX: number;
  offsetY: number;
} {
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  if (troopsInArmy.length === 0) {
    return { direction: null, offsetX: 0, offsetY: 0 };
  }

  // 前線計算
  const frontlines = {
    up: Math.min(...troopsInArmy.map((t) => t.y)),
    down: Math.max(...troopsInArmy.map((t) => t.y)),
    left: Math.min(...troopsInArmy.map((t) => t.x)),
    right: Math.max(...troopsInArmy.map((t) => t.x)),
  };

  if (targetY < frontlines.up) {
    return { direction: "up", offsetX: 0, offsetY: targetY - frontlines.up };
  } else if (targetY > frontlines.down) {
    return {
      direction: "down",
      offsetX: 0,
      offsetY: targetY - frontlines.down,
    };
  } else if (targetX < frontlines.left) {
    return {
      direction: "left",
      offsetX: targetX - frontlines.left,
      offsetY: 0,
    };
  } else if (targetX > frontlines.right) {
    return {
      direction: "right",
      offsetX: targetX - frontlines.right,
      offsetY: 0,
    };
  }

  return { direction: null, offsetX: 0, offsetY: 0 };
}
