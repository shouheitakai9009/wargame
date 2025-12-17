import {
  useRef,
  useState,
  useMemo,
  useEffect,
  type MouseEvent,
  memo,
  useCallback,
} from "react";
import { TileGrid } from "./TileGrid";
import { MAP_SIZE, TILE_SIZE } from "@/states/map";
import { PlacementConstraints } from "./PlacementConstraints";
import { useAppSelector, useAppDispatch } from "@/states";
import { ARMY_FORMATION_MODE } from "@/states/battle";
import {
  showError,
  openArmyPopover,
  zoomInMap,
  zoomOutMap,
} from "@/states/modules/ui";
import { endSelectionDrag, splitArmy } from "@/states/modules/army";
import { validateArmySelection, validateArmySplit } from "@/lib/armyValidation";
import { ArmyPopover } from "../ArmyPopover";
import { ArmyOverlay } from "./ArmyOverlay";
import { MapEffectOverlay } from "./MapEffectOverlay";
import { AttackEffects } from "./AttackEffects";

export const Map = memo(function Map() {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);

  // React Stateでの座標管理を廃止し、Refで管理
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);

  const armyFormationMode = useAppSelector(
    (state) => state.army.armyFormationMode
  );
  const selectionDragStart = useAppSelector(
    (state) => state.army.selectionDragStart
  );
  const selectionDragCurrent = useAppSelector(
    (state) => state.army.selectionDragCurrent
  );
  const { playerTroops, enemyTroops } = useAppSelector((state) => state.army);
  const placedTroops = useMemo(
    () => [...playerTroops, ...enemyTroops],
    [playerTroops, enemyTroops]
  );
  const armies = useAppSelector((state) => state.army.armies);
  const splittingArmyId = useAppSelector((state) => state.army.splittingArmyId);

  const mapZoomRatio = useAppSelector((state) => state.ui.mapZoomRatio);

  // 軍選択モード 又は 分割モード時はマップのドラッグを無効化
  const isMapDragDisabled =
    armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
    armyFormationMode === ARMY_FORMATION_MODE.SPLIT;

  // 選択範囲内の座標セットを計算（メモ化）
  const selectedTiles = useMemo(() => {
    if (
      !selectionDragStart ||
      !selectionDragCurrent ||
      (armyFormationMode !== ARMY_FORMATION_MODE.SELECT &&
        armyFormationMode !== ARMY_FORMATION_MODE.SPLIT)
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

  // Transformを更新するヘルパー関数
  // useCallbackでメモ化して依存関係エラーを解消
  const updateTransform = useCallback(() => {
    if (mapContentRef.current) {
      const { x, y } = positionRef.current;
      mapContentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${mapZoomRatio})`;
    }
  }, [mapZoomRatio]);

  // ズーム比率が変わった時にTransformを更新
  useEffect(() => {
    updateTransform();
  }, [updateTransform]);

  const handleMouseDown = (e: MouseEvent) => {
    if (isMapDragDisabled) return;
    setIsDragging(true);

    // ドラッグ開始時のオフセットを保存
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isMapDragDisabled) return;

    // 新しい座標を計算
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    // Refを更新
    positionRef.current = { x: newX, y: newY };

    // DOMを直接更新（Reactのレンダリングをバイパス）
    updateTransform();
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
      // 軍選択モード
      if (
        armyFormationMode === ARMY_FORMATION_MODE.SELECT &&
        selectionDragStart &&
        selectionDragCurrent &&
        selectedTiles.size > 0 // selectedTilesが空でない場合のみ処理
      ) {
        // バリデーション実行
        const validation = validateArmySelection(
          selectedTiles,
          placedTroops,
          armies
        );

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
          dispatch(openArmyPopover({ positions }));
          // 選択を終了
          dispatch(endSelectionDrag());
        }
      }

      // 軍分割モード
      if (
        armyFormationMode === ARMY_FORMATION_MODE.SPLIT &&
        splittingArmyId &&
        selectedTiles.size > 0 // selectedTilesが空でない場合のみ処理
      ) {
        // 分割対象の軍を取得
        const army = armies.find((a) => a.id === splittingArmyId);
        if (!army) {
          dispatch(showError("分割対象の軍が見つかりません"));
          dispatch(endSelectionDrag());
          return;
        }

        // バリデーション実行
        const positions = Array.from(selectedTiles).map((key) => {
          const [x, y] = key.split(",").map(Number);
          return { x, y };
        });

        const validation = validateArmySplit(selectedTiles, army, placedTroops);

        if (!validation.isValid && validation.errorMessage) {
          dispatch(showError(validation.errorMessage));
          // バリデーション失敗時は選択を終了
          dispatch(endSelectionDrag());
        } else if (validation.isValid) {
          // バリデーション成功時は軍を分割
          dispatch(
            splitArmy({
              originalArmyId: splittingArmyId,
              newArmyPositions: positions,
            })
          );
          // 新しい軍のポップオーバーを開く
          dispatch(openArmyPopover({ positions }));
          // 選択を終了
          dispatch(endSelectionDrag());
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [armyFormationMode, selectionDragStart, selectionDragCurrent, selectedTiles, placedTroops, splittingArmyId, armies, dispatch]);

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
        className="absolute"
        ref={mapContentRef}
        style={{
          // 初期位置
          transform: "translate(0px, 0px) scale(1)",
          width: MAP_SIZE * TILE_SIZE,
          height: MAP_SIZE * TILE_SIZE,
          transformOrigin: "top left", // ズームの原点を左上に
        }}
      >
        {/* タイルグリッド */}
        <TileGrid selectedTiles={selectedTiles} />
        {/* 軍のオーバーレイ */}
        <ArmyOverlay />
        {/* 攻撃エフェクト */}
        <AttackEffects />
        <ArmyPopover />
      </div>
      <PlacementConstraints />
    </div>
  );
});
