import { useMemo, type CSSProperties } from "react";
import { ARMY_FORMATION_MODE } from "@/states/battle";

type UseTileStylesParams = {
  backgroundColor: string;
  isMovableTile: boolean;
  isSelected: boolean;
  isPlacementZone: boolean;
  isDropTarget: boolean;
  armyFormationMode: string;
  isVisible: boolean; // 視界内かどうか
};

export function useTileStyles({
  backgroundColor,
  isMovableTile,
  isSelected,
  isPlacementZone,
  isDropTarget,
  armyFormationMode,
  isVisible,
}: UseTileStylesParams): CSSProperties {
  return useMemo(() => {
    // フィルター計算（GPU負荷軽減のためfilterプロパティは使用しない）
    // 視界外の暗さはOpacityと背景色で表現

    // ボーダー計算
    let border: string;
    if (isMovableTile) {
      border = "2px solid rgba(59, 130, 246, 0.8)";
    } else if (isSelected) {
      border = "2px dashed rgba(147, 51, 234, 0.8)";
    } else if (isPlacementZone && isDropTarget) {
      border = "2px solid rgba(34, 197, 94, 0.8)";
    } else {
      border = "1px solid rgba(100, 116, 139, 0.2)";
    }

    // ボックスシャドウ計算
    let boxShadow: string | undefined;
    if (isMovableTile) {
      boxShadow =
        "0 0 12px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.3)";
    } else if (isSelected) {
      boxShadow =
        "0 0 12px rgba(147, 51, 234, 0.6), inset 0 0 20px rgba(147, 51, 234, 0.3)";
    } else if (isPlacementZone && isDropTarget) {
      boxShadow =
        "0 0 12px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.3)";
    }

    // カーソル計算
    let cursor: string | undefined;
    if (isMovableTile) {
      cursor = "pointer";
    } else if (
      armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
      armyFormationMode === ARMY_FORMATION_MODE.SPLIT
    ) {
      cursor = "crosshair";
    }

    // ユーザーセレクト計算
    let userSelect: CSSProperties["userSelect"];
    if (
      armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
      armyFormationMode === ARMY_FORMATION_MODE.SPLIT
    ) {
      userSelect = "none";
    }

    return {
      backgroundColor,
      // filterプロパティは削除
      border,
      boxShadow,
      cursor,
      userSelect,
      opacity: isVisible ? 1 : 0.4, // 視界外の場合は色を薄くする（背景色が透けて暗く見えることを期待）
    };
  }, [
    backgroundColor,
    isMovableTile,
    isSelected,
    isPlacementZone,
    isDropTarget,
    armyFormationMode,
    isVisible,
  ]);
}
