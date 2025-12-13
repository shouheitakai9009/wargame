import { useMemo, type CSSProperties } from "react";
import { ARMY_FORMATION_MODE } from "@/states/battle";

type UseTileStylesParams = {
  backgroundColor: string;
  isMovableTile: boolean;
  isSelected: boolean;
  isPlacementZone: boolean;
  isDropTarget: boolean;
  isDraggingTroop: boolean;
  armyFormationMode: string;
  isVisible: boolean; // 視界内かどうか
};

export function useTileStyles({
  backgroundColor,
  isMovableTile,
  isSelected,
  isPlacementZone,
  isDropTarget,
  isDraggingTroop,
  armyFormationMode,
  isVisible,
}: UseTileStylesParams): CSSProperties {
  return useMemo(() => {
    // フィルター計算
    let filter: string | undefined;
    if (!isVisible) {
      // 視界外の場合は暗くする
      filter = "brightness(0.5)";
    } else if (isMovableTile) {
      filter = "brightness(1.4)";
    } else if (isPlacementZone && isDropTarget) {
      filter = "brightness(1.5)";
    } else if (isPlacementZone && isDraggingTroop) {
      filter = "brightness(1.2)";
    }

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
      filter,
      border,
      boxShadow,
      cursor,
      userSelect,
      opacity: isVisible ? 1 : 0.8, // 視界外の場合は少し半透明
    };
  }, [
    backgroundColor,
    isMovableTile,
    isSelected,
    isPlacementZone,
    isDropTarget,
    isDraggingTroop,
    armyFormationMode,
    isVisible,
  ]);
}
