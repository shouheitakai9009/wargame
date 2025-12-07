import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BATTLE_PHASE,
  BATTLE_MOVE_MODE,
  type BattlePhase,
  type BattleMoveMode,
} from "../battle";
import { calculateArmySpeed, calculateMovableTiles } from "@/lib/armyMovement";
import type { Army } from "../army";
import type { PlacedTroop } from "@/lib/placement";

export type BattleState = {
  phase: BattlePhase;
  turn: number;
  battleMoveMode: BattleMoveMode;
  movingArmyId: string | null;
  movableTiles: Array<{ x: number; y: number }> | null;
};

export const initialBattleState: BattleState = {
  phase: BATTLE_PHASE.PREPARATION,
  turn: 0,
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
    },
    nextTurn: (state) => {
      state.turn += 1;
    },
    endBattle: (state) => {
      state.phase = BATTLE_PHASE.RESULT;
    },
    finishBattle: (state) => {
      state.phase = initialBattleState.phase;
      state.turn = initialBattleState.turn;
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
  nextTurn,
  endBattle,
  finishBattle,
  switchBattleMoveMode,
  resetBattleMoveMode,
} = battleSlice.actions;

export default battleSlice.reducer;
