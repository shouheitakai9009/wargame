/**
 * 地形カラーのCSS変数名
 *
 * これらの色はApp.cssでCSS変数として定義されており、
 * ライトモードとダークモードで自動的に切り替わります。
 *
 * 使用例:
 * ```tsx
 * <div style={{ backgroundColor: TERRAIN_COLORS.GRASS }} />
 * ```
 */
export const TERRAIN_COLORS = {
  GRASS: "var(--color-terrain-grass)",
  WATER: "var(--color-terrain-water)",
  MOUNTAIN_1: "var(--color-terrain-mountain-1)",
  MOUNTAIN_2: "var(--color-terrain-mountain-2)",
  MOUNTAIN_3: "var(--color-terrain-mountain-3)",
  FOREST: "var(--color-terrain-forest)",
} as const;
