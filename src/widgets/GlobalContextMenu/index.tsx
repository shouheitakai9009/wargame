import { useMemo } from "react";
import { switchArmyFormationMode } from "@/states/modules/army";
import { switchBattleMoveMode } from "@/states/modules/battle";
import {
  BATTLE_PHASE,
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
} from "@/states/battle";
import { closeContextMenu } from "@/states/modules/ui";
import { useAppDispatch, useAppSelector } from "@/states";
import { ContextMenuItem } from "./ContextMenuItem";
import { MenuDivider } from "./MenuDivider";
import { DirectionSubMenu } from "./DirectionSubMenu";
import { useContextMenuPosition } from "./useContextMenuPosition";
import { useContextMenuHandlers } from "./useContextMenuHandlers";
import { useMenuVisibility } from "./useMenuVisibility";
import { type PlacedTroop } from "@/lib/placement";
import { type Army } from "@/states/army";

export function GlobalContextMenu() {
  const contextMenu = useAppSelector((state) => state.ui.contextMenu);

  // メニューが閉じている場合は何も表示しない
  if (!contextMenu || !contextMenu.isOpen) {
    return null;
  }

  return <MenuContent contextMenu={contextMenu} />;
}

function MenuContent({
  contextMenu,
}: {
  contextMenu: {
    isOpen: boolean;
    tile: { x: number; y: number };
    position: { x: number; y: number };
  };
}) {
  const dispatch = useAppDispatch();
  const armies = useAppSelector((state) => state.army.armies);
  const placedTroops = useAppSelector((state) => state.army.placedTroops);
  const phase = useAppSelector((state) => state.battle.phase);
  const armyFormationMode = useAppSelector(
    (state) => state.army.armyFormationMode
  );
  const battleMoveMode = useAppSelector((state) => state.battle.battleMoveMode);

  const { directionSubMenuOpen, setDirectionSubMenuOpen } = useMenuVisibility({
    isOpen: true,
    dispatch,
  });

  // tile と position を早期に取得
  const tile = contextMenu?.tile ?? { x: 0, y: 0 };
  const position = contextMenu?.position ?? { x: 0, y: 0 };

  // クリックされたマスの情報を取得（useMemoで最適化）
  const troopOnTile = useMemo(
    () =>
      placedTroops.find(
        (troop: PlacedTroop) => troop.x === tile.x && troop.y === tile.y
      ),
    [placedTroops, tile.x, tile.y]
  );

  const belongingArmy = useMemo(
    () =>
      armies.find((army: Army) =>
        army.positions.some(
          (pos: { x: number; y: number }) =>
            pos.x === tile.x && pos.y === tile.y
        )
      ),
    [armies, tile.x, tile.y]
  );

  // 位置計算フックを使用
  const adjustedPosition = useContextMenuPosition(position);

  // ハンドラーフックを使用
  const { handleMenuItemClick, handleChangeDirection } = useContextMenuHandlers(
    {
      tile,
      belongingArmy,
      dispatch,
    }
  );

  return (
    <>
      {/* 背景オーバーレイ（クリックで閉じる） */}
      <div
        className="fixed inset-0 z-9998"
        onClick={() => dispatch(closeContextMenu())}
      />

      {/* メニュー本体 */}
      <div
        className="fixed z-9999 min-w-32 rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* 軍編成（軍に属している場合のみ） */}
        {belongingArmy && (
          <>
            <ContextMenuItem
              label="軍編成"
              onClick={() => handleMenuItemClick("軍編成")}
            />
            <MenuDivider />
          </>
        )}

        {/* 軍選択モード（準備フェーズのみ） */}
        {phase === BATTLE_PHASE.PREPARATION && (
          <ContextMenuItem
            label="軍選択モード"
            onClick={() => handleMenuItemClick("軍選択モード")}
            checked={armyFormationMode === ARMY_FORMATION_MODE.SELECT}
          />
        )}

        {/* 軍分割モード（軍に属している場合のみ） */}
        {belongingArmy && (
          <ContextMenuItem
            label="軍分割モード"
            onClick={() => handleMenuItemClick("軍分割モード")}
            checked={armyFormationMode === ARMY_FORMATION_MODE.SPLIT}
          />
        )}

        {/* 向きサブメニュー（軍に属している場合のみ） */}
        {belongingArmy && (
          <DirectionSubMenu
            belongingArmy={belongingArmy}
            isOpen={directionSubMenuOpen}
            onOpenChange={setDirectionSubMenuOpen}
            onSelectDirection={handleChangeDirection}
          />
        )}

        {/* 移動モード（バトルフェーズ＆軍に属している場合） */}
        {phase === BATTLE_PHASE.BATTLE && belongingArmy && (
          <ContextMenuItem
            label="移動モード"
            onClick={() => handleMenuItemClick("移動モード")}
          />
        )}

        {/* モードをキャンセル（軍選択/分割モード） */}
        {(armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
          armyFormationMode === ARMY_FORMATION_MODE.SPLIT) && (
          <>
            <MenuDivider />
            <ContextMenuItem
              label="モードをキャンセル"
              onClick={() => {
                dispatch(
                  switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.NONE })
                );
                dispatch(closeContextMenu());
              }}
            />
          </>
        )}

        {/* モードをキャンセル（移動モード） */}
        {battleMoveMode === BATTLE_MOVE_MODE.MOVE && (
          <>
            <MenuDivider />
            <ContextMenuItem
              label="モードをキャンセル"
              onClick={() => {
                dispatch(switchBattleMoveMode({ mode: BATTLE_MOVE_MODE.NONE }));
                dispatch(closeContextMenu());
              }}
            />
          </>
        )}

        {/* 軍の削除（準備フェーズ＆軍に属している場合） */}
        {phase === BATTLE_PHASE.PREPARATION && belongingArmy && (
          <>
            <MenuDivider />
            <ContextMenuItem
              label="軍の削除"
              onClick={() => handleMenuItemClick("軍の削除")}
              variant="danger"
            />
          </>
        )}

        {/* 兵の削除（兵がいる場合） */}
        {troopOnTile && (
          <>
            <MenuDivider />
            <ContextMenuItem
              label={`兵の削除${belongingArmy ? " (軍に所属)" : ""}`}
              onClick={() => handleMenuItemClick("兵の削除")}
              variant="danger"
              disabled={Boolean(belongingArmy)}
            />
          </>
        )}
      </div>
    </>
  );
}
