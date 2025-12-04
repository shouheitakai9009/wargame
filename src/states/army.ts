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

/**
 * 軍のカラーマスター（赤は敵用なので除外）
 */
export const ARMY_COLORS = {
  BLUE: {
    name: "青",
    border: "rgba(59, 130, 246, 0.8)", // blue-500
    background: "rgba(37, 99, 235, 0.9)", // blue-600 (darker)
    shadow: "rgba(59, 130, 246, 0.4)",
  },
  GREEN: {
    name: "緑",
    border: "rgba(34, 197, 94, 0.8)", // green-500
    background: "rgba(22, 163, 74, 0.9)", // green-600 (darker)
    shadow: "rgba(34, 197, 94, 0.4)",
  },
  YELLOW: {
    name: "黄",
    border: "rgba(234, 179, 8, 0.8)", // yellow-500
    background: "rgba(202, 138, 4, 0.9)", // yellow-600 (darker)
    shadow: "rgba(234, 179, 8, 0.4)",
  },
  PURPLE: {
    name: "紫",
    border: "rgba(168, 85, 247, 0.8)", // purple-500
    background: "rgba(147, 51, 234, 0.9)", // purple-600 (darker)
    shadow: "rgba(168, 85, 247, 0.4)",
  },
  CYAN: {
    name: "シアン",
    border: "rgba(6, 182, 212, 0.8)", // cyan-500
    background: "rgba(8, 145, 178, 0.9)", // cyan-600 (darker)
    shadow: "rgba(6, 182, 212, 0.4)",
  },
  ORANGE: {
    name: "オレンジ",
    border: "rgba(249, 115, 22, 0.8)", // orange-500
    background: "rgba(234, 88, 12, 0.9)", // orange-600 (darker)
    shadow: "rgba(249, 115, 22, 0.4)",
  },
  PINK: {
    name: "ピンク",
    border: "rgba(236, 72, 153, 0.8)", // pink-500
    background: "rgba(219, 39, 119, 0.9)", // pink-600 (darker)
    shadow: "rgba(236, 72, 153, 0.4)",
  },
  INDIGO: {
    name: "藍",
    border: "rgba(99, 102, 241, 0.8)", // indigo-500
    background: "rgba(79, 70, 229, 0.9)", // indigo-600 (darker)
    shadow: "rgba(99, 102, 241, 0.4)",
  },
} as const;

export type ArmyColorKey = keyof typeof ARMY_COLORS;
export type ArmyColor = (typeof ARMY_COLORS)[ArmyColorKey];

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
  color: ArmyColorKey; // 軍の象徴カラー
};
