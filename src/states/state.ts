import type { PlacedTroop } from "@/lib/placement";
import {
  BATTLE_PHASE,
  PREPARATION_TAB,
  RIGHT_SIDEBAR_TAB,
  ARMY_FORMATION_MODE,
} from "./battle";
import type {
  BattlePhase,
  PreparationTab,
  RightSidebarTab,
  ArmyFormationMode,
} from "./battle";
import type { Army } from "./army";

/**
 * アプリケーション全体の状態
 */
export type AppState = {
  // バトル関連の状態
  phase: BattlePhase;
  turn: number;
  preparationTab: PreparationTab;
  rightSidebarTab: RightSidebarTab;

  // 配置された兵
  placedTroops: PlacedTroop[];
  isDraggingTroop: boolean;

  // エラーメッセージ
  errorMessage: string | null;

  // 軍編成モード
  armyFormationMode: ArmyFormationMode;

  // 矩形選択のドラッグ情報
  selectionDragStart: { x: number; y: number } | null;
  selectionDragCurrent: { x: number; y: number } | null;

  // 軍
  armies: Army[];

  // 軍ポップオーバー
  isArmyPopoverOpen: boolean;
  editingArmy: {
    name: string;
    morale: number;
    direction: string;
    positions: Array<{ x: number; y: number }>;
  } | null;

  // 今後、他の状態もここに追加していく
  // 例: soldiers, armies, map など
};

export const initialState: AppState = {
  phase: BATTLE_PHASE.PREPARATION,
  turn: 0,
  preparationTab: PREPARATION_TAB.DEPLOY_SOLDIER,
  rightSidebarTab: RIGHT_SIDEBAR_TAB.BATTLE_LOG,
  placedTroops: [],
  isDraggingTroop: false,
  errorMessage: null,
  armyFormationMode: ARMY_FORMATION_MODE.NONE,
  selectionDragStart: null,
  selectionDragCurrent: null,
  armies: [],
  isArmyPopoverOpen: false,
  editingArmy: null,
};
