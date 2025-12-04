import { useAppSelector, useAppDispatch } from "@/states";
import { openArmyPopover } from "@/states/slice";
import { TILE_SIZE } from "@/states/map";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { ARMY_DIRECTION, ARMY_COLORS } from "@/states/army";

/**
 * 軍の範囲をボーダーで囲み、軍名を表示するオーバーレイ
 */
export function ArmyOverlay() {
  const dispatch = useAppDispatch();
  const armies = useAppSelector((state) => state.app.armies);
  const placedTroops = useAppSelector((state) => state.app.placedTroops);

  if (armies.length === 0) return null;

  // 全ての兵の位置をSetに変換（衝突チェック用）
  const allTroopsSet = new Set(
    placedTroops.map((troop) => `${troop.x},${troop.y}`)
  );

  // 向きに応じたアイコンを取得
  const getDirectionIcon = (direction: string): LucideIcon => {
    switch (direction) {
      case ARMY_DIRECTION.UP:
        return ArrowUp;
      case ARMY_DIRECTION.DOWN:
        return ArrowDown;
      case ARMY_DIRECTION.LEFT:
        return ArrowLeft;
      case ARMY_DIRECTION.RIGHT:
        return ArrowRight;
      default:
        return ArrowUp;
    }
  };

  return (
    <>
      {armies.map((army) => {
        // 軍の座標をSetに変換（高速検索用）
        const armyPositionsSet = new Set(
          army.positions.map((pos) => `${pos.x},${pos.y}`)
        );

        // 実際に兵が配置されているマスのみをフィルタリング
        const troopsInArmy = placedTroops.filter((troop) =>
          armyPositionsSet.has(`${troop.x},${troop.y}`)
        );

        // 兵がいるマスの座標をSetに変換
        const troopPositionsSet = new Set(
          troopsInArmy.map((troop) => `${troop.x},${troop.y}`)
        );

        // 各positionに兵がいるかチェックするヘルパー
        const hasTroopAt = (x: number, y: number): boolean => {
          return troopPositionsSet.has(`${x},${y}`);
        };

        // 軍の範囲の最小・最大座標を計算
        const minX = Math.min(...troopsInArmy.map((t) => t.x));
        const maxX = Math.max(...troopsInArmy.map((t) => t.x));
        const minY = Math.min(...troopsInArmy.map((t) => t.y));
        const maxY = Math.max(...troopsInArmy.map((t) => t.y));

        // 中央のX座標
        const centerX = minX + (maxX - minX) / 2;

        // 最適なラベル位置を探す
        const findBestLabelPosition = (): {
          x: number;
          y: number;
        } => {
          // 各方向で、2マス先のエリアに他の兵がいるかチェック
          const checkDirection = (
            startX: number,
            startY: number,
            width: number,
            height: number
          ): number => {
            let count = 0;
            for (let x = startX; x < startX + width; x++) {
              for (let y = startY; y < startY + height; y++) {
                if (allTroopsSet.has(`${x},${y}`)) {
                  count++;
                }
              }
            }
            return count;
          };

          // 下方向のチェック（優先度最高）
          const bottomConflict = checkDirection(
            Math.floor(minX),
            maxY + 1,
            Math.ceil(maxX - minX + 1),
            2
          );

          // 上方向のチェック
          const topConflict = checkDirection(
            Math.floor(minX),
            minY - 2,
            Math.ceil(maxX - minX + 1),
            2
          );

          // 右方向のチェック
          const rightConflict = checkDirection(
            maxX + 1,
            Math.floor(minY),
            2,
            Math.ceil(maxY - minY + 1)
          );

          // 左方向のチェック
          const leftConflict = checkDirection(
            minX - 2,
            Math.floor(minY),
            2,
            Math.ceil(maxY - minY + 1)
          );

          // 最も衝突が少ない方向を選択（優先順位：下、上、右、左）
          const conflicts = [
            { dir: "bottom", count: bottomConflict },
            { dir: "top", count: topConflict },
            { dir: "right", count: rightConflict },
            { dir: "left", count: leftConflict },
          ];

          const best = conflicts.reduce((prev, curr) =>
            curr.count < prev.count ? curr : prev
          );

          // 選択された方向に応じて位置を返す
          switch (best.dir) {
            case "bottom":
              return {
                x: centerX * TILE_SIZE,
                y: (maxY + 1) * TILE_SIZE + 8,
              };
            case "top":
              return {
                x: centerX * TILE_SIZE,
                y: minY * TILE_SIZE - 32,
              };
            case "right":
              return {
                x: (maxX + 1) * TILE_SIZE + 8,
                y: (minY + (maxY - minY) / 2) * TILE_SIZE,
              };
            case "left":
              return {
                x: minX * TILE_SIZE - 8,
                y: (minY + (maxY - minY) / 2) * TILE_SIZE,
              };
            default:
              return {
                x: centerX * TILE_SIZE,
                y: (maxY + 1) * TILE_SIZE + 8,
              };
          }
        };

        const labelPosition = findBestLabelPosition();

        const DirectionIcon = getDirectionIcon(army.direction);

        // 軍ポップオーバーを開く
        const handleClick = () => {
          dispatch(
            openArmyPopover({
              positions: army.positions,
              armyId: army.id,
            })
          );
        };

        return (
          <div key={army.id}>
            {/* 兵が配置されているタイルごとにボーダーを描画 */}
            {troopsInArmy.map((troop) => {
              const { x, y } = troop;

              // 上下左右の隣接マスに兵がいるかチェック
              const hasTop = hasTroopAt(x, y - 1);
              const hasBottom = hasTroopAt(x, y + 1);
              const hasLeft = hasTroopAt(x - 1, y);
              const hasRight = hasTroopAt(x + 1, y);

              // 軍の色を取得
              const armyColor = ARMY_COLORS[army.color];

              // ボーダーのスタイル（各方向で隣接マスに兵がいない場合のみボーダーを描画）
              const borderStyle = {
                position: "absolute" as const,
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                borderTop: !hasTop ? `3px solid ${armyColor.border}` : "none",
                borderBottom: !hasBottom
                  ? `3px solid ${armyColor.border}`
                  : "none",
                borderLeft: !hasLeft ? `3px solid ${armyColor.border}` : "none",
                borderRight: !hasRight
                  ? `3px solid ${armyColor.border}`
                  : "none",
                pointerEvents: "none" as const,
                boxShadow: `0 0 12px ${armyColor.shadow}`,
              };

              return <div key={`${x},${y}`} style={borderStyle} />;
            })}

            {/* 軍名ラベル - クリック可能 */}
            <div
              onClick={handleClick}
              className="group cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                position: "absolute" as const,
                left: labelPosition.x,
                top: labelPosition.y,
                transform: "translateX(-50%)", // 中央揃え
                padding: "4px 10px",
                backgroundColor: ARMY_COLORS[army.color].background,
                color: "white",
                fontSize: "13px",
                fontWeight: "bold" as const,
                borderRadius: "6px",
                pointerEvents: "auto" as const,
                boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px ${
                  ARMY_COLORS[army.color].shadow
                }`,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* 向きの矢印アイコン */}
              <DirectionIcon
                size={16}
                className="transition-transform duration-200 group-hover:scale-110"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
                }}
              />
              {/* 軍名 */}
              <span>{army.name}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
