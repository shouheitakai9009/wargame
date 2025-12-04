import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/states";
import { clearMapEffect } from "@/states/slice";
import { MAP_EFFECT } from "@/states/battle";
import type { MapEffect } from "@/states/battle";

/**
 * マップエフェクトオーバーレイコンポーネント
 * Redux stateのmapEffectを監視し、エフェクトに応じた発光演出を表示
 */
export const MapEffectOverlay = () => {
  const dispatch = useAppDispatch();
  const mapEffect = useAppSelector((state) => state.app.mapEffect);

  // エフェクト発火時に一定時間後に自動クリア
  useEffect(() => {
    if (!mapEffect) return;

    const duration = getDuration(mapEffect.type);
    const timer = setTimeout(() => {
      dispatch(clearMapEffect());
    }, duration);

    return () => clearTimeout(timer);
  }, [mapEffect, dispatch]);

  // エフェクトがない場合は何も表示しない
  if (!mapEffect) return null;

  const effectStyle = getEffectStyle(mapEffect);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-40"
      style={effectStyle}
    />
  );
};

/**
 * エフェクトタイプに応じたスタイルを取得
 */
const getEffectStyle = (effect: MapEffect): React.CSSProperties => {
  switch (effect.type) {
    case MAP_EFFECT.DIRECTION_CHANGE:
      return {
        boxShadow: getDirectionalShadow(
          effect.direction,
          "255, 255, 255", // 白
          "0.6"
        ),
        animation: "direction-change-glow 1.5s ease-out forwards",
      };

    case MAP_EFFECT.UNDER_ATTACK:
      return {
        boxShadow: getDirectionalShadow(
          effect.direction,
          "239, 68, 68", // red-500
          "0.8"
        ),
        animation: "under-attack-pulse 0.4s ease-in-out 4",
      };

    default:
      return {};
  }
};

/**
 * 方向に応じたinset shadowを取得
 */
const getDirectionalShadow = (
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | undefined,
  rgbColor: string,
  opacity: string
): string => {
  if (!direction) return "";

  switch (direction) {
    case "UP":
      return `inset 0 100px 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "DOWN":
      return `inset 0 -100px 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "LEFT":
      return `inset 100px 0 80px -40px rgba(${rgbColor}, ${opacity})`;
    case "RIGHT":
      return `inset -100px 0 80px -40px rgba(${rgbColor}, ${opacity})`;
  }
};

/**
 * エフェクトタイプに応じた持続時間（ミリ秒）を取得
 */
const getDuration = (type: string): number => {
  switch (type) {
    case MAP_EFFECT.DIRECTION_CHANGE:
      return 1500; // じわっと滲み出る演出なので長め
    case MAP_EFFECT.UNDER_ATTACK:
      return 1600; // 0.4s × 4回 = 1.6s
    default:
      return 1000;
  }
};
