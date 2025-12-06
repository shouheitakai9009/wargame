import { ARMY_DIRECTION, type Army } from "../states/army";
import { SOLDIER_STATS, type SoldierType } from "../states/soldier";
import type { PlacedTroop } from "../lib/placement";

// ヘルパー関数：兵を作成
const createTroop = (x: number, y: number, type: SoldierType): PlacedTroop => {
  const stats = SOLDIER_STATS[type];
  return {
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
  createTroop(8, 20, "CAVALRY"),
  createTroop(8, 21, "CAVALRY"),
  createTroop(8, 22, "CAVALRY"),
  createTroop(8, 23, "CAVALRY"),
  // 右列
  createTroop(9, 20, "CAVALRY"),
  createTroop(9, 21, "CAVALRY"),
  createTroop(9, 22, "CAVALRY"),
  createTroop(9, 23, "CAVALRY"),
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
  createTroop(15, 20, "INFANTRY"),
  createTroop(15, 21, "INFANTRY"),
  createTroop(15, 22, "INFANTRY"),
  createTroop(15, 23, "ARCHER"),
  createTroop(15, 24, "ARCHER"),
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
  createTroop(20, 25, "SHIELD"),
  createTroop(21, 25, "SHIELD"),
  createTroop(22, 25, "SHIELD"),
  // 中段
  createTroop(20, 26, "SHIELD"),
  createTroop(21, 26, "GENERAL"), // 将軍
  createTroop(22, 26, "SHIELD"),
  // 下段
  createTroop(20, 27, "SHIELD"),
  createTroop(21, 27, "SHIELD"),
  createTroop(22, 27, "SHIELD"),
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
  createTroop(26, 20, "CAVALRY"),
  createTroop(26, 21, "INFANTRY"),
  createTroop(26, 22, "ARCHER"),
  createTroop(26, 23, "ARCHER"),
  // 右列
  createTroop(27, 20, "CAVALRY"),
  createTroop(27, 21, "INFANTRY"),
  createTroop(27, 22, "ARCHER"),
  createTroop(27, 23, "ARCHER"),
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
