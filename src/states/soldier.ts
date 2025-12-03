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

export const SOLDIER_STATS: Record<
  SoldierType,
  {
    name: string;
    attack: number;
    defense: number;
    range: number;
    speed: number;
    theme: {
      primary: string;
      secondary: string;
    };
  }
> = {
  GENERAL: {
    name: "将軍",
    attack: 5,
    defense: 5,
    range: 1,
    speed: 5,
    theme: {
      primary: "#8b5cf6", // purple
      secondary: "#c084fc",
    },
  },
  INFANTRY: {
    name: "歩兵",
    attack: 3,
    defense: 3,
    range: 1,
    speed: 3,
    theme: {
      primary: "#3b82f6", // blue
      secondary: "#60a5fa",
    },
  },
  ARCHER: {
    name: "弓兵",
    attack: 3,
    defense: 1,
    range: 4,
    speed: 3,
    theme: {
      primary: "#10b981", // green
      secondary: "#34d399",
    },
  },
  SHIELD: {
    name: "盾兵",
    attack: 1,
    defense: 5,
    range: 1,
    speed: 2,
    theme: {
      primary: "#f59e0b", // amber
      secondary: "#fbbf24",
    },
  },
  CAVALRY: {
    name: "騎兵",
    attack: 4,
    defense: 3,
    range: 1,
    speed: 5,
    theme: {
      primary: "#ef4444", // red
      secondary: "#f87171",
    },
  },
};
