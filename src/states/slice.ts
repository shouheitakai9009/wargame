import type { PlacedTroop } from "@/lib/placement";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BATTLE_PHASE,
  type PreparationTab,
  type RightSidebarTab,
} from "./battle";
import { initialState } from "./state";

export const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // ユーザーがバトルを開始する
    startBattle: (state) => {
      state.phase = BATTLE_PHASE.BATTLE;
      state.turn = 1;
    },

    // ユーザーが次のターンに進む
    nextTurn: (state) => {
      state.turn += 1;
    },

    // ユーザーがバトルを終了する（結果フェーズへ）
    endBattle: (state) => {
      state.phase = BATTLE_PHASE.RESULT;
    },

    // ユーザーがバトルを完全に終了する（準備フェーズに戻る）
    finishBattle: (state) => {
      state.phase = initialState.phase;
      state.turn = initialState.turn;
      state.preparationTab = initialState.preparationTab;
      state.rightSidebarTab = initialState.rightSidebarTab;
    },

    // ユーザーが準備中のタブを切り替える
    switchPreparationTab: (state, action: PayloadAction<PreparationTab>) => {
      state.preparationTab = action.payload;
    },

    // ユーザーが右側サイドバーのタブを切り替える
    switchRightSidebarTab: (state, action: PayloadAction<RightSidebarTab>) => {
      state.rightSidebarTab = action.payload;
    },

    // ユーザーが兵を配置する
    placeTroop: (state, action: PayloadAction<PlacedTroop>) => {
      state.placedTroops.push(action.payload);
    },

    // ユーザーが兵を削除する
    removeTroop: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.placedTroops = state.placedTroops.filter(
        (troop) => troop.x !== action.payload.x || troop.y !== action.payload.y
      );
    },

    // ユーザーが兵カードのドラッグを開始する
    beginTroopDrag: (state) => {
      state.isDraggingTroop = true;
    },

    // ユーザーが兵カードのドラッグを終了する
    endTroopDrag: (state) => {
      state.isDraggingTroop = false;
    },
  },
});

export const {
  startBattle,
  nextTurn,
  endBattle,
  finishBattle,
  switchPreparationTab,
  switchRightSidebarTab,
  placeTroop,
  removeTroop,
  beginTroopDrag,
  endTroopDrag,
} = slice.actions;

export default slice.reducer;
