import { ARMY_DIRECTION, type Army } from "../states/army";
import { SOLDIER_STATS, type SoldierType } from "../states/soldier";
import type { PlacedTroop } from "../lib/placement";

// ヘルパー関数：兵を作成
const createTroop = (
  id: string,
  x: number,
  y: number,
  type: SoldierType
): PlacedTroop => {
  const stats = SOLDIER_STATS[type];
  return {
    id,
    x,
    y,
    type,
    hp: 1000,
    theme: stats.theme,
  };
};

// 1. 秦国左翼 (Qin Left Wing)
const leftWingTroops: PlacedTroop[] = [
  // 左列
  createTroop("player-left-1", 8, 20, "CAVALRY"),
  createTroop("player-left-2", 8, 21, "CAVALRY"),
  createTroop("player-left-3", 8, 22, "CAVALRY"),
  createTroop("player-left-4", 8, 23, "CAVALRY"),
  // 右列
  createTroop("player-left-5", 9, 20, "CAVALRY"),
  createTroop("player-left-6", 9, 21, "CAVALRY"),
  createTroop("player-left-7", 9, 22, "CAVALRY"),
  createTroop("player-left-8", 9, 23, "CAVALRY"),
];

const leftWingArmy: Army = {
  id: "qin-left-wing",
  name: "秦国左翼",
  morale: 2,
  direction: ARMY_DIRECTION.UP,
  positions: leftWingTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "BLUE",
};

// 2. 秦国特攻軍 (Qin Special Attack Force)
const specialForceTroops: PlacedTroop[] = [
  createTroop("player-special-1", 15, 20, "INFANTRY"),
  createTroop("player-special-2", 15, 21, "INFANTRY"),
  createTroop("player-special-3", 15, 22, "INFANTRY"),
  createTroop("player-special-4", 15, 23, "ARCHER"),
  createTroop("player-special-5", 15, 24, "ARCHER"),
];

const specialForceArmy: Army = {
  id: "qin-special-force",
  name: "秦国特攻軍",
  morale: 3,
  direction: ARMY_DIRECTION.UP,
  positions: specialForceTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "GREEN",
};

// 3. 秦国中央軍 (Qin Central Army)
const centralArmyTroops: PlacedTroop[] = [
  // 上段
  createTroop("player-central-1", 20, 25, "SHIELD"),
  createTroop("player-central-2", 21, 25, "SHIELD"),
  createTroop("player-central-3", 22, 25, "SHIELD"),
  // 中段
  createTroop("player-central-4", 20, 26, "SHIELD"),
  createTroop("player-central-5", 21, 26, "GENERAL"), // 将軍
  createTroop("player-central-6", 22, 26, "SHIELD"),
  // 下段
  createTroop("player-central-7", 20, 27, "SHIELD"),
  createTroop("player-central-8", 21, 27, "SHIELD"),
  createTroop("player-central-9", 22, 27, "SHIELD"),
];

const centralArmy: Army = {
  id: "qin-central-army",
  name: "秦国中央軍",
  morale: 3,
  direction: ARMY_DIRECTION.UP,
  positions: centralArmyTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "ORANGE",
};

// 4. 秦国右翼 (Qin Right Wing)
const rightWingTroops: PlacedTroop[] = [
  // 左列
  createTroop("player-right-1", 26, 20, "CAVALRY"),
  createTroop("player-right-2", 26, 21, "INFANTRY"),
  createTroop("player-right-3", 26, 22, "ARCHER"),
  createTroop("player-right-4", 26, 23, "ARCHER"),
  // 右列
  createTroop("player-right-5", 27, 20, "CAVALRY"),
  createTroop("player-right-6", 27, 21, "INFANTRY"),
  createTroop("player-right-7", 27, 22, "ARCHER"),
  createTroop("player-right-8", 27, 23, "ARCHER"),
];

const rightWingArmy: Army = {
  id: "qin-right-wing",
  name: "秦国右翼",
  morale: 2,
  direction: ARMY_DIRECTION.UP,
  positions: rightWingTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "PURPLE",
};

// エクスポートデータ
export const initialArmies: Army[] = [
  leftWingArmy,
  specialForceArmy,
  centralArmy,
  rightWingArmy,
];

export const initialPlacedTroops: PlacedTroop[] = [
  ...leftWingTroops,
  ...specialForceTroops,
  ...centralArmyTroops,
  ...rightWingTroops,
];
