import { memo, useMemo } from "react";
import { useAppSelector } from "@/states";
import { ArmyBorder } from "./ArmyBorder";

/**
 * 軍の範囲をボーダーで囲み、軍名を表示するオーバーレイ
 * memo化により、armies/placedTroopsに変更がない限り再レンダリングされない
 */
export const ArmyOverlay = memo(function ArmyOverlay() {
  const armies = useAppSelector((state) => state.app.armies);
  const placedTroops = useAppSelector((state) => state.app.placedTroops);

  // 全ての兵の位置をSetに変換（メモ化）
  const allTroopsSet = useMemo(
    () => new Set(placedTroops.map((troop) => `${troop.x},${troop.y}`)),
    [placedTroops]
  );

  // 各軍ごとに兵をフィルタリング（メモ化）
  const armiesWithTroops = useMemo(() => {
    return armies.map((army) => {
      // 軍の座標をSetに変換（高速検索用）
      const armyPositionsSet = new Set(
        army.positions.map((pos) => `${pos.x},${pos.y}`)
      );

      // 実際に兵が配置されているマスのみをフィルタリング
      const troopsInArmy = placedTroops.filter((troop) =>
        armyPositionsSet.has(`${troop.x},${troop.y}`)
      );

      return {
        army,
        troopsInArmy,
      };
    });
  }, [armies, placedTroops]);

  if (armies.length === 0) return null;

  return (
    <>
      {armiesWithTroops.map(({ army, troopsInArmy }) => (
        <ArmyBorder
          key={army.id}
          army={army}
          troopsInArmy={troopsInArmy}
          allTroopsSet={allTroopsSet}
        />
      ))}
    </>
  );
});
