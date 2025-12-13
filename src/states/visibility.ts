import { TERRAIN_TYPE } from "./terrain";

/**
 * 各兵の視界情報
 */
export type TroopVision = {
  troopId: string;
  position: { x: number; y: number };
  visibleTiles: string[]; // "x,y" 形式の座標文字列（Reduxで保存可能な配列型）
};

/**
 * 視界距離マップ（地形タイプごと）
 */
export const VISION_RANGE: Record<number, number> = {
  [TERRAIN_TYPE.GRASS]: 5,
  [TERRAIN_TYPE.WATER]: 2,
  [TERRAIN_TYPE.FOREST]: 1,
  [TERRAIN_TYPE.MOUNTAIN_1]: 5,
  [TERRAIN_TYPE.MOUNTAIN_2]: 7,
  [TERRAIN_TYPE.MOUNTAIN_3]: 10,
} as const;

/**
 * 同じ地形タイプ同士での視認制限
 * 自分と敵が同じ地形タイプにいる場合のみ、この距離で視認可能
 */
export const SAME_TERRAIN_VISION_LIMIT: Partial<Record<number, number>> = {
  [TERRAIN_TYPE.WATER]: 2, // 水-水: 2マス以内
  [TERRAIN_TYPE.FOREST]: 1, // 森-森: 1マス以内
} as const;
