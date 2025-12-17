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
    isDead: false,
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
  createTroop("enemy-left-1", 6, 5, "INFANTRY"),
  createTroop("enemy-left-2", 7, 5, "INFANTRY"),
  createTroop("enemy-left-3", 6, 6, "INFANTRY"),
  createTroop("enemy-left-4", 7, 6, "INFANTRY"),
  createTroop("enemy-left-5", 8, 5, "INFANTRY"),
  // 弓兵（後方支援）
  createTroop("enemy-left-6", 5, 7, "ARCHER"),
  createTroop("enemy-left-7", 6, 7, "ARCHER"),
  // 盾兵（前線）
  createTroop("enemy-left-8", 5, 4, "SHIELD"),
  createTroop("enemy-left-9", 6, 4, "SHIELD"),
  // 騎兵（機動力）
  createTroop("enemy-left-10", 8, 7, "CAVALRY"),
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
  createTroop("enemy-central-1", 20, 6, "GENERAL"),
  // 盾兵（将軍を守る）
  createTroop("enemy-central-2", 19, 6, "SHIELD"),
  createTroop("enemy-central-3", 21, 6, "SHIELD"),
  // 歩兵（中央）
  createTroop("enemy-central-4", 19, 5, "INFANTRY"),
  createTroop("enemy-central-5", 20, 5, "INFANTRY"),
  createTroop("enemy-central-6", 21, 5, "INFANTRY"),
  createTroop("enemy-central-7", 20, 4, "INFANTRY"),
  // 弓兵（前方）
  createTroop("enemy-central-8", 19, 4, "ARCHER"),
  createTroop("enemy-central-9", 21, 4, "ARCHER"),
  createTroop("enemy-central-10", 20, 3, "ARCHER"),
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
  createTroop("enemy-right-1", 24, 3, "CAVALRY"),
  createTroop("enemy-right-2", 25, 3, "CAVALRY"),
  createTroop("enemy-right-3", 26, 3, "CAVALRY"),
  createTroop("enemy-right-4", 24, 4, "CAVALRY"),
  createTroop("enemy-right-5", 25, 4, "CAVALRY"),
  createTroop("enemy-right-6", 26, 4, "CAVALRY"),
  createTroop("enemy-right-7", 24, 5, "CAVALRY"),
  createTroop("enemy-right-8", 25, 5, "CAVALRY"),
  createTroop("enemy-right-9", 26, 5, "CAVALRY"),
  // 弓兵（後方支援）
  createTroop("enemy-right-10", 25, 6, "ARCHER"),
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
