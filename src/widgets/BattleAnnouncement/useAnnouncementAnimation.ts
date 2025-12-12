import { useEffect, useState } from "react";
import { useAppDispatch } from "@/states";
import { clearBattleAnnouncement } from "@/states/modules/ui";

/**
 * アナウンスメント表示時間（ミリ秒）
 */
const ANNOUNCEMENT_DISPLAY_DURATION = 2000;

/**
 * フェードアウトアニメーション時間（ミリ秒）
 */
const ANNOUNCEMENT_FADE_OUT_DURATION = 1500;

/**
 * アナウンスメント全体の表示時間（ミリ秒）
 */
const ANNOUNCEMENT_TOTAL_DURATION =
  ANNOUNCEMENT_DISPLAY_DURATION + ANNOUNCEMENT_FADE_OUT_DURATION;

/**
 * バトルアナウンスメントのアニメーション管理フック
 */
export function useAnnouncementAnimation(
  announcement: { text: string; subText?: string } | null
) {
  const dispatch = useAppDispatch();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!announcement) {
      return;
    }

    // 一定時間表示してからフェードアウト開始
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, ANNOUNCEMENT_DISPLAY_DURATION);

    // フェードアウト完了後にアナウンスメントをクリア
    const hideTimer = setTimeout(() => {
      dispatch(clearBattleAnnouncement());
      setIsFadingOut(false);
    }, ANNOUNCEMENT_TOTAL_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
      // クリーンアップ時にフェードアウト状態をリセット
      setIsFadingOut(false);
    };
  }, [announcement, dispatch]);

  return { isFadingOut };
}
