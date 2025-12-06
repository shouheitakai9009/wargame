import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import {
  closeContextMenu,
  switchArmyFormationMode,
  openArmyPopover,
  deleteArmy,
  removeTroop,
  changeArmyDirection,
  triggerMapEffect,
  switchBattleMoveMode,
} from "@/states/slice";
import {
  BATTLE_PHASE,
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
} from "@/states/battle";
import { ARMY_DIRECTION } from "@/states/army";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalContextMenu() {
  const dispatch = useAppDispatch();
  const contextMenu = useAppSelector((state) => state.app.contextMenu);
  const phase = useAppSelector((state) => state.app.phase);
  const armies = useAppSelector((state) => state.app.armies);
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const armyFormationMode = useAppSelector(
    (state) => state.app.armyFormationMode
  );
  const battleMoveMode = useAppSelector((state) => state.app.battleMoveMode);

  const [directionSubMenuOpen, setDirectionSubMenuOpen] = useState(false);

  // ESCキーでメニューを閉じる（フックは最上位で呼び出す）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(closeContextMenu());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  // スクロール時にメニューを閉じる
  useEffect(() => {
    const handleScroll = () => {
      dispatch(closeContextMenu());
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [dispatch]);

  // コンテキストメニューが開いたときにサブメニューの状態をリセット
  useEffect(() => {
    if (contextMenu?.isOpen) {
      setDirectionSubMenuOpen(false);
    }
  }, [contextMenu?.isOpen]);

  // メニューが閉じている場合は何も表示しない（フックの後に条件分岐）
  if (!contextMenu || !contextMenu.isOpen) {
    return null;
  }

  const { tile, position } = contextMenu;

  // クリックされたマスの情報を取得
  const troopOnTile = placedTroops.find(
    (troop) => troop.x === tile.x && troop.y === tile.y
  );
  const belongingArmy = armies.find((army) =>
    army.positions.some((pos) => pos.x === tile.x && pos.y === tile.y)
  );

  // 画面端でのはみ出し防止
  const MENU_PADDING = 8;
  const MENU_WIDTH = 192; // min-w-[8rem] = 12rem = 192px
  const MENU_HEIGHT = 400; // おおよその高さ（項目数から推定）

  let adjustedX = position.x;
  let adjustedY = position.y;

  // 右端はみ出しチェック
  if (adjustedX + MENU_WIDTH > window.innerWidth) {
    adjustedX = window.innerWidth - MENU_WIDTH - MENU_PADDING;
  }

  // 下端はみ出しチェック
  if (adjustedY + MENU_HEIGHT > window.innerHeight) {
    adjustedY = window.innerHeight - MENU_HEIGHT - MENU_PADDING;
  }

  // 左端・上端チェック（最低限の余白を確保）
  adjustedX = Math.max(MENU_PADDING, adjustedX);
  adjustedY = Math.max(MENU_PADDING, adjustedY);

  const adjustedPosition = { x: adjustedX, y: adjustedY };

  // メニュー項目のクリックハンドラー
  const handleMenuItemClick = (action: string) => {
    switch (action) {
      case "軍編成":
        if (belongingArmy) {
          dispatch(
            openArmyPopover({
              positions: belongingArmy.positions,
              armyId: belongingArmy.id,
            })
          );
        }
        break;
      case "軍選択モード":
        dispatch(switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.SELECT }));
        break;
      case "軍分割モード":
        if (belongingArmy) {
          dispatch(
            switchArmyFormationMode({
              mode: ARMY_FORMATION_MODE.SPLIT,
              armyId: belongingArmy.id,
            })
          );
        }
        break;
      case "移動モード":
        if (belongingArmy) {
          dispatch(
            switchBattleMoveMode({
              mode: BATTLE_MOVE_MODE.MOVE,
              armyId: belongingArmy.id,
            })
          );
        }
        break;
      case "軍の削除":
        if (belongingArmy) {
          dispatch(deleteArmy(belongingArmy.id));
        }
        break;
      case "兵の削除":
        if (!belongingArmy) {
          dispatch(removeTroop({ x: tile.x, y: tile.y }));
        }
        break;
    }
    dispatch(closeContextMenu());
  };

  // 向き変更ハンドラー
  const handleChangeDirection = (
    direction: (typeof ARMY_DIRECTION)[keyof typeof ARMY_DIRECTION]
  ) => {
    if (belongingArmy) {
      dispatch(changeArmyDirection({ armyId: belongingArmy.id, direction }));

      // 向き変更エフェクトを発火
      dispatch(
        triggerMapEffect({
          type: MAP_EFFECT.DIRECTION_CHANGE,
          direction: direction as "UP" | "DOWN" | "LEFT" | "RIGHT",
        })
      );
    }
    dispatch(closeContextMenu());
  };

  return (
    <>
      {/* 背景オーバーレイ（クリックで閉じる） */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => dispatch(closeContextMenu())}
      />

      {/* メニュー本体 */}
      <div
        className="fixed z-[9999] min-w-[8rem] rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        {/* 軍編成（軍に属している場合のみ） */}
        {belongingArmy && (
          <>
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              onClick={() => handleMenuItemClick("軍編成")}
            >
              軍編成
            </div>
            <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />
          </>
        )}

        {/* 軍選択モード（準備フェーズのみ） */}
        {phase === BATTLE_PHASE.PREPARATION && (
          <div
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            onClick={() => handleMenuItemClick("軍選択モード")}
          >
            軍選択モード
            {armyFormationMode === ARMY_FORMATION_MODE.SELECT && " ✓"}
          </div>
        )}

        {/* 軍分割モード（軍に属している場合のみ） */}
        {belongingArmy && (
          <div
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            onClick={() => handleMenuItemClick("軍分割モード")}
          >
            軍分割モード
            {armyFormationMode === ARMY_FORMATION_MODE.SPLIT && " ✓"}
          </div>
        )}

        {/* 向きサブメニュー（軍に属している場合のみ） */}
        {belongingArmy && (
          <div
            className="relative"
            onMouseEnter={() => setDirectionSubMenuOpen(true)}
            onMouseLeave={() => setDirectionSubMenuOpen(false)}
          >
            <div className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800">
              向き
              <ChevronRight className="ml-auto h-4 w-4" />
            </div>

            {/* サブメニュー内容 */}
            {directionSubMenuOpen && (
              <div
                className="absolute left-full top-0 z-[10000] min-w-[8rem] rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 animate-in fade-in-0 zoom-in-95 duration-200"
                style={{ marginLeft: "-1px" }}
                onMouseEnter={() => setDirectionSubMenuOpen(true)}
                onMouseLeave={() => setDirectionSubMenuOpen(false)}
              >
                {Object.entries(ARMY_DIRECTION).map(([key, value]) => (
                  <div
                    key={key}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                    onClick={() => handleChangeDirection(value)}
                  >
                    {key === "UP" && "上"}
                    {key === "DOWN" && "下"}
                    {key === "LEFT" && "左"}
                    {key === "RIGHT" && "右"}
                    {belongingArmy.direction === value && " ✓"}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 移動モード（バトルフェーズ＆軍に属している場合） */}
        {phase === BATTLE_PHASE.BATTLE && belongingArmy && (
          <div
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            onClick={() => handleMenuItemClick("移動モード")}
          >
            移動モード
          </div>
        )}

        {/* モードをキャンセル（軍選択/分割モード） */}
        {(armyFormationMode === ARMY_FORMATION_MODE.SELECT ||
          armyFormationMode === ARMY_FORMATION_MODE.SPLIT) && (
          <>
            <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              onClick={() => {
                dispatch(
                  switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.NONE })
                );
                dispatch(closeContextMenu());
              }}
            >
              モードをキャンセル
            </div>
          </>
        )}

        {/* モードをキャンセル（移動モード） */}
        {battleMoveMode === BATTLE_MOVE_MODE.MOVE && (
          <>
            <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              onClick={() => {
                dispatch(switchBattleMoveMode({ mode: BATTLE_MOVE_MODE.NONE }));
                dispatch(closeContextMenu());
              }}
            >
              モードをキャンセル
            </div>
          </>
        )}

        {/* 軍の削除（準備フェーズ＆軍に属している場合） */}
        {phase === BATTLE_PHASE.PREPARATION && belongingArmy && (
          <>
            <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-50"
              onClick={() => handleMenuItemClick("軍の削除")}
            >
              軍の削除
            </div>
          </>
        )}

        {/* 兵の削除（兵がいる場合） */}
        {troopOnTile && (
          <>
            <div className="-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <div
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-50",
                belongingArmy && "pointer-events-none opacity-50"
              )}
              onClick={() => handleMenuItemClick("兵の削除")}
            >
              兵の削除
              {belongingArmy && " (軍に所属)"}
            </div>
          </>
        )}
      </div>
    </>
  );
}
