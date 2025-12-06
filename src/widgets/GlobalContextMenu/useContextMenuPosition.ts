import { useMemo } from "react";

type Position = { x: number; y: number };

const MENU_PADDING = 8;
const MENU_WIDTH = 192; // min-w-32 = 8rem = 128px, but we use 192 for safety
const MENU_HEIGHT = 400; // おおよその高さ（項目数から推定）

export function useContextMenuPosition(position: Position): Position {
  return useMemo(() => {
    let adjustedX = position.x;
    let adjustedY = position.y;

    // 右端はみ出しチェック
    if (adjustedX + MENU_WIDTH > window.innerWidth) {
      adjustedX = window.innerWidth - MENU_WIDTH - MENU_PADDING;
    }

    // 下端はみ出しチェック
    if (adjustedY + MENU_HEIGHT > window.innerHeight) {
      adjustedY = window.innerHeight - MENU_HEIGHT - MENU_PADDING;
    }

    // 左端・上端チェック（最低限の余白を確保）
    adjustedX = Math.max(MENU_PADDING, adjustedX);
    adjustedY = Math.max(MENU_PADDING, adjustedY);

    return { x: adjustedX, y: adjustedY };
  }, [position.x, position.y]);
}
