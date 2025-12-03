/**
 * 軍の定数と型定義
 */

// 軍の向き
export const ARMY_DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
} as const;

export type ArmyDirection =
  (typeof ARMY_DIRECTION)[keyof typeof ARMY_DIRECTION];

// 最小・最大士気
export const MIN_MORALE = 1;
export const MAX_MORALE = 3;

// 最大兵力
export const MAX_TROOP_HEALTH = 1000;

/**
 * 軍の型定義
 */
export type Army = {
  id: string;
  name: string;
  morale: number; // 1~3
  direction: ArmyDirection;
  positions: Array<{ x: number; y: number }>; // 軍が占める位置の配列
};
