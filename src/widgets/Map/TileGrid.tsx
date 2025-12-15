import { memo } from "react";
import { Tile } from "./Tile";
import { initialMap } from "@/data/initialMap";
import { MAP_SIZE } from "@/states/map";

type Props = {
  selectedTiles: Set<string>;
};

// ... imports
import { useAppSelector } from "@/states";
import { selectRevealedTiles } from "@/states/modules/visibility";
import { BATTLE_PHASE } from "@/states/battle";

// ...

export const TileGrid = memo(function TileGrid({ selectedTiles }: Props) {
  const revealedTiles = useAppSelector(selectRevealedTiles);
  const phase = useAppSelector((state) => state.battle.phase);

  return (
    <div className="grid grid-cols-[repeat(30,50px)]">
      {initialMap.map((terrain, i) => {
        const x = i % MAP_SIZE;
        const y = Math.floor(i / MAP_SIZE);
        const isSelected = selectedTiles.has(`${x},${y}`);

        // 準備フェーズ、または可視タイルに含まれる場合のみ表示
        const isVisible =
          phase === BATTLE_PHASE.PREPARATION || revealedTiles.has(`${x},${y}`);

        return (
          <Tile
            key={`${x}-${y}`}
            x={x}
            y={y}
            terrain={terrain}
            isSelected={isSelected}
            isVisible={isVisible}
          />
        );
      })}
    </div>
  );
});
