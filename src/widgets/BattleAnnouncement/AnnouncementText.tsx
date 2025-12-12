import { memo } from "react";

type Props = {
  text: string;
  subText?: string;
};

/**
 * アナウンスメントテキスト表示
 */
export const AnnouncementText = memo(function AnnouncementText({
  text,
  subText,
}: Props) {
  return (
    <div className="relative z-10">
      <h1
        className="text-8xl font-bold text-white text-center tracking-widest drop-shadow-[0_0_40px_rgba(59,130,246,0.8)] drop-shadow-[0_0_80px_rgba(147,51,234,0.6)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        {text}
      </h1>
      {subText && (
        <p className="text-2xl text-white text-center mt-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
          {subText}
        </p>
      )}
    </div>
  );
});
