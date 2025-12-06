import type { PlacedTroop } from "@/lib/placement";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BATTLE_PHASE,
  PREPARATION_TAB,
  type PreparationTab,
  type RightSidebarTab,
  type ArmyFormationMode,
  type BattleMoveMode,
  type MapEffectType,
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
} from "./battle";
import { initialState } from "./state";
import {
  ARMY_DIRECTION,
  ARMY_COLORS,
  type Army,
  type ArmyDirection,
} from "./army";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "./map";
import { calculateArmySpeed, calculateMovableTiles } from "@/lib/armyMovement";

export const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // ユーザーがバトルを開始する
    startBattle: (state) => {
      state.phase = BATTLE_PHASE.BATTLE;
      state.turn = 1;
      // バトル開始時は軍編成タブに切り替え
      state.preparationTab = PREPARATION_TAB.FORM_ARMY;
      // バトル開始アナウンスを表示
      state.battleAnnouncement = {
        text: "バトル開始",
      };
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

    zoomOutMap: (state) => {
      if (state.mapZoomRatio <= MIN_ZOOM) return;
      state.mapZoomRatio -= ZOOM_STEP;
    },
    zoomInMap: (state) => {
      if (state.mapZoomRatio >= MAX_ZOOM) return;
      state.mapZoomRatio += ZOOM_STEP;
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
      action: PayloadAction<{
        mode: ArmyFormationMode;
        armyId?: string; // 分割モードの場合、対象の軍ID
      }>
    ) => {
      state.armyFormationMode = action.payload.mode;

      // 分割モードの場合、対象の軍IDを設定
      if (
        action.payload.mode === ARMY_FORMATION_MODE.SPLIT &&
        action.payload.armyId
      ) {
        state.splittingArmyId = action.payload.armyId;
      } else {
        state.splittingArmyId = null;
      }

      // モード切り替え時は選択状態をリセット
      state.selectionDragStart = null;
      state.selectionDragCurrent = null;

      // 移動モードもリセット
      state.battleMoveMode = BATTLE_MOVE_MODE.NONE;
      state.movingArmyId = null;
      state.movableTiles = null;
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
      action: PayloadAction<{
        positions: Array<{ x: number; y: number }>;
        armyId?: string; // 既存の軍のID（編集の場合）
      }>
    ) => {
      state.isArmyPopoverOpen = true;

      // 既存の軍を編集する場合
      if (action.payload.armyId) {
        const existingArmy = state.armies.find(
          (a) => a.id === action.payload.armyId
        );
        if (existingArmy) {
          state.editingArmy = {
            id: existingArmy.id,
            name: existingArmy.name,
            morale: existingArmy.morale,
            direction: existingArmy.direction,
            positions: existingArmy.positions,
            color: existingArmy.color,
          };
          return;
        }
      }

      // 新規の軍を作成する場合
      state.editingArmy = {
        name: "",
        morale: 1,
        direction: ARMY_DIRECTION.UP,
        positions: action.payload.positions,
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
      const editingArmy = state.editingArmy;
      if (editingArmy) {
        // 既存の軍の更新かどうかを判定
        if (editingArmy.id) {
          const existingArmyIndex = state.armies.findIndex(
            (a) => a.id === editingArmy.id
          );
          if (existingArmyIndex !== -1) {
            // 更新
            state.armies[existingArmyIndex] = {
              ...state.armies[existingArmyIndex],
              name: editingArmy.name,
              morale: editingArmy.morale,
              direction: editingArmy.direction as ArmyDirection,
              // colorは変更しない
            };

            state.isArmyPopoverOpen = false;
            state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
            state.editingArmy = null;
            return;
          }
        }

        // 新規作成
        // 既に使用されている色を取得
        const usedColors = new Set(state.armies.map((army) => army.color));

        // カラーマスターから未使用の色を探す
        const availableColors = (
          Object.keys(ARMY_COLORS) as Array<keyof typeof ARMY_COLORS>
        ).filter((colorKey) => !usedColors.has(colorKey));

        // 未使用の色がある場合はその最初の色、なければ最初の色を使用（ループ）
        const assignedColor =
          availableColors.length > 0
            ? availableColors[0]
            : (Object.keys(ARMY_COLORS)[0] as keyof typeof ARMY_COLORS);

        const newArmy: Army = {
          id: `army-${Date.now()}`,
          name: editingArmy.name,
          morale: editingArmy.morale,
          direction: editingArmy.direction as ArmyDirection,
          positions: editingArmy.positions,
          color: assignedColor,
        };
        state.armies.push(newArmy);
        state.isArmyPopoverOpen = false;
        state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
        state.editingArmy = null;
      }
    },

    // ユーザーが軍を分割する
    splitArmy: (
      state,
      action: PayloadAction<{
        originalArmyId: string;
        newArmyPositions: Array<{ x: number; y: number }>;
      }>
    ) => {
      const { originalArmyId, newArmyPositions } = action.payload;

      // 新しい軍の座標をSetに変換（検索用）
      const newArmySet = new Set(
        newArmyPositions.map((pos) => `${pos.x},${pos.y}`)
      );

      // armies配列をmapで処理し、対象の軍のpositionsを更新
      state.armies = state.armies.map((army) => {
        if (army.id === originalArmyId) {
          // 元の軍から新しい軍の座標を除外
          return {
            ...army,
            positions: army.positions.filter(
              (pos) => !newArmySet.has(`${pos.x},${pos.y}`)
            ),
          };
        }
        return army;
      });

      // 分割モードをリセット
      state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
      state.splittingArmyId = null;
    },

    // ユーザーが軍を削除する
    deleteArmy: (state, action: PayloadAction<string>) => {
      state.armies = state.armies.filter((army) => army.id !== action.payload);
    },

    // ユーザーが軍の向きを変更する
    changeArmyDirection: (
      state,
      action: PayloadAction<{ armyId: string; direction: ArmyDirection }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.direction = action.payload.direction;
      }
    },

    // ユーザーが移動モードを切り替える
    switchBattleMoveMode: (
      state,
      action: PayloadAction<{
        mode: BattleMoveMode;
        armyId?: string; // 移動モードの場合、対象の軍ID
      }>
    ) => {
      state.battleMoveMode = action.payload.mode;

      // 移動モードの場合、対象の軍IDを設定し、移動可能マスを計算
      if (
        action.payload.mode === BATTLE_MOVE_MODE.MOVE &&
        action.payload.armyId
      ) {
        state.movingArmyId = action.payload.armyId;

        const army = state.armies.find((a) => a.id === action.payload.armyId);
        if (army) {
          const armySpeed = calculateArmySpeed(army, state.placedTroops);
          const movableTiles = calculateMovableTiles(
            army,
            armySpeed,
            state.placedTroops,
            state.armies
          );
          state.movableTiles = movableTiles;
        }
      } else {
        state.movingArmyId = null;
        state.movableTiles = null;
      }
    },

    // ユーザーが軍を移動する
    moveArmyToTile: (
      state,
      action: PayloadAction<{
        armyId: string;
        targetX: number;
        targetY: number;
      }>
    ) => {
      const { armyId, targetX, targetY } = action.payload;

      const armyIndex = state.armies.findIndex((a) => a.id === armyId);
      if (armyIndex === -1) return;

      const army = state.armies[armyIndex];

      // 軍内に実際に兵がいる座標を取得
      const troopsInArmy = state.placedTroops.filter((troop) =>
        army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
      );

      if (troopsInArmy.length === 0) return;

      // 軍の4方向の前線を計算
      const frontlines = {
        up: Math.min(...troopsInArmy.map((t) => t.y)),
        down: Math.max(...troopsInArmy.map((t) => t.y)),
        left: Math.min(...troopsInArmy.map((t) => t.x)),
        right: Math.max(...troopsInArmy.map((t) => t.x)),
      };

      // クリックした位置から移動方向と距離を判定
      let moveDirection: "up" | "down" | "left" | "right";
      let offsetX = 0;
      let offsetY = 0;

      if (targetY < frontlines.up) {
        // 上方向
        moveDirection = "up";
        offsetY = targetY - frontlines.up;
      } else if (targetY > frontlines.down) {
        // 下方向
        moveDirection = "down";
        offsetY = targetY - frontlines.down;
      } else if (targetX < frontlines.left) {
        // 左方向
        moveDirection = "left";
        offsetX = targetX - frontlines.left;
      } else if (targetX > frontlines.right) {
        // 右方向
        moveDirection = "right";
        offsetX = targetX - frontlines.right;
      } else {
        // 軍の範囲内をクリックした場合は移動しない
        return;
      }

      // 移動方向に応じて軍の向きを更新
      let newDirection: ArmyDirection;
      switch (moveDirection) {
        case "up":
          newDirection = ARMY_DIRECTION.UP;
          break;
        case "down":
          newDirection = ARMY_DIRECTION.DOWN;
          break;
        case "left":
          newDirection = ARMY_DIRECTION.LEFT;
          break;
        case "right":
          newDirection = ARMY_DIRECTION.RIGHT;
          break;
      }

      // 軍の全positionsをオフセット分移動し、向きも更新
      const newPositions = army.positions.map((pos) => ({
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }));

      // 配列を更新
      state.armies[armyIndex] = {
        ...army,
        positions: newPositions,
        direction: newDirection,
      };

      // placedTroopsも更新（兵の座標を軍の移動に合わせる）
      const armyPositionsSet = new Set(
        army.positions.map((pos) => `${pos.x},${pos.y}`)
      );

      state.placedTroops = state.placedTroops.map((troop) => {
        if (armyPositionsSet.has(`${troop.x},${troop.y}`)) {
          return {
            ...troop,
            x: troop.x + offsetX,
            y: troop.y + offsetY,
          };
        }
        return troop;
      });

      // マップエフェクトを発火（向き変更と同じエフェクト）
      state.mapEffect = {
        type: MAP_EFFECT.DIRECTION_CHANGE,
        direction: newDirection,
        timestamp: Date.now(),
      };

      // 移動モードをリセット
      state.battleMoveMode = BATTLE_MOVE_MODE.NONE;
      state.movingArmyId = null;
      state.movableTiles = null;
    },

    // ユーザーがマップエフェクトを発火する
    triggerMapEffect: (
      state,
      action: PayloadAction<{
        type: MapEffectType;
        direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
      }>
    ) => {
      state.mapEffect = {
        type: action.payload.type,
        direction: action.payload.direction,
        timestamp: Date.now(),
      };
    },

    // マップエフェクトをクリアする
    clearMapEffect: (state) => {
      state.mapEffect = null;
    },

    // 右サイドバーの開閉を切り替える
    toggleRightSidebar: (state) => {
      state.isRightSidebarOpen = !state.isRightSidebarOpen;
    },

    // 左サイドバーの開閉を切り替える
    toggleLeftSidebar: (state) => {
      state.isLeftSidebarOpen = !state.isLeftSidebarOpen;
    },

    // バトルアナウンスをクリアする
    clearBattleAnnouncement: (state) => {
      state.battleAnnouncement = null;
    },

    // ユーザーがコンテキストメニューを開く
    openContextMenu: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        tileX: number;
        tileY: number;
      }>
    ) => {
      state.contextMenu = {
        isOpen: true,
        position: {
          x: action.payload.x,
          y: action.payload.y,
        },
        tile: {
          x: action.payload.tileX,
          y: action.payload.tileY,
        },
      };
    },

    // ユーザーがコンテキストメニューを閉じる
    closeContextMenu: (state) => {
      state.contextMenu = null;
    },

    // ステートを初期状態にリセットする
    resetState: () => {
      return initialState;
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
  splitArmy,
  deleteArmy,
  changeArmyDirection,
  switchBattleMoveMode,
  moveArmyToTile,
  zoomInMap,
  zoomOutMap,
  triggerMapEffect,
  clearMapEffect,
  toggleRightSidebar,
  toggleLeftSidebar,
  clearBattleAnnouncement,
  openContextMenu,
  closeContextMenu,
  resetState,
} = slice.actions;

export default slice.reducer;
