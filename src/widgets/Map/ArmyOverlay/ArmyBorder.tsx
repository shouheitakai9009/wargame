import { memo, useMemo } from "react";
import { useAppDispatch } from "@/states";
import { openArmyPopover } from "@/states/slice";
import { TILE_SIZE } from "@/states/map";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { ARMY_DIRECTION, ARMY_COLORS, type Army } from "@/states/army";
import type { PlacedTroop } from "@/lib/placement";

type Props = {
  army: Army;
  troopsInArmy: PlacedTroop[];
  allTroopsSet: Set<string>;
};

/**
 * 単一の軍のボーダーとラベルを描画するコンポーネント
 * memo化により、この軍に関係する変更がない限り再レンダリングされない
 */
export const ArmyBorder = memo(function ArmyBorder({
  army,
  troopsInArmy,
  allTroopsSet,
}: Props) {
  const dispatch = useAppDispatch();

  // 兵がいるマスの座標をSetに変換（メモ化）
  const troopPositionsSet = useMemo(
    () => new Set(troopsInArmy.map((troop) => `${troop.x},${troop.y}`)),
    [troopsInArmy]
  );

  // 各positionに兵がいるかチェックするヘルパー
  const hasTroopAt = (x: number, y: number): boolean => {
    return troopPositionsSet.has(`${x},${y}`);
  };

  // 軍の範囲の最小・最大座標を計算（メモ化）
  const bounds = useMemo(() => {
    if (troopsInArmy.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0 };
    }

    const minX = Math.min(...troopsInArmy.map((t) => t.x));
    const maxX = Math.max(...troopsInArmy.map((t) => t.x));
    const minY = Math.min(...troopsInArmy.map((t) => t.y));
    const maxY = Math.max(...troopsInArmy.map((t) => t.y));
    const centerX = minX + (maxX - minX) / 2;

    return { minX, maxX, minY, maxY, centerX };
  }, [troopsInArmy]);

  // 最適なラベル位置を計算（メモ化）
  const labelPosition = useMemo(() => {
    const { minX, maxX, minY, maxY, centerX } = bounds;

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
  }, [bounds, allTroopsSet]);

  // 向きに応じたアイコンを取得（メモ化）
  const DirectionIcon = useMemo((): LucideIcon => {
    switch (army.direction) {
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
  }, [army.direction]);

  // 軍ポップオーバーを開く
  const handleClick = () => {
    dispatch(
      openArmyPopover({
        positions: army.positions,
        armyId: army.id,
      })
    );
  };

  // 軍の色を取得
  const armyColor = ARMY_COLORS[army.color];

  return (
    <div>
      {/* 兵が配置されているタイルごとにボーダーを描画 */}
      {troopsInArmy.map((troop) => {
        const { x, y } = troop;

        // 上下左右の隣接マスに兵がいるかチェック
        const hasTop = hasTroopAt(x, y - 1);
        const hasBottom = hasTroopAt(x, y + 1);
        const hasLeft = hasTroopAt(x - 1, y);
        const hasRight = hasTroopAt(x + 1, y);

        // ボーダーのスタイル（各方向で隣接マスに兵がいない場合のみボーダーを描画）
        const borderStyle = {
          position: "absolute" as const,
          left: x * TILE_SIZE,
          top: y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          borderTop: !hasTop ? `3px solid ${armyColor.border}` : "none",
          borderBottom: !hasBottom ? `3px solid ${armyColor.border}` : "none",
          borderLeft: !hasLeft ? `3px solid ${armyColor.border}` : "none",
          borderRight: !hasRight ? `3px solid ${armyColor.border}` : "none",
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
          backgroundColor: armyColor.background,
          color: "white",
          fontSize: "13px",
          fontWeight: "bold" as const,
          borderRadius: "6px",
          pointerEvents: "auto" as const,
          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px ${armyColor.shadow}`,
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
});
