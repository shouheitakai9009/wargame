/**
 * バトルフェーズの定数と型定義
 */

// バトルフェーズの種類
export const BATTLE_PHASE = {
  PREPARATION: "PREPARATION", // 準備中
  BATTLE: "BATTLE", // バトル中
  RESULT: "RESULT", // 結果
} as const;

export type BattlePhase =
  (typeof BATTLE_PHASE)[keyof typeof BATTLE_PHASE];

// 準備中タブの種類
export const PREPARATION_TAB = {
  DEPLOY_SOLDIER: "DEPLOY_SOLDIER", // 兵配置
  FORM_ARMY: "FORM_ARMY", // 軍編成
} as const;

export type PreparationTab =
  (typeof PREPARATION_TAB)[keyof typeof PREPARATION_TAB];

// 右側サイドバータブの種類
export const RIGHT_SIDEBAR_TAB = {
  BATTLE_LOG: "BATTLE_LOG", // 戦闘ログ
  RULE_EXPLANATION: "RULE_EXPLANATION", // ルール解説
} as const;

export type RightSidebarTab =
  (typeof RIGHT_SIDEBAR_TAB)[keyof typeof RIGHT_SIDEBAR_TAB];

// 軍編成モードの種類
export const ARMY_FORMATION_MODE = {
  NONE: "NONE", // モードなし
  SELECT: "SELECT", // 選択モード
  SPLIT: "SPLIT", // 分割モード
} as const;

export type ArmyFormationMode =
  (typeof ARMY_FORMATION_MODE)[keyof typeof ARMY_FORMATION_MODE];

// バトル中の移動モード
export const BATTLE_MOVE_MODE = {
  NONE: "NONE", // モードなし
  MOVE: "MOVE", // 移動モード
} as const;

export type BattleMoveMode =
  (typeof BATTLE_MOVE_MODE)[keyof typeof BATTLE_MOVE_MODE];

// マップエフェクトの種類
export const MAP_EFFECT = {
  NONE: "NONE", // エフェクトなし
  DIRECTION_CHANGE: "DIRECTION_CHANGE", // 向き変更（じわっと滲み出る黒い発光）
  UNDER_ATTACK: "UNDER_ATTACK", // 攻撃を受ける（早い脈動で赤く発光）
} as const;

export type MapEffectType = (typeof MAP_EFFECT)[keyof typeof MAP_EFFECT];

// マップエフェクトの型定義
export type MapEffect = {
  type: MapEffectType;
  direction?: "UP" | "DOWN" | "LEFT" | "RIGHT"; // どの方向からのエフェクトか
  timestamp: number; // いつ発火したか（自動クリア用）
};
