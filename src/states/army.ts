import type { Soldier } from "./soldier";

// 方向
export const DIRECTION = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
} as const;

export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];

// 軍
export type Army = {
  name: string;
  morale: 1 | 2 | 3;
  direction: Direction;
  soldiers: Soldier[];
};
