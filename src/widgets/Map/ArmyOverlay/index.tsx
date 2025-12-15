import { memo, useMemo } from "react";
import { useAppSelector } from "@/states";
import { ArmyBorder } from "./ArmyBorder";
import type { PlacedTroop } from "@/lib/placement";
import type { Army } from "@/states/army";
import { selectRevealedTiles } from "@/states/modules/visibility";

/**
 * 軍の範囲をボーダーで囲み、軍名を表示するオーバーレイ
 * memo化により、armies/placedTroopsに変更がない限り再レンダリングされない
 */
export const ArmyOverlay = memo(function ArmyOverlay() {
  // visibilityとphaseを取得
  const { playerTroops, enemyTroops, armies, phase } = useAppSelector(
    (state) => ({
      playerTroops: state.army.playerTroops,
      enemyTroops: state.army.enemyTroops,
      armies: state.army.armies,
      phase: state.battle.phase,
    })
  );

  const visibleTileSet = useAppSelector(selectRevealedTiles);

  // 全ての兵の位置をSetに変換（メモ化）
  const allTroopsSet = useMemo(() => {
    const troops = [...playerTroops, ...enemyTroops];
    return new Set(troops.map((troop: PlacedTroop) => `${troop.x},${troop.y}`));
  }, [playerTroops, enemyTroops]);

  // 各軍ごとに兵をフィルタリング（メモ化）
  const armiesWithTroops = useMemo(() => {
    return armies
      .filter((army) => {
        // 準備フェーズは全て表示
        if (phase === "PREPARATION") return true;

        // プレイヤーの軍は常に表示
        // データ構造上、敵軍かどうかはIDやリストで管理されているが、ここではarmiesリストしか持っていない。
        // No op specific here, just commenting my thought process.
        // I will invoke the replacement for ArmyOverlay to remove unused imports if any context is lost.
        // Actually, `ArmyOverlay` uses `selectRevealedTiles`. I added the import in the previous tool call.
        // But `ArmyOverlay` might have duplicate imports or unused ones.
        // I'll wait for lint feedback.layerTroopsに含まれる兵を持つ軍ならプレイヤー軍
        const isPlayer = playerTroops.some((pt) =>
          army.positions.some((pos) => pos.x === pt.x && pos.y === pt.y)
        );
        if (isPlayer) return true;

        // 敵軍の場合、視界内のマスに兵がいるかチェック
        // ※ 視界ロジック：軍全体が隠れている場合のみ非表示にするか、それとも「視界内の兵」だけ枠を出すか？
        //   枠（ArmyBorder）は軍全体を囲むもの。
        //   もし軍の一部しか見えていない場合、見えている部分だけ囲むのが自然だが、ArmyBorderの実装は「軍全体」を囲むロジックになっているか、troopsInArmyに基づいて描画しているか？
        //   ArmyBorderは props.troopsInArmy を元に描画している。
        //   なので、ここで troopsInArmy を「視界内の兵」だけにフィルタリングして渡せば、見えている兵だけが囲まれるようになる。
        //   もし視界内の兵が0なら、filterで除外されるか、あるいはArmyBorder側で非表示になる。

        // とりあえず軍自体を表示するかどうかの判定をする。
        const isVisible = army.positions.some((pos) =>
          visibleTileSet.has(`${pos.x},${pos.y}`)
        );
        return isVisible;
      })
      .map((army: Army) => {
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
          // 所属チェック + 視界チェック（敵兵の場合）
          if (armyPositionsSet.has(key) && !uniqueTroopsMap.has(key)) {
            // 敵兵でかつ視界外なら除外する？
            // ArmyBorderは「見えている兵」だけを囲むべき。
            // そうしないと、見えない兵の位置まで枠が伸びてしまい、敵の位置がバレる。
            if (phase !== "PREPARATION") {
              // 敵兵かどうかの判定が必要
              const isEnemyTroop = enemyTroops.some((et) => et.id === troop.id);
              if (isEnemyTroop) {
                if (!visibleTileSet.has(key)) {
                  return; // 視界外の敵兵は除外
                }
              }
            }
            uniqueTroopsMap.set(key, troop);
          }
        });

        const troopsInArmy = Array.from(uniqueTroopsMap.values());

        return {
          army,
          troopsInArmy,
        };
      })
      .filter((item) => item.troopsInArmy.length > 0); // 兵がいない（全て視界外の）軍は除外
  }, [armies, playerTroops, enemyTroops, phase, visibleTileSet]);

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
