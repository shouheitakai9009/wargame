import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/states";
import { executeAttackPhase, addAttackEffect } from "./combat";
import { updateTroopHp, updateArmyMorale } from "./army";
import { checkVictoryCondition, markArmyAsActed, endPlayerPhase } from "./battle";
import { selectRevealedTiles } from "./visibility";
import { initialMap } from "@/data/initialMap";
import { increaseMorale, isFlankAttack, isArmyDestroyed } from "./morale";

/**
 * 遅延処理用のヘルパー関数
 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 攻撃フェーズを実行するthunk
 */
export const executePlayerAttackPhaseThunk = createAsyncThunk(
  "attackPhase/executePlayerAttackPhase",
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const armies = state.army.armies;
    const playerTroops = state.army.playerTroops;
    const enemyTroops = state.army.enemyTroops;
    const actedArmyIds = state.battle.actedArmyIds;
    const revealedTiles = selectRevealedTiles(state);

    // ① 攻撃フェーズを実行（攻撃ログを作成）
    dispatch(
      executeAttackPhase({
        armies,
        playerTroops,
        enemyTroops,
        visibleTiles: revealedTiles,
        mapData: initialMap,
        actedArmyIds,
      })
    );

    // ② 攻撃ログを取得
    const updatedState = getState() as RootState;
    const attackLog = updatedState.combat.attackLog;

    // ③ 攻撃ログを処理（順次実行してエフェクトを表示）
    for (const log of attackLog) {
      // HP減少
      const currentState = getState() as RootState;
      const attacker = currentState.army.playerTroops.find(
        (t) => t.id === log.attackerTroopId
      );
      const defender = currentState.army.enemyTroops.find(
        (t) => t.id === log.defenderTroopId
      );

      if (attacker && defender) {
        // エフェクトを追加
        dispatch(
          addAttackEffect({
            id: `${log.timestamp}-${log.attackerTroopId}-${log.defenderTroopId}`,
            attackerX: attacker.x,
            attackerY: attacker.y,
            defenderX: defender.x,
            defenderY: defender.y,
            damage: log.damage,
            timestamp: log.timestamp,
          })
        );

        // 次の攻撃まで少し待つ（エフェクトが見やすくなる）
        await delay(300);
      }

      if (defender) {
        const newHp = defender.hp - log.damage;
        dispatch(
          updateTroopHp({
            troopId: log.defenderTroopId,
            newHp,
            isPlayer: false,
          })
        );

        // 撃破判定・士気更新
        if (newHp <= 0) {
          const stateAfterHpUpdate = getState() as RootState;

          // 敵軍を特定
          const defenderArmy = stateAfterHpUpdate.army.armies.find(
            (army) =>
              army.id.startsWith("enemy-") &&
              army.positions.some(
                (pos) => pos.x === defender.x && pos.y === defender.y
              )
          );

          const attackerArmy = stateAfterHpUpdate.army.armies.find(
            (a) => a.id === log.attackerArmyId
          );

          if (defenderArmy && attackerArmy) {
            // 軍が撃破されたか判定
            const updatedEnemyTroops = stateAfterHpUpdate.army.enemyTroops;

            if (isArmyDestroyed(defenderArmy, updatedEnemyTroops)) {
              // 士気+1
              const newMorale = increaseMorale(attackerArmy.morale);
              dispatch(
                updateArmyMorale({
                  armyId: log.attackerArmyId,
                  newMorale,
                })
              );
            }

            // 側面攻撃チェック
            if (isFlankAttack(attackerArmy.direction, defenderArmy.direction)) {
              const currentMorale = (getState() as RootState).army.armies.find(
                (a) => a.id === log.attackerArmyId
              )?.morale ?? 1;
              const newMorale = increaseMorale(currentMorale);
              dispatch(
                updateArmyMorale({
                  armyId: log.attackerArmyId,
                  newMorale,
                })
              );
            }
          }
        }
      }

      // 攻撃した軍を行動済みに追加
      dispatch(
        markArmyAsActed({
          armyId: log.attackerArmyId,
        })
      );
    }

    // ④ 勝利判定
    const finalState = getState() as RootState;
    dispatch(
      checkVictoryCondition({
        enemyTroops: finalState.army.enemyTroops,
      })
    );

    // ⑤ ターン終了
    dispatch(endPlayerPhase());
  }
);
