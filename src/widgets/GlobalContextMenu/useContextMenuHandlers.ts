import { useCallback } from "react";
import type { AppDispatch } from "@/states";
import {
  switchArmyFormationMode,
  deleteArmy,
  removeTroop,
  changeArmyDirection,
} from "@/states/modules/army";
import { triggerMapEffect } from "@/states/modules/map";
import { switchBattleMoveMode } from "@/states/modules/battle";
import { closeContextMenu, openArmyPopover } from "@/states/modules/ui";
import {
  ARMY_FORMATION_MODE,
  BATTLE_MOVE_MODE,
  MAP_EFFECT,
} from "@/states/battle";
import type { Army, ArmyDirection } from "@/states/army";
import type { PlacedTroop } from "@/lib/placement";

type UseContextMenuHandlersParams = {
  tile: { x: number; y: number };
  belongingArmy: Army | undefined;
  dispatch: AppDispatch;
  armies: Army[];
  placedTroops: PlacedTroop[];
};

export function useContextMenuHandlers({
  tile,
  belongingArmy,
  dispatch,
  armies,
  placedTroops,
}: UseContextMenuHandlersParams) {
  const handleMenuItemClick = useCallback(
    (action: string) => {
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
          dispatch(
            switchArmyFormationMode({ mode: ARMY_FORMATION_MODE.SELECT })
          );
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
                context: {
                  armies,
                  placedTroops,
                },
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
    },
    [belongingArmy, dispatch, tile.x, tile.y, armies, placedTroops]
  );

  const handleChangeDirection = useCallback(
    (direction: ArmyDirection) => {
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
    },
    [belongingArmy, dispatch]
  );

  return { handleMenuItemClick, handleChangeDirection };
}
