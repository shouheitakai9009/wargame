import { useRef } from "react";
import { useDrop } from "@react-aria/dnd";
import { useAppDispatch, useAppSelector } from "@/states";
import { placeTroop, showError } from "@/states/slice";
import { TERRAIN_TYPE, type Terrain } from "@/states/terrain";
import { canPlaceTroop, isPositionOccupied } from "@/lib/placement";
import type { SoldierType } from "@/states/soldier";

type UseTileDropParams = {
  x: number;
  y: number;
  terrain: Terrain;
  isPlacementZone: boolean;
};

export function useTileDrop({
  x,
  y,
  terrain,
  isPlacementZone,
}: UseTileDropParams) {
  const dispatch = useAppDispatch();
  const placedTroops = useAppSelector((state) => state.app.placedTroops);
  const ref = useRef<HTMLDivElement>(null);

  const { dropProps, isDropTarget } = useDrop({
    ref,
    onDrop: async (e) => {
      if (!isPlacementZone) return;

      const item = e.items.find(
        (item) => item.kind === "text" && item.types.has("application/json")
      );

      if (item && item.kind === "text") {
        try {
          const text = await item.getText("application/json");
          const data = JSON.parse(text) as {
            type: SoldierType;
            theme: { primary: string; secondary: string };
          };

          // Validate placement
          if (isPositionOccupied(x, y, placedTroops)) {
            dispatch(showError("既に配置されています"));
            return;
          }

          // 騎兵は水マスに配置できない
          if (data.type === "CAVALRY" && terrain.type === TERRAIN_TYPE.WATER) {
            dispatch(showError("騎兵は水マスに配置できません"));
            return;
          }

          if (!canPlaceTroop(data.type, placedTroops)) {
            // Determine reason for failure
            const total = placedTroops.length;
            const counts = placedTroops.reduce((acc, troop) => {
              acc[troop.type] = (acc[troop.type] || 0) + 1;
              return acc;
            }, {} as Record<SoldierType, number>);

            if (total >= 30) {
              dispatch(showError("最大配置数（30体）を超えています"));
            } else if (data.type === "GENERAL" && (counts.GENERAL || 0) >= 1) {
              dispatch(showError("将軍は1体までしか配置できません"));
            } else if (data.type === "CAVALRY" && (counts.CAVALRY || 0) >= 10) {
              dispatch(showError("騎兵は10体までしか配置できません"));
            } else {
              dispatch(showError("配置制限を超えています"));
            }
            return;
          }

          // Place troop
          dispatch(
            placeTroop({
              x,
              y,
              type: data.type,
              hp: 1000, // MAX_SOLDIER_HP
              theme: data.theme,
            })
          );
        } catch (error) {
          console.error("Failed to parse drop data", error);
        }
      }
    },
  });

  return { ref, dropProps, isDropTarget };
}
