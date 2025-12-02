// 地形の種類
export const TERRAIN_TYPE = {
  GRASS: 1,
  WATER: 2,
  FOREST: 3,
  MOUNTAIN_1: 4,
  MOUNTAIN_2: 5,
  MOUNTAIN_3: 6,
} as const;

export type TerrainType = (typeof TERRAIN_TYPE)[keyof typeof TERRAIN_TYPE];

// 地形
export type Terrain = {
  type: TerrainType;
  height: 1 | 2 | 3;
};
