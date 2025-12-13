import { useEffect, useState } from "react";
import type { AppDispatch } from "@/states";
import { closeContextMenu } from "@/states/modules/ui";

type UseMenuVisibilityParams = {
  dispatch: AppDispatch;
};

export function useMenuVisibility({ dispatch }: UseMenuVisibilityParams) {
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

  return { directionSubMenuOpen, setDirectionSubMenuOpen };
}
