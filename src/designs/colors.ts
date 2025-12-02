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
  GRASS: "hsl(var(--terrain-grass))",
  WATER: "hsl(var(--terrain-water))",
  MOUNTAIN_1: "hsl(var(--terrain-mountain-1))",
  MOUNTAIN_2: "hsl(var(--terrain-mountain-2))",
  MOUNTAIN_3: "hsl(var(--terrain-mountain-3))",
  FOREST: "hsl(var(--terrain-forest))",
} as const;
