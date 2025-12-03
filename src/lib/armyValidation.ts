import type { PlacedTroop } from "./placement";

/**
 * 選択範囲内の兵をバリデーションする
 */
export function validateArmySelection(
  selectedTiles: Set<string>,
  placedTroops: PlacedTroop[]
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

  // 2. 全ての兵が隣り合っているかチェック（連結性の確認）
  if (!areAllTroopsConnected(troopsInSelection)) {
    return {
      isValid: false,
      errorMessage: "軍内の兵は全て隣り合っている必要があります",
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
