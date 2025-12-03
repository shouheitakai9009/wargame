import { useRef, useState, type MouseEvent } from "react";
import { Tile } from "./Tile";
import { initialMap } from "../../data/initialMap";
import { MAP_SIZE, TILE_SIZE } from "@/states/map";
import { PlacementConstraints } from "./PlacementConstraints";

export const BattleMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="w-full h-full overflow-hidden relative bg-slate-900 cursor-move"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute grid grid-cols-[repeat(30,50px)]"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: MAP_SIZE * TILE_SIZE,
          height: MAP_SIZE * TILE_SIZE,
        }}
      >
        {initialMap.map((terrain, i) => {
          const x = i % MAP_SIZE;
          const y = Math.floor(i / MAP_SIZE);
          return <Tile key={`${x}-${y}`} x={x} y={y} terrain={terrain} />;
        })}
      </div>
      <PlacementConstraints />
    </div>
  );
};
