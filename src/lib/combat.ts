import { SOLDIER_STATS, type SoldierType } from "@/states/soldier";
import type { Terrain } from "@/states/terrain";
import { getTerrainEffect, type TerrainEffect } from "./terrainEffect";
import type { PlacedTroop } from "./placement";

/**
 * ダメージ計算のパラメータ
 */
export type DamageCalculationParams = {
  attackerType: SoldierType;
  attackerTerrain: Terrain;
  attackerMorale: number;
  defenderType: SoldierType;
  defenderTerrain: Terrain;
  defenderMorale: number;
};

/**
 * 地形効果を特定のステータスに適用
 */
function applyStatModifiers(
  baseStat: number,
  effect: TerrainEffect | null,
  statType: "attack" | "defense" | "range" | "speed"
): number {
  if (!effect) return baseStat;

  const modifier = effect.effects.find((e) => e.stat === statType);
  return Math.max(1, baseStat + (modifier?.change ?? 0));
}

/**
 * ダメージを計算する
 *
 * ダメージ計算式:
 * 1. 基礎ステータスを取得
 * 2. 地形効果を適用
 * 3. 士気ボーナスを適用（士気1につき攻撃+1、防御+1）
 * 4. (攻撃力 - 防御力) × 100、最低1
 *
 * @param params - ダメージ計算パラメータ
 * @returns ダメージ量
 */
export function calculateDamage(params: DamageCalculationParams): number {
  // ① 基礎ステータス取得
  const baseAttack = SOLDIER_STATS[params.attackerType].attack;
  const baseDefense = SOLDIER_STATS[params.defenderType].defense;

  // ② 地形効果を適用
  const attackerEffect = getTerrainEffect(
    params.attackerType,
    params.attackerTerrain
  );
  const defenderEffect = getTerrainEffect(
    params.defenderType,
    params.defenderTerrain
  );

  const modifiedAttack = applyStatModifiers(
    baseAttack,
    attackerEffect,
    "attack"
  );
  const modifiedDefense = applyStatModifiers(
    baseDefense,
    defenderEffect,
    "defense"
  );

  // ③ 士気ボーナスを適用（士気1=ボーナス0、士気2=ボーナス+1、士気3=ボーナス+2）
  const finalAttack = modifiedAttack + (params.attackerMorale - 1);
  const finalDefense = modifiedDefense + (params.defenderMorale - 1);

  // ④ ダメージ計算（攻撃力 - 防御力）×100、最低1
  const rawDamage = (finalAttack - finalDefense) * 100;
  return Math.max(1, rawDamage);
}

/**
 * HP減少を適用する
 *
 * @param troop - 対象の兵
 * @param damage - ダメージ量
 * @returns HP減少後の兵
 */
export function applyDamage(troop: PlacedTroop, damage: number): PlacedTroop {
  const newHp = Math.max(0, troop.hp - damage);
  return {
    ...troop,
    hp: newHp,
    isDead: newHp === 0,
  };
}

/**
 * 兵が撃破されたかを判定
 *
 * @param troop - 対象の兵
 * @returns 撃破されたか
 */
export function isTroopDead(troop: PlacedTroop): boolean {
  return troop.hp <= 0;
}
