import { memo } from "react";

type Props = {
  children: React.ReactNode;
  isFadingOut: boolean;
};

/**
 * アナウンスメントオーバーレイのz-index値
 * 他のUIコンポーネントより前面に表示するための高い値
 */
const ANNOUNCEMENT_Z_INDEX = 100;

/**
 * アナウンスメントオーバーレイコンテナ
 */
export const AnnouncementOverlay = memo(function AnnouncementOverlay({
  children,
  isFadingOut,
}: Props) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1500"
      style={{
        zIndex: ANNOUNCEMENT_Z_INDEX,
        opacity: isFadingOut ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
});
