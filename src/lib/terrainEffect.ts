import { TERRAIN_TYPE, type Terrain } from "@/states/terrain";
import { SOLDIER_STATS, type SoldierType } from "@/states/soldier";

export type TerrainEffect = {
  name: string;
  description: string;
  effects: Array<{
    stat: "attack" | "defense" | "range" | "speed";
    change: number; // 正の値は増加、負の値は減少
  }>;
};

/**
 * 特定の兵種と地形に対する効果を計算する
 */
export function getTerrainEffect(
  soldierType: SoldierType,
  terrain: Terrain
): TerrainEffect | null {
  switch (terrain.type) {
    case TERRAIN_TYPE.GRASS:
      // 草：特殊効果なし
      return null;

    case TERRAIN_TYPE.WATER:
      // 水：全兵種が速さ1になり、攻撃、防御、射程が2ずつ下がる
      // 速度が1になる = 元の速度 - 1
      const currentSpeed = SOLDIER_STATS[soldierType].speed;
      return {
        name: "水",
        description: "全身が水に浸かっている",
        effects: [
          { stat: "attack", change: -2 },
          { stat: "defense", change: -2 },
          { stat: "range", change: -2 },
          { stat: "speed", change: 1 - currentSpeed },
        ],
      };

    case TERRAIN_TYPE.FOREST:
      // 森：兵種によって効果が異なる
      if (soldierType === "ARCHER") {
        return {
          name: "森",
          description: "木々に視界を遮られている",
          effects: [{ stat: "range", change: -2 }],
        };
      } else if (soldierType === "INFANTRY") {
        return {
          name: "森",
          description: "森の中で身を隠している",
          effects: [
            { stat: "attack", change: 1 },
            { stat: "defense", change: 1 },
          ],
        };
      } else if (soldierType === "CAVALRY" || soldierType === "GENERAL") {
        return {
          name: "森",
          description: "森の中で動きが制限されている",
          effects: [
            { stat: "attack", change: -1 },
            { stat: "defense", change: -1 },
            { stat: "speed", change: -2 },
          ],
        };
      } else if (soldierType === "SHIELD") {
        return {
          name: "森",
          description: "森の中で身を隠している",
          effects: [
            { stat: "attack", change: 1 },
            { stat: "defense", change: 1 },
          ],
        };
      }
      return null;

    case TERRAIN_TYPE.MOUNTAIN_1:
    case TERRAIN_TYPE.MOUNTAIN_2:
    case TERRAIN_TYPE.MOUNTAIN_3:
      // 山：効果の記載がないので null
      return null;

    default:
      return null;
  }
}
