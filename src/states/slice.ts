import type { PlacedTroop } from "@/lib/placement";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BATTLE_PHASE,
  type PreparationTab,
  type RightSidebarTab,
  type ArmyFormationMode,
} from "./battle";
import { initialState } from "./state";
import type { Army } from "./army";
import { ARMY_DIRECTION } from "./army";

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

    // エラーメッセージを表示する
    showError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },

    // エラーメッセージを非表示にする
    hideError: (state) => {
      state.errorMessage = null;
    },

    // ユーザーが軍編成モードを切り替える
    switchArmyFormationMode: (
      state,
      action: PayloadAction<ArmyFormationMode>
    ) => {
      state.armyFormationMode = action.payload;
      // モード切り替え時は選択状態をリセット
      state.selectionDragStart = null;
      state.selectionDragCurrent = null;
    },

    // ユーザーが矩形選択のドラッグを開始する
    beginSelectionDrag: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.selectionDragStart = action.payload;
      state.selectionDragCurrent = action.payload;
    },

    // ユーザーが矩形選択のドラッグ中にマウスを移動する
    updateSelectionDrag: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.selectionDragCurrent = action.payload;
    },

    // ユーザーが矩形選択のドラッグを終了する
    endSelectionDrag: (state) => {
      state.selectionDragStart = null;
      state.selectionDragCurrent = null;
    },

    // ユーザーが軍ポップオーバーを開く
    openArmyPopover: (
      state,
      action: PayloadAction<Array<{ x: number; y: number }>>
    ) => {
      state.isArmyPopoverOpen = true;
      state.editingArmy = {
        name: "",
        morale: 1,
        direction: ARMY_DIRECTION.UP,
        positions: action.payload,
      };
    },

    // ユーザーが軍ポップオーバーを閉じる
    closeArmyPopover: (state) => {
      state.isArmyPopoverOpen = false;
      state.editingArmy = null;
    },

    // ユーザーが軍名を変更する
    updateArmyName: (state, action: PayloadAction<string>) => {
      if (state.editingArmy) {
        state.editingArmy.name = action.payload;
      }
    },

    // ユーザーが軍を確定する
    confirmArmy: (state) => {
      if (state.editingArmy) {
        const newArmy: Army = {
          id: `army-${Date.now()}`,
          name: state.editingArmy.name,
          morale: state.editingArmy.morale,
          direction: state.editingArmy.direction as any,
          positions: state.editingArmy.positions,
        };
        state.armies.push(newArmy);
        state.isArmyPopoverOpen = false;
        state.editingArmy = null;
      }
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
  showError,
  hideError,
  switchArmyFormationMode,
  beginSelectionDrag,
  updateSelectionDrag,
  endSelectionDrag,
  openArmyPopover,
  closeArmyPopover,
  updateArmyName,
  confirmArmy,
} = slice.actions;

export default slice.reducer;
