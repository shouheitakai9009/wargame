import type { PlacedTroop } from "@/lib/placement";
import {
  BATTLE_PHASE,
  PREPARATION_TAB,
  RIGHT_SIDEBAR_TAB,
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
} from "./battle";
import type {
  BattlePhase,
  PreparationTab,
  RightSidebarTab,
  ArmyFormationMode,
  BattleMoveMode,
  MapEffect,
} from "./battle";
import type { Army, ArmyColorKey } from "./army";
import { initialArmies, initialPlacedTroops } from "../data/initialPlacement";

/**
 * コンテキストメニューの状態
 */
export type ContextMenuState = {
  isOpen: boolean;
  position: { x: number; y: number }; // 画面上のクリック座標
  tile: { x: number; y: number }; // マップ上のタイル座標
} | null;

/**
 * アプリケーション全体の状態
 */
export type AppState = {
  // バトル関連の状態
  phase: BattlePhase;
  turn: number;
  preparationTab: PreparationTab;
  rightSidebarTab: RightSidebarTab;

  // マップのズーム倍率
  mapZoomRatio: number;

  // 配置された兵
  placedTroops: PlacedTroop[];
  isDraggingTroop: boolean;

  // エラーメッセージ
  errorMessage: string | null;

  // 軍編成モード
  armyFormationMode: ArmyFormationMode;

  // バトル中の移動モード
  battleMoveMode: BattleMoveMode;

  // 移動モード用：移動対象の軍ID
  movingArmyId: string | null;

  // 移動モード用：移動可能なマス座標のリスト
  movableTiles: Array<{ x: number; y: number }> | null;

  // 分割モード用：分割対象の軍ID
  splittingArmyId: string | null;

  // 矩形選択のドラッグ情報
  selectionDragStart: { x: number; y: number } | null;
  selectionDragCurrent: { x: number; y: number } | null;

  // 軍
  armies: Army[];

  // 軍ポップオーバー
  isArmyPopoverOpen: boolean;
  editingArmy: {
    id?: string;
    name: string;
    morale: number;
    direction: string;
    positions: Array<{ x: number; y: number }>;
    color?: ArmyColorKey;
  } | null;

  // マップエフェクト
  mapEffect: MapEffect | null;

  // 右サイドバーの開閉状態
  isRightSidebarOpen: boolean;

  // 左サイドバーの開閉状態
  isLeftSidebarOpen: boolean;

  // バトルアナウンス（バトル開始、ターン開始など）
  battleAnnouncement: {
    text: string;
    subText?: string;
  } | null;

  // コンテキストメニュー
  contextMenu: ContextMenuState;

  // 今後、他の状態もここに追加していく
  // 例: soldiers, armies, map など
};

export const initialState: AppState = {
  phase: BATTLE_PHASE.PREPARATION,
  turn: 0,
  mapZoomRatio: 1,
  preparationTab: PREPARATION_TAB.DEPLOY_SOLDIER,
  rightSidebarTab: RIGHT_SIDEBAR_TAB.BATTLE_LOG,
  placedTroops: initialPlacedTroops,
  isDraggingTroop: false,
  errorMessage: null,
  armyFormationMode: ARMY_FORMATION_MODE.NONE,
  battleMoveMode: BATTLE_MOVE_MODE.NONE,
  movingArmyId: null,
  movableTiles: null,
  splittingArmyId: null,
  selectionDragStart: null,
  selectionDragCurrent: null,
  armies: initialArmies,
  isArmyPopoverOpen: false,
  editingArmy: null,
  mapEffect: null,
  isRightSidebarOpen: true,
  isLeftSidebarOpen: true,
  battleAnnouncement: null,
  contextMenu: null,
};
