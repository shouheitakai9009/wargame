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
