import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Army } from "@/states/army";
import type { PlacedTroop } from "@/lib/placement";
import type { Terrain } from "@/states/terrain";
import { calculateDamage } from "@/lib/combat";
import { selectAttackTarget } from "@/lib/targetSelection";
import { calculateAttackRange } from "@/lib/range";

/**
 * 攻撃ログエントリー
 */
export type AttackLogEntry = {
  timestamp: number;
  attackerArmyId: string;
  attackerTroopId: string;
  defenderTroopId: string;
  damage: number;
  isCounterAttack: boolean; // 迎撃の反撃かどうか
};

/**
 * 攻撃エフェクトの型定義
 */
export type AttackEffect = {
  id: string;
  attackerX: number;
  attackerY: number;
  defenderX: number;
  defenderY: number;
  damage: number;
  timestamp: number;
};

/**
 * combat stateの型定義
 */
export type CombatState = {
  attackLog: AttackLogEntry[];
  activeEffects: AttackEffect[];
};

const initialState: CombatState = {
  attackLog: [],
  activeEffects: [],
};

/**
 * 地形を取得するヘルパー関数
 */
function getTerrainAt(
  x: number,
  y: number,
  mapData: Terrain[]
): Terrain | null {
  const mapSize = Math.sqrt(mapData.length);
  const index = y * mapSize + x;
  return mapData[index] ?? null;
}

/**
 * combat slice
 *
 * 攻撃・迎撃のロジックを管理
 */
export const combatSlice = createSlice({
  name: "combat",
  initialState,
  reducers: {
    /**
     * 自ターン攻撃フェーズを実行
     *
     * 行動済みでない軍のみが攻撃を行い、攻撃対象を選定してダメージ計算を行う
     */
    executeAttackPhase: (
      state,
      action: PayloadAction<{
        armies: Army[];
        playerTroops: PlacedTroop[];
        enemyTroops: PlacedTroop[];
        visibleTiles: Set<string>;
        mapData: Terrain[];
        actedArmyIds: string[];
      }>
    ) => {
      const {
        armies,
        playerTroops,
        enemyTroops,
        visibleTiles,
        mapData,
        actedArmyIds,
      } = action.payload;

      // ① 行動済みでない自軍のみを対象
      const activeArmies = armies.filter(
        (army) => !actedArmyIds.includes(army.id) && !army.id.startsWith("enemy-")
      );

      activeArmies.forEach((army) => {
        // ② 軍内の兵を取得
        const armyTroops = playerTroops.filter((troop) =>
          army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
        );

        if (armyTroops.length === 0) return;

        // ③ 攻撃対象を選定
        const target = selectAttackTarget({
          attackerArmy: army,
          attackerTroops: armyTroops,
          enemyTroops,
          visibleTiles,
          mapData,
        });

        if (!target) return; // 攻撃対象なし

        // ④ 各兵がダメージを与える
        armyTroops.forEach((attacker) => {
          const attackerTerrain = getTerrainAt(attacker.x, attacker.y, mapData);
          const defenderTerrain = getTerrainAt(target.x, target.y, mapData);

          if (!attackerTerrain || !defenderTerrain) return;

          const damage = calculateDamage({
            attackerType: attacker.type,
            attackerTerrain,
            attackerMorale: army.morale,
            defenderType: target.type,
            defenderTerrain,
            defenderMorale: 1, // 敵の士気（後で動的に取得）
          });

          // ⑤ ログに記録
          state.attackLog.push({
            timestamp: Date.now(),
            attackerArmyId: army.id,
            attackerTroopId: attacker.id,
            defenderTroopId: target.id,
            damage,
            isCounterAttack: false,
          });
        });
      });
    },

    /**
     * 敵ターン迎撃フェーズを実行
     *
     * 敵軍が移動して自軍の射程内に入った場合、迎撃を行う
     * 相互攻撃の処理順序: ①迎撃 → ②反撃
     */
    executeInterception: (
      state,
      action: PayloadAction<{
        movedEnemyArmy: Army;
        playerArmies: Army[];
        playerTroops: PlacedTroop[];
        enemyTroops: PlacedTroop[];
        visibleTiles: Set<string>;
        mapData: Terrain[];
        actedArmyIds: string[];
      }>
    ) => {
      const {
        movedEnemyArmy,
        playerArmies,
        playerTroops,
        enemyTroops,
        visibleTiles,
        mapData,
        actedArmyIds,
      } = action.payload;

      // ① 行動済みでない自軍を検索
      const activePlayerArmies = playerArmies.filter(
        (army) => !actedArmyIds.includes(army.id)
      );

      activePlayerArmies.forEach((playerArmy) => {
        // ② 軍内の兵を取得
        const armyTroops = playerTroops.filter((troop) =>
          playerArmy.positions.some(
            (pos) => pos.x === troop.x && pos.y === troop.y
          )
        );

        if (armyTroops.length === 0) return;

        // ③ 攻撃範囲を計算
        const attackRangeSet = new Set<string>();
        armyTroops.forEach((troop) => {
          const range = calculateAttackRange(troop, playerArmy.direction);
          range.forEach((tile) => attackRangeSet.add(tile));
        });

        // ④ 敵軍のいずれかのマスが射程内かつ視界内か
        const enemyInRange = movedEnemyArmy.positions.some((pos) => {
          const key = `${pos.x},${pos.y}`;
          return attackRangeSet.has(key) && visibleTiles.has(key);
        });

        if (!enemyInRange) return; // 迎撃不可

        // ⑤ 迎撃実行（攻撃対象を選定）
        const target = selectAttackTarget({
          attackerArmy: playerArmy,
          attackerTroops: armyTroops,
          enemyTroops,
          visibleTiles,
          mapData,
        });

        if (!target) return;

        // ⑥ 迎撃ダメージ計算
        const attacker = armyTroops[0]; // 代表兵（簡略化）
        const attackerTerrain = getTerrainAt(attacker.x, attacker.y, mapData);
        const defenderTerrain = getTerrainAt(target.x, target.y, mapData);

        if (!attackerTerrain || !defenderTerrain) return;

        const damage = calculateDamage({
          attackerType: attacker.type,
          attackerTerrain,
          attackerMorale: playerArmy.morale,
          defenderType: target.type,
          defenderTerrain,
          defenderMorale: 1,
        });

        state.attackLog.push({
          timestamp: Date.now(),
          attackerArmyId: playerArmy.id,
          attackerTroopId: attacker.id,
          defenderTroopId: target.id,
          damage,
          isCounterAttack: false,
        });

        // ⑦ 反撃ダメージ計算
        const counterDamage = calculateDamage({
          attackerType: target.type,
          attackerTerrain: defenderTerrain,
          attackerMorale: 1,
          defenderType: attacker.type,
          defenderTerrain: attackerTerrain,
          defenderMorale: playerArmy.morale,
        });

        state.attackLog.push({
          timestamp: Date.now(),
          attackerArmyId: movedEnemyArmy.id,
          attackerTroopId: target.id,
          defenderTroopId: attacker.id,
          damage: counterDamage,
          isCounterAttack: true,
        });
      });
    },

    /**
     * 攻撃ログをクリア
     */
    clearAttackLog: (state) => {
      state.attackLog = [];
    },

    /**
     * 攻撃エフェクトを追加
     */
    addAttackEffect: (state, action: PayloadAction<AttackEffect>) => {
      state.activeEffects.push(action.payload);
    },

    /**
     * 攻撃エフェクトを削除
     */
    removeAttackEffect: (state, action: PayloadAction<{ id: string }>) => {
      state.activeEffects = state.activeEffects.filter(
        (effect) => effect.id !== action.payload.id
      );
    },

    /**
     * 全エフェクトをクリア
     */
    clearAllEffects: (state) => {
      state.activeEffects = [];
    },
  },
});

export const {
  executeAttackPhase,
  executeInterception,
  clearAttackLog,
  addAttackEffect,
  removeAttackEffect,
  clearAllEffects,
} = combatSlice.actions;

export default combatSlice.reducer;
