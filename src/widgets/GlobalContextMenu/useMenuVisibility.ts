import { useEffect, useState } from "react";
import type { AppDispatch } from "@/states";
import { closeContextMenu } from "@/states/slice";

type UseMenuVisibilityParams = {
  isOpen: boolean;
  dispatch: AppDispatch;
};

export function useMenuVisibility({
  isOpen,
  dispatch,
}: UseMenuVisibilityParams) {
  const [directionSubMenuOpen, setDirectionSubMenuOpen] = useState(false);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(closeContextMenu());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  // スクロール時にメニューを閉じる
  useEffect(() => {
    const handleScroll = () => {
      dispatch(closeContextMenu());
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [dispatch]);

  // コンテキストメニューが開いたときにサブメニューの状態をリセット
  useEffect(() => {
    if (isOpen) {
      setDirectionSubMenuOpen(false);
    }
  }, [isOpen]);

  return { directionSubMenuOpen, setDirectionSubMenuOpen };
}
