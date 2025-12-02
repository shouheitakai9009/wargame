// 兵種
export const SOLDIER_TYPE = {
  GENERAL: 1,
  INFANTRY: 2,
  ARCHER: 3,
  SHIELD: 4,
  CAVALRY: 5,
} as const;

export type SoldierType = keyof typeof SOLDIER_TYPE;

// 最大兵力
export const MAX_SOLDIER_HP = 1000;

// 兵
export type Soldier = {
  type: SoldierType;
  hp: number;
  attack: number;
  defense: number;
  range: number;
  speed: number;
};
