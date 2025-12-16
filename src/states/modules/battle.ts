import {
  BATTLE_PHASE,
  BATTLE_MOVE_MODE,
  TURN_PHASE,
  type BattlePhase,
  type BattleMoveMode,
  type TurnPhase,
} from "../battle";
import { calculateArmySpeed, calculateMovableTiles } from "@/lib/armyMovement";
import type { Army, ArmyDirection } from "../army";
import type { PlacedTroop } from "@/lib/placement";
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { calculateAttackHeatMap } from "@/lib/range";

export type BattleState = {
  phase: BattlePhase;
  turn: number;
  turnPhase: TurnPhase;
  battleMoveMode: BattleMoveMode;
  movingArmyId: string | null;
  movableTiles: Array<{ x: number; y: number }> | null;
};

export const initialBattleState: BattleState = {
  phase: BATTLE_PHASE.PREPARATION,
  turn: 0,
  turnPhase: TURN_PHASE.PLAYER,
  battleMoveMode: BATTLE_MOVE_MODE.NONE,
  movingArmyId: null,
  movableTiles: null,
};

// 循環依存を避けるため、必要なデータはPayloadで受け取る設計にする
// switchBattleMoveModeで移動可能範囲を計算するには armies と placedTroops が必要
export const battleSlice = createSlice({
  name: "battle",
  initialState: initialBattleState,
  reducers: {
    startBattle: (state) => {
      state.phase = BATTLE_PHASE.BATTLE;
      state.turn = 1;
      state.turnPhase = TURN_PHASE.PLAYER;
    },
    endPlayerPhase: (state) => {
      state.turnPhase = TURN_PHASE.ENEMY;
    },
    endEnemyPhase: (state) => {
      state.turnPhase = TURN_PHASE.PLAYER;
      state.turn += 1;
    },
    // 旧nextTurn互換（デバッグ用または強制ターン進行用）
    nextTurn: (state) => {
      state.turn += 1;
      state.turnPhase = TURN_PHASE.PLAYER;
    },
    endBattle: (state) => {
      state.phase = BATTLE_PHASE.RESULT;
    },
    finishBattle: (state) => {
      state.phase = initialBattleState.phase;
      state.turn = initialBattleState.turn;
      state.turnPhase = initialBattleState.turnPhase;
    },
    switchBattleMoveMode: (
      state,
      action: PayloadAction<{
        mode: BattleMoveMode;
        armyId?: string;
        // 計算に必要なデータをPayloadで受け取る
        context?: {
          armies: Army[];
          placedTroops: PlacedTroop[];
        };
      }>
    ) => {
      state.battleMoveMode = action.payload.mode;

      if (
        action.payload.mode === BATTLE_MOVE_MODE.MOVE &&
        action.payload.armyId &&
        action.payload.context
      ) {
        state.movingArmyId = action.payload.armyId;

        const { armies, placedTroops } = action.payload.context;
        const army = armies.find((a) => a.id === action.payload.armyId);

        if (army) {
          const armySpeed = calculateArmySpeed(army, placedTroops);
          const movableTiles = calculateMovableTiles(
            army,
            armySpeed,
            placedTroops,
            armies
          );
          state.movableTiles = movableTiles;
        }
      } else {
        state.movingArmyId = null;
        state.movableTiles = null;
      }
    },
    // moveArmyToTile完了時にMoveModeをリセットする必要がある
    resetBattleMoveMode: (state) => {
      state.battleMoveMode = BATTLE_MOVE_MODE.NONE;
      state.movingArmyId = null;
      state.movableTiles = null;
    },
  },
});

export const {
  startBattle,
  endPlayerPhase,
  endEnemyPhase,
  nextTurn,
  endBattle,
  finishBattle,
  switchBattleMoveMode,
  resetBattleMoveMode,
} = battleSlice.actions;

export default battleSlice.reducer;

// Selectors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectPlayerTroops = (state: any) =>
  state.army.playerTroops as PlacedTroop[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectEnemyTroops = (state: any) =>
  state.army.enemyTroops as PlacedTroop[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectArmies = (state: any) => state.army.armies as Army[];

import { selectRevealedTiles } from "./visibility";

export const selectAttackRangeMap = createSelector(
  [
    selectPlayerTroops,
    selectEnemyTroops,
    selectArmies,
    (state: any) => selectRevealedTiles(state),
  ],
  (playerTroops, enemyTroops, armies, revealedTiles) => {
    // 敵軍は視界内のものだけを計算対象にする
    const visibleEnemyTroops = enemyTroops.filter((t) =>
      revealedTiles.has(`${t.x},${t.y}`)
    );

    const allTroops = [...playerTroops, ...visibleEnemyTroops];

    // 座標ごとの軍の向きマップを作成
    const posToDir = new Map<string, ArmyDirection>();
    armies.forEach((army) => {
      army.positions.forEach((pos) => {
        posToDir.set(`${pos.x},${pos.y}`, army.direction);
      });
    });

    // 各兵の向きを特定
    const troopDirections: Record<string, ArmyDirection> = {};
    allTroops.forEach((troop) => {
      const dir = posToDir.get(`${troop.x},${troop.y}`);
      if (dir) {
        troopDirections[troop.id] = dir;
      }
    });

    return calculateAttackHeatMap(allTroops, troopDirections);
  }
);
