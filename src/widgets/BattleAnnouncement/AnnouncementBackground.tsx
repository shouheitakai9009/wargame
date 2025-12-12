import { memo } from "react";

/**
 * リキッドグラス背景
 */
export const AnnouncementBackground = memo(function AnnouncementBackground() {
  return (
    <div className="absolute inset-0">
      {/* グラデーション背景とブラー */}
      <div className="absolute inset-0 backdrop-blur-[20px] bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15">
        {/* 装飾レイヤー */}
        <div className="absolute inset-0 blur-[60px]">
          <div className="absolute top-[40%] left-[30%] w-1/2 h-1/2 bg-blue-500/25 rounded-full" />
          <div className="absolute top-[60%] left-[70%] w-1/2 h-1/2 bg-pink-500/25 rounded-full" />
        </div>
      </div>
    </div>
  );
});
