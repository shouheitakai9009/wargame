import {
  MAX_MORALE,
  type Army,
  type ArmyDirection,
} from "@/states/army";
import type { PlacedTroop } from "@/lib/placement";

/**
 * 士気を上昇させる
 *
 * @param currentMorale - 現在の士気
 * @param amount - 上昇量（デフォルト1）
 * @returns 上昇後の士気（最大値を超えない）
 */
export function increaseMorale(
  currentMorale: number,
  amount: number = 1
): number {
  return Math.min(MAX_MORALE, currentMorale + amount);
}

/**
 * 側面攻撃かどうかを判定する
 *
 * 攻撃者の向きと防御者の向きが異なる場合に側面攻撃と判定
 *
 * @param attackerDirection - 攻撃者の向き
 * @param defenderDirection - 防御者の向き
 * @returns 側面攻撃かどうか
 */
export function isFlankAttack(
  attackerDirection: ArmyDirection,
  defenderDirection: ArmyDirection
): boolean {
  return attackerDirection !== defenderDirection;
}

/**
 * 軍が撃破されたかどうかを判定する
 *
 * 軍内の全兵が死亡している場合に撃破と判定
 *
 * @param army - 対象の軍
 * @param troops - 全兵のリスト
 * @returns 軍が撃破されたかどうか
 */
export function isArmyDestroyed(
  army: Army,
  troops: PlacedTroop[]
): boolean {
  // 軍内の兵IDを取得
  const armyTroopIds = new Set(
    army.positions
      .map((pos) => {
        const troop = troops.find((t) => t.x === pos.x && t.y === pos.y);
        return troop?.id;
      })
      .filter(Boolean)
  );

  // 全兵が死亡しているか判定
  return Array.from(armyTroopIds).every((troopId) => {
    const troop = troops.find((t) => t.id === troopId);
    return troop?.isDead ?? false;
  });
}
