import { useAppSelector } from "@/states";
import { TILE_SIZE } from "@/states/map";

/**
 * 軍の範囲をボーダーで囲み、軍名を表示するオーバーレイ
 */
export function ArmyOverlay() {
  const armies = useAppSelector((state) => state.app.armies);

  if (armies.length === 0) return null;

  return (
    <>
      {armies.map((army) => {
        // 軍の範囲の最小・最大座標を計算
        const minX = Math.min(...army.positions.map((p) => p.x));
        const maxX = Math.max(...army.positions.map((p) => p.x));
        const minY = Math.min(...army.positions.map((p) => p.y));
        const maxY = Math.max(...army.positions.map((p) => p.y));

        // 軍名のラベル位置（左上）
        const labelX = minX * TILE_SIZE;
        const labelY = minY * TILE_SIZE;

        // ボーダーのスタイル
        const borderStyle = {
          position: "absolute" as const,
          left: minX * TILE_SIZE,
          top: minY * TILE_SIZE,
          width: (maxX - minX + 1) * TILE_SIZE,
          height: (maxY - minY + 1) * TILE_SIZE,
          border: "3px solid rgba(59, 130, 246, 0.8)", // blue-500
          borderRadius: "8px",
          pointerEvents: "none" as const,
          boxShadow: "0 0 12px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)",
        };

        // 軍名ラベルのスタイル
        const labelStyle = {
          position: "absolute" as const,
          left: labelX + 4,
          top: labelY + 4,
          padding: "2px 8px",
          backgroundColor: "rgba(59, 130, 246, 0.9)",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold" as const,
          borderRadius: "4px",
          pointerEvents: "none" as const,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        };

        return (
          <div key={army.id}>
            {/* ボーダー */}
            <div style={borderStyle} />
            {/* 軍名ラベル */}
            <div style={labelStyle}>{army.name}</div>
          </div>
        );
      })}
    </>
  );
}
