import { memo, useMemo } from "react";
import { useAppSelector } from "@/states";
import { ArmyBorder } from "./ArmyBorder";
import type { PlacedTroop } from "@/lib/placement";
import type { Army } from "@/states/army";

/**
 * 軍の範囲をボーダーで囲み、軍名を表示するオーバーレイ
 * memo化により、armies/placedTroopsに変更がない限り再レンダリングされない
 */
export const ArmyOverlay = memo(function ArmyOverlay() {
  const { playerTroops, enemyTroops, armies } = useAppSelector(
    (state) => state.army
  );

  // 全ての兵の位置をSetに変換（メモ化）
  const allTroopsSet = useMemo(() => {
    const troops = [...playerTroops, ...enemyTroops];
    return new Set(troops.map((troop: PlacedTroop) => `${troop.x},${troop.y}`));
  }, [playerTroops, enemyTroops]);

  // 各軍ごとに兵をフィルタリング（メモ化）
  const armiesWithTroops = useMemo(() => {
    return armies.map((army: Army) => {
      // 軍の座標をSetに変換（高速検索用）
      const armyPositionsSet = new Set(
        army.positions.map(
          (pos: { x: number; y: number }) => `${pos.x},${pos.y}`
        )
      );

      // 実際に兵が配置されているマスのみをフィルタリング（重複排除）
      const troops = [...playerTroops, ...enemyTroops];
      const uniqueTroopsMap = new Map<string, PlacedTroop>();

      troops.forEach((troop) => {
        const key = `${troop.x},${troop.y}`;
        if (armyPositionsSet.has(key) && !uniqueTroopsMap.has(key)) {
          uniqueTroopsMap.set(key, troop);
        }
      });

      const troopsInArmy = Array.from(uniqueTroopsMap.values());

      return {
        army,
        troopsInArmy,
      };
    });
  }, [armies, playerTroops, enemyTroops]);

  if (armies.length === 0) return null;

  return (
    <>
      {armiesWithTroops.map(
        ({
          army,
          troopsInArmy,
        }: {
          army: Army;
          troopsInArmy: PlacedTroop[];
        }) => (
          <ArmyBorder
            key={army.id}
            army={army}
            troopsInArmy={troopsInArmy}
            allTroopsSet={allTroopsSet}
          />
        )
      )}
    </>
  );
});
