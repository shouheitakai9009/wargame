import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { closeArmyPopover, updateArmyName } from "@/states/modules/ui";
import { confirmArmy } from "@/states/modules/army";
import { MAX_MORALE, MAX_TROOP_HEALTH } from "@/states/army";
import type { PlacedTroop } from "@/lib/placement";

export function useArmyPopover() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isArmyPopoverOpen);
  const editingArmy = useAppSelector((state) => state.ui.editingArmy);
  const placedTroops = useAppSelector((state) => state.army.placedTroops);

  const [localName, setLocalName] = useState(editingArmy?.name ?? "");

  // Derived state: Troops in the army
  const troopsInArmy = useMemo(() => {
    if (!editingArmy) return [];
    return placedTroops.filter((troop: PlacedTroop) =>
      editingArmy.positions.some(
        (pos: { x: number; y: number }) =>
          pos.x === troop.x && pos.y === troop.y
      )
    );
  }, [editingArmy, placedTroops]);

  // Derived state: Health stats
  const armyStats = useMemo(() => {
    // Original code:
    // const totalHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
    // const maxHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
    // Actually totalHealth should probably be sum of current hp if troops have damage?
    // But original code was: const totalHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
    // Wait, let's check original code again.
    // Line 41: const totalHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
    // It seems implementation assumes full health for now or simpler logic.
    // Actually, earlier in ArmyPlacement (ArmyCard), it was calculating sum of troop.hp.
    // Let's improve this to use sum of troop.hp if possible, but let's stick to original behavior first to match refactor scope.
    // However, looking at ArmyPopover line 41, it uses length * MAX_TROOP_HEALTH.

    // Let's assume calculate derived stats here
    const currentHealth = troopsInArmy.reduce(
      (sum: number, t: PlacedTroop) => sum + (t.hp ?? MAX_TROOP_HEALTH),
      0
    );
    const maxPossbileHealth = troopsInArmy.length * MAX_TROOP_HEALTH;
    const percentage =
      maxPossbileHealth > 0 ? (currentHealth / maxPossbileHealth) * 100 : 0;

    return {
      currentHealth,
      maxHealth: maxPossbileHealth,
      percentage,
    };
  }, [troopsInArmy]);

  // Derived state: Center position
  const centerPosition = useMemo(() => {
    if (!editingArmy || editingArmy.positions.length === 0)
      return { x: 0, y: 0 };

    const sumX = editingArmy.positions.reduce(
      (sum: number, p: { x: number; y: number }) => sum + p.x,
      0
    );
    const sumY = editingArmy.positions.reduce(
      (sum: number, p: { x: number; y: number }) => sum + p.y,
      0
    );

    return {
      x: sumX / editingArmy.positions.length,
      y: sumY / editingArmy.positions.length,
    };
  }, [editingArmy]);

  const handleConfirm = () => {
    if (!editingArmy) return;
    dispatch(updateArmyName(localName));
    dispatch(
      confirmArmy({
        editingArmy: {
          ...editingArmy,
          name: localName,
        },
      })
    );
  };

  const handleCancel = () => {
    dispatch(closeArmyPopover());
  };

  return {
    isOpen,
    editingArmy,
    localName,
    setLocalName,
    armyStats,
    centerPosition,
    handleConfirm,
    handleCancel,
    MAX_MORALE,
  };
}
