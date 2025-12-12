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

/**
 * 敵国左翼（10体）
 * 配置エリア: x=0~9, y=2~8
 * 戦略: 森（x=6~8）を活用し、歩兵を森に配置して防御を強化
 */
const enemyLeftWingTroops: PlacedTroop[] = [
  // 森エリア内の歩兵（防御強化）
  createTroop(6, 5, "INFANTRY"),
  createTroop(7, 5, "INFANTRY"),
  createTroop(6, 6, "INFANTRY"),
  createTroop(7, 6, "INFANTRY"),
  createTroop(8, 5, "INFANTRY"),
  // 弓兵（後方支援）
  createTroop(5, 7, "ARCHER"),
  createTroop(6, 7, "ARCHER"),
  // 盾兵（前線）
  createTroop(5, 4, "SHIELD"),
  createTroop(6, 4, "SHIELD"),
  // 騎兵（機動力）
  createTroop(8, 7, "CAVALRY"),
];

const enemyLeftWingArmy: Army = {
  id: "enemy-left-wing",
  name: "敵国左翼",
  morale: 1,
  direction: ARMY_DIRECTION.DOWN,
  positions: enemyLeftWingTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "PINK",
};

/**
 * 敵国中央軍（10体）
 * 配置エリア: x=17~23, y=1~7
 * 戦略: 山脈を背にして防御を固め、弓兵を前方に配置
 */
const enemyCentralArmyTroops: PlacedTroop[] = [
  // 将軍（中央後方、山の近く）
  createTroop(20, 6, "GENERAL"),
  // 盾兵（将軍を守る）
  createTroop(19, 6, "SHIELD"),
  createTroop(21, 6, "SHIELD"),
  // 歩兵（中央）
  createTroop(19, 5, "INFANTRY"),
  createTroop(20, 5, "INFANTRY"),
  createTroop(21, 5, "INFANTRY"),
  createTroop(20, 4, "INFANTRY"),
  // 弓兵（前方）
  createTroop(19, 4, "ARCHER"),
  createTroop(21, 4, "ARCHER"),
  createTroop(20, 3, "ARCHER"),
];

const enemyCentralArmy: Army = {
  id: "enemy-central-army",
  name: "敵国中央軍",
  morale: 1,
  direction: ARMY_DIRECTION.DOWN,
  positions: enemyCentralArmyTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "PINK",
};

/**
 * 敵国右翼（10体）
 * 配置エリア: x=24~29, y=2~8
 * 戦略: 騎兵で機動力を活かし、側面攻撃を狙う
 */
const enemyRightWingTroops: PlacedTroop[] = [
  // 騎兵部隊（9体）
  createTroop(24, 3, "CAVALRY"),
  createTroop(25, 3, "CAVALRY"),
  createTroop(26, 3, "CAVALRY"),
  createTroop(24, 4, "CAVALRY"),
  createTroop(25, 4, "CAVALRY"),
  createTroop(26, 4, "CAVALRY"),
  createTroop(24, 5, "CAVALRY"),
  createTroop(25, 5, "CAVALRY"),
  createTroop(26, 5, "CAVALRY"),
  // 弓兵（後方支援）
  createTroop(25, 6, "ARCHER"),
];

const enemyRightWingArmy: Army = {
  id: "enemy-right-wing",
  name: "敵国右翼",
  morale: 1,
  direction: ARMY_DIRECTION.DOWN,
  positions: enemyRightWingTroops.map((t) => ({ x: t.x, y: t.y })),
  color: "PINK",
};

// エクスポートデータ
export const enemyArmies: Army[] = [
  enemyLeftWingArmy,
  enemyCentralArmy,
  enemyRightWingArmy,
];

export const enemyPlacedTroops: PlacedTroop[] = [
  ...enemyLeftWingTroops,
  ...enemyCentralArmyTroops,
  ...enemyRightWingTroops,
];
