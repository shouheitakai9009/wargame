import { memo } from "react";
import { Tile } from "./Tile";
import { initialMap } from "@/data/initialMap";
import { MAP_SIZE } from "@/states/map";

type Props = {
  selectedTiles: Set<string>;
};

export const TileGrid = memo(function TileGrid({ selectedTiles }: Props) {
  return (
    <div className="grid grid-cols-[repeat(30,50px)]">
      {initialMap.map((terrain, i) => {
        const x = i % MAP_SIZE;
        const y = Math.floor(i / MAP_SIZE);
        const isSelected = selectedTiles.has(`${x},${y}`);
        return (
          <Tile
            key={`${x}-${y}`}
            x={x}
            y={y}
            terrain={terrain}
            isSelected={isSelected}
          />
        );
      })}
    </div>
  );
});
