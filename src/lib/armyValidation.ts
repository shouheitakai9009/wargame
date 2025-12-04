import type { PlacedTroop } from "./placement";
import type { Army } from "@/states/army";

/**
 * 選択範囲内の兵をバリデーションする
 */
export function validateArmySelection(
  selectedTiles: Set<string>,
  placedTroops: PlacedTroop[],
  armies: Army[] // 既存の軍リスト
): { isValid: boolean; errorMessage?: string } {
  // 選択範囲内の兵を抽出
  const troopsInSelection = placedTroops.filter((troop) =>
    selectedTiles.has(`${troop.x},${troop.y}`)
  );

  // 1. 最低2体以上の兵がいるかチェック
  if (troopsInSelection.length < 2) {
    return {
      isValid: false,
      errorMessage: "軍を編成するには最低2体以上の兵が必要です",
    };
  }

  // 2. 選択範囲内に既存の軍の兵が含まれていないかチェック
  const isAnyTroopInArmy = troopsInSelection.some((troop) =>
    armies.some((army) =>
      army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
    )
  );

  if (isAnyTroopInArmy) {
    return {
      isValid: false,
      errorMessage: "選択範囲内に既に軍に所属している兵が含まれています",
    };
  }

  // 3. 全ての兵が隣り合っているかチェック（連結性の確認）
  if (!areAllTroopsConnected(troopsInSelection)) {
    return {
      isValid: false,
      errorMessage: "軍内の兵は全て隣り合っている必要があります",
    };
  }

  return { isValid: true };
}

/**
 * 軍分割のバリデーション
 */
export function validateArmySplit(
  selectedTiles: Set<string>,
  army: Army,
  placedTroops: PlacedTroop[]
): { isValid: boolean; errorMessage?: string } {
  // 選択範囲内の兵を抽出
  const troopsInSelection = placedTroops.filter((troop) =>
    selectedTiles.has(`${troop.x},${troop.y}`)
  );

  // 軍内の全兵を抽出
  const troopsInArmy = placedTroops.filter((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  // 1. 選択範囲が軍内に含まれているかチェック
  const allInArmy = troopsInSelection.every((troop) =>
    army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
  );

  if (!allInArmy) {
    return {
      isValid: false,
      errorMessage: "選択範囲は軍内のマスのみ選択可能です",
    };
  }

  // 2. 選択範囲内の兵が2以上かチェック
  if (troopsInSelection.length < 2) {
    return {
      isValid: false,
      errorMessage: "分割する軍は最低2体以上の兵が必要です",
    };
  }

  // 3. 残りの兵が2以上かチェック
  const remainingTroops = troopsInArmy.filter(
    (troop) => !selectedTiles.has(`${troop.x},${troop.y}`)
  );

  if (remainingTroops.length < 2) {
    return {
      isValid: false,
      errorMessage: "元の軍にも最低2体以上の兵が残る必要があります",
    };
  }

  // 4. 選択範囲内の兵が連結しているかチェック
  if (!areAllTroopsConnected(troopsInSelection)) {
    return {
      isValid: false,
      errorMessage: "分割する軍の兵は全て隣り合っている必要があります",
    };
  }

  // 5. 残りの兵が連結しているかチェック
  if (!areAllTroopsConnected(remainingTroops)) {
    return {
      isValid: false,
      errorMessage: "分割後の元の軍の兵も全て隣り合っている必要があります",
    };
  }

  return { isValid: true };
}

/**
 * 全ての兵が連結しているかをBFSで確認する
 */
function areAllTroopsConnected(troops: PlacedTroop[]): boolean {
  if (troops.length === 0) return false;
  if (troops.length === 1) return true;

  // 座標から兵を検索しやすくするためのMap
  const troopMap = new Map<string, PlacedTroop>();
  troops.forEach((troop) => {
    troopMap.set(`${troop.x},${troop.y}`, troop);
  });

  // BFSで連結性を確認
  const visited = new Set<string>();
  const queue: PlacedTroop[] = [troops[0]];
  visited.add(`${troops[0].x},${troops[0].y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { x, y } = current;

    // 上下左右の隣接マスをチェック
    const neighbors = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (troopMap.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push(troopMap.get(key)!);
      }
    }
  }

  // 全ての兵を訪問できたかチェック
  return visited.size === troops.length;
}
