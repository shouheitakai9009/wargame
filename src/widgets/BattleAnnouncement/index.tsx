import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../states";
import { clearBattleAnnouncement } from "../../states/slice";

export function BattleAnnouncement() {
  const dispatch = useAppDispatch();
  const announcement = useAppSelector((state) => state.app.battleAnnouncement);
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (announcement) {
      // 表示開始
      setIsVisible(true);
      setIsFadingOut(false);

      // 2秒表示してからフェードアウト開始
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000);

      // フェードアウト完了後に非表示
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        dispatch(clearBattleAnnouncement());
      }, 3500); // 2秒表示 + 1.5秒フェードアウト

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [announcement, dispatch]);

  if (!isVisible || !announcement) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-1500"
      style={{
        opacity: isFadingOut ? 0 : 1,
      }}
    >
      {/* リキッドグラス背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* 装飾レイヤー */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.25) 0%, transparent 50%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* テキスト */}
      <div className="relative z-10">
        <h1
          className="text-8xl font-bold text-white text-center"
          style={{
            textShadow:
              "0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(147, 51, 234, 0.6), 0 4px 20px rgba(0, 0, 0, 0.5)",
            letterSpacing: "0.1em",
          }}
        >
          {announcement.text}
        </h1>
        {announcement.subText && (
          <p
            className="text-2xl text-white text-center mt-6"
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
            }}
          >
            {announcement.subText}
          </p>
        )}
      </div>
    </div>
  );
}
