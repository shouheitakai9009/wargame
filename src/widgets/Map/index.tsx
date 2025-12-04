import { useRef, useState, useMemo, useEffect, type MouseEvent } from "react";
import { Tile } from "./Tile";
import { initialMap } from "../../data/initialMap";
import { MAP_SIZE, TILE_SIZE } from "@/states/map";
import { PlacementConstraints } from "./PlacementConstraints";
import { useAppSelector, useAppDispatch } from "@/states";
import { ARMY_FORMATION_MODE } from "@/states/battle";
import {
  showError,
  endSelectionDrag,
  openArmyPopover,
  zoomInMap,
  zoomOutMap,
} from "@/states/slice";
import { validateArmySelection } from "@/lib/armyValidation";
import { ArmyPopover } from "../ArmyPopover";
import { ArmyOverlay } from "./ArmyOverlay";
import { MapEffectOverlay } from "./MapEffectOverlay";

export const BattleMap = () => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const armyFormationMode = useAppSelector(
    (state) => state.app.armyFormationMode
  );
  const selectionDragStart = useAppSelector(
    (state) => state.app.selectionDragStart
  );
  const selectionDragCurrent = useAppSelector(
    (state) => state.app.selectionDragCurrent
  );
  const placedTroops = useAppSelector((state) => state.app.placedTroops);

  const mapZoomRatio = useAppSelector((state) => state.app.mapZoomRatio);

  // 軍選択モード時はマップのドラッグを無効化
  const isMapDragDisabled = armyFormationMode === ARMY_FORMATION_MODE.SELECT;

  // 選択範囲内の座標セットを計算（メモ化）
  const selectedTiles = useMemo(() => {
    if (
      !selectionDragStart ||
      !selectionDragCurrent ||
      armyFormationMode !== ARMY_FORMATION_MODE.SELECT
    ) {
      return new Set<string>();
    }

    const minX = Math.min(selectionDragStart.x, selectionDragCurrent.x);
    const maxX = Math.max(selectionDragStart.x, selectionDragCurrent.x);
    const minY = Math.min(selectionDragStart.y, selectionDragCurrent.y);
    const maxY = Math.max(selectionDragStart.y, selectionDragCurrent.y);

    const tiles = new Set<string>();
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.add(`${x},${y}`);
      }
    }
    return tiles;
  }, [selectionDragStart, selectionDragCurrent, armyFormationMode]);

  const handleMouseDown = (e: MouseEvent) => {
    if (isMapDragDisabled) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isMapDragDisabled) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isMapDragDisabled) return;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isMapDragDisabled) return;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      dispatch(zoomInMap());
    } else {
      dispatch(zoomOutMap());
    }
  };

  // グローバルなマウスアップイベントで選択範囲のバリデーション
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (
        armyFormationMode === ARMY_FORMATION_MODE.SELECT &&
        selectionDragStart &&
        selectionDragCurrent
      ) {
        // バリデーション実行
        const validation = validateArmySelection(selectedTiles, placedTroops);

        if (!validation.isValid && validation.errorMessage) {
          dispatch(showError(validation.errorMessage));
          // バリデーション失敗時は選択を終了
          dispatch(endSelectionDrag());
        } else if (validation.isValid) {
          // バリデーション成功時は軍ポップオーバーを開く
          const positions = Array.from(selectedTiles).map((key) => {
            const [x, y] = key.split(",").map(Number);
            return { x, y };
          });
          dispatch(openArmyPopover(positions));
          // 選択を終了
          dispatch(endSelectionDrag());
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [
    armyFormationMode,
    selectionDragStart,
    selectionDragCurrent,
    selectedTiles,
    placedTroops,
    dispatch,
  ]);

  return (
    <div
      className="w-full h-full overflow-hidden relative bg-slate-900"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        cursor: isMapDragDisabled ? "default" : "move",
        userSelect: isMapDragDisabled ? "none" : "auto",
        backgroundImage: `
          linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    >
      {/* マップエフェクトオーバーレイ - 攻撃や向き変更のエフェクト */}
      <MapEffectOverlay />

      {/* サイバーグロウオーバーレイ - マップの前面 */}
      <div
        className="absolute inset-0 z-50"
        style={{
          pointerEvents: "none",
          boxShadow: `
            inset 0 0 60px rgba(59, 130, 246, 0.15),
            inset 0 0 30px rgba(59, 130, 246, 0.1),
            0 0 40px rgba(59, 130, 246, 0.2)
          `,
          border: "1px solid rgba(59, 130, 246, 0.3)",
          animation: "cyber-grid-glow 3s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: MAP_SIZE * TILE_SIZE,
          height: MAP_SIZE * TILE_SIZE,
          scale: mapZoomRatio,
        }}
      >
        {/* タイルグリッド */}
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
        {/* 軍のオーバーレイ */}
        <ArmyOverlay />
      </div>
      <PlacementConstraints />
      <ArmyPopover />
    </div>
  );
};
