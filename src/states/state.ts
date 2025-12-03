import type { PlacedTroop } from "@/lib/placement";
import { BATTLE_PHASE, PREPARATION_TAB, RIGHT_SIDEBAR_TAB } from "./battle";
import type { BattlePhase, PreparationTab, RightSidebarTab } from "./battle";

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
};
