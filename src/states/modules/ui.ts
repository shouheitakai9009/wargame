import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  PREPARATION_TAB,
  RIGHT_SIDEBAR_TAB,
  type PreparationTab,
  type RightSidebarTab,
} from "../battle";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "../map";
import { type ArmyColorKey, ARMY_DIRECTION } from "../army";
import { startBattle } from "./battle";
import { confirmArmy } from "./army";

export type ContextMenuState = {
  isOpen: boolean;
  position: { x: number; y: number }; // 画面上のクリック座標
  tile: { x: number; y: number }; // マップ上のタイル座標
} | null;

export type HoveredTroopState = {
  troopId: string;
  tileX: number;
  tileY: number;
  clientRect: { top: number; left: number; width: number; height: number }; // 要素の位置情報
} | null;

export type UiState = {
  preparationTab: PreparationTab;
  rightSidebarTab: RightSidebarTab;
  mapZoomRatio: number;
  errorMessage: string | null;
  isArmyPopoverOpen: boolean;
  editingArmy: {
    id?: string;
    name: string;
    morale: number;
    direction: string;
    positions: Array<{ x: number; y: number }>;
    color?: ArmyColorKey;
  } | null;
  isRightSidebarOpen: boolean;
  isLeftSidebarOpen: boolean;
  battleAnnouncement: {
    text: string;
    subText?: string;
  } | null;
  contextMenu: ContextMenuState;
  isVisibilityModeEnabled: boolean;
  hoveredTroop: HoveredTroopState;
};

export const initialUiState: UiState = {
  preparationTab: PREPARATION_TAB.DEPLOY_SOLDIER,
  rightSidebarTab: RIGHT_SIDEBAR_TAB.BATTLE_LOG,
  mapZoomRatio: 1,
  errorMessage: null,
  isArmyPopoverOpen: false,
  editingArmy: null,
  isRightSidebarOpen: true,
  isLeftSidebarOpen: true,
  battleAnnouncement: null,
  contextMenu: null,
  isVisibilityModeEnabled: false,
  hoveredTroop: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    zoomOutMap: (state) => {
      if (state.mapZoomRatio <= MIN_ZOOM) return;
      state.mapZoomRatio -= ZOOM_STEP;
    },
    zoomInMap: (state) => {
      if (state.mapZoomRatio >= MAX_ZOOM) return;
      state.mapZoomRatio += ZOOM_STEP;
    },
    switchPreparationTab: (state, action: PayloadAction<PreparationTab>) => {
      state.preparationTab = action.payload;
    },
    switchRightSidebarTab: (state, action: PayloadAction<RightSidebarTab>) => {
      state.rightSidebarTab = action.payload;
    },
    showError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    hideError: (state) => {
      state.errorMessage = null;
    },
    openArmyPopover: (
      state,
      action: PayloadAction<{
        positions: Array<{ x: number; y: number }>;
        armyId?: string;
        // 既存の軍の情報を受け取る（state.armiesへの依存を避けるためUI側で解決して渡すか、あるいはここで解決するか要検討だが、
        // いったんUIに必要な編集用データはPayloadで全部渡すのが綺麗。しかし既存ロジックはIDだけ渡していた）
        // ここではIDだけ渡して、armySliceのデータは直接参照できないので、
        // Container Component側で必要なデータを揃えて渡す形にする変更が必要かもしれない。
        // *ただし* Phase 1では既存ロジックを極力維持したい。
        // しかし slice分割すると state.armies にアクセスできない。
        // よって、Payloadに `existingArmy` を含める形に変更するのがベスト。
        existingArmy?: {
          id: string;
          name: string;
          morale: number;
          direction: string;
          positions: Array<{ x: number; y: number }>;
          color: ArmyColorKey;
        };
      }>
    ) => {
      state.isArmyPopoverOpen = true;

      // 既存の軍を編集する場合
      if (action.payload.existingArmy) {
        state.editingArmy = {
          ...action.payload.existingArmy,
        };
        return;
      }

      // 新規の軍を作成する場合
      state.editingArmy = {
        name: "",
        morale: 1,
        direction: ARMY_DIRECTION.UP,
        positions: action.payload.positions,
      };
    },
    closeArmyPopover: (state) => {
      state.isArmyPopoverOpen = false;
      state.editingArmy = null;
    },
    updateArmyName: (state, action: PayloadAction<string>) => {
      if (state.editingArmy) {
        state.editingArmy.name = action.payload;
      }
    },
    toggleRightSidebar: (state) => {
      state.isRightSidebarOpen = !state.isRightSidebarOpen;
    },
    toggleLeftSidebar: (state) => {
      state.isLeftSidebarOpen = !state.isLeftSidebarOpen;
    },
    clearBattleAnnouncement: (state) => {
      state.battleAnnouncement = null;
    },
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
    closeContextMenu: (state) => {
      state.contextMenu = null;
    },
    toggleVisibilityMode: (state) => {
      state.isVisibilityModeEnabled = !state.isVisibilityModeEnabled;
    },
    setHoveredTroop: (state, action: PayloadAction<HoveredTroopState>) => {
      // 頻繁な更新を防ぐため、IDが変わった場合のみ更新（本来はReact側で制御すべきだが念のため）
      // ただし、座標が変わる可能性もあるので、ここでは単純に上書きする
      state.hoveredTroop = action.payload;
    },
    // ConfirmArmyはArmySlice側で処理するが、UIも閉じる必要がある
  },
  extraReducers: (builder) => {
    builder
      .addCase(startBattle, (state) => {
        state.preparationTab = PREPARATION_TAB.FORM_ARMY;
        state.battleAnnouncement = {
          text: "バトル開始",
        };
      })
      .addCase(confirmArmy, (state) => {
        state.isArmyPopoverOpen = false;
        state.editingArmy = null;
      });
  },
});

export const {
  zoomOutMap,
  zoomInMap,
  switchPreparationTab,
  switchRightSidebarTab,
  showError,
  hideError,
  openArmyPopover,
  closeArmyPopover,
  updateArmyName,
  toggleRightSidebar,
  toggleLeftSidebar,
  clearBattleAnnouncement,
  openContextMenu,
  closeContextMenu,
  toggleVisibilityMode,
  setHoveredTroop,
} = uiSlice.actions;

export default uiSlice.reducer;
