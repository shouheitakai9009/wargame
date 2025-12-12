import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { calculateMoveDirection } from "@/lib/armyMovement";
import {
  type Army,
  ARMY_COLORS,
  ARMY_DIRECTION,
  type ArmyDirection,
} from "../army";
import type { PlacedTroop } from "@/lib/placement";
import { ARMY_FORMATION_MODE, type ArmyFormationMode } from "../battle";
import { initialArmies, initialPlacedTroops } from "@/data/initialPlacement";
import { enemyArmies, enemyPlacedTroops } from "@/data/enemyPlacement";

export type ArmyState = {
  placedTroops: PlacedTroop[];
  isDraggingTroop: boolean;
  armyFormationMode: ArmyFormationMode;
  splittingArmyId: string | null;
  selectionDragStart: { x: number; y: number } | null;
  selectionDragCurrent: { x: number; y: number } | null;
  armies: Army[];
};

export const initialArmyState: ArmyState = {
  placedTroops: initialPlacedTroops,
  isDraggingTroop: false,
  armyFormationMode: ARMY_FORMATION_MODE.NONE,
  splittingArmyId: null,
  selectionDragStart: null,
  selectionDragCurrent: null,
  armies: initialArmies,
};

export const armySlice = createSlice({
  name: "army",
  initialState: initialArmyState,
  reducers: {
    placeTroop: (state, action: PayloadAction<PlacedTroop>) => {
      state.placedTroops.push(action.payload);
    },
    removeTroop: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.placedTroops = state.placedTroops.filter(
        (troop) => troop.x !== action.payload.x || troop.y !== action.payload.y
      );
    },
    beginTroopDrag: (state) => {
      state.isDraggingTroop = true;
    },
    endTroopDrag: (state) => {
      state.isDraggingTroop = false;
    },
    switchArmyFormationMode: (
      state,
      action: PayloadAction<{
        mode: ArmyFormationMode;
        armyId?: string;
      }>
    ) => {
      state.armyFormationMode = action.payload.mode;

      if (
        action.payload.mode === ARMY_FORMATION_MODE.SPLIT &&
        action.payload.armyId
      ) {
        state.splittingArmyId = action.payload.armyId;
      } else {
        state.splittingArmyId = null;
      }

      state.selectionDragStart = null;
      state.selectionDragCurrent = null;
    },
    beginSelectionDrag: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.selectionDragStart = action.payload;
      state.selectionDragCurrent = action.payload;
    },
    updateSelectionDrag: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.selectionDragCurrent = action.payload;
    },
    endSelectionDrag: (state) => {
      state.selectionDragStart = null;
      state.selectionDragCurrent = null;
    },
    confirmArmy: (
      state,
      action: PayloadAction<{
        editingArmy: {
          id?: string;
          name: string;
          morale: number;
          direction: string;
          positions: Array<{ x: number; y: number }>;
        };
      }>
    ) => {
      const { editingArmy } = action.payload;

      if (editingArmy.id) {
        // 更新
        const existingArmyIndex = state.armies.findIndex(
          (a) => a.id === editingArmy.id
        );
        if (existingArmyIndex !== -1) {
          state.armies[existingArmyIndex] = {
            ...state.armies[existingArmyIndex],
            name: editingArmy.name,
            morale: editingArmy.morale,
            direction: editingArmy.direction as ArmyDirection,
          };
        }
      } else {
        // 新規作成
        const usedColors = new Set(state.armies.map((army) => army.color));
        const availableColors = (
          Object.keys(ARMY_COLORS) as Array<keyof typeof ARMY_COLORS>
        ).filter((colorKey) => !usedColors.has(colorKey));

        const assignedColor =
          availableColors.length > 0
            ? availableColors[0]
            : (Object.keys(ARMY_COLORS)[0] as keyof typeof ARMY_COLORS);

        const newArmy: Army = {
          id: `army-${Date.now()}`,
          name: editingArmy.name,
          morale: editingArmy.morale,
          direction: editingArmy.direction as ArmyDirection,
          positions: editingArmy.positions,
          color: assignedColor,
        };
        state.armies.push(newArmy);
      }

      state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
    },
    splitArmy: (
      state,
      action: PayloadAction<{
        originalArmyId: string;
        newArmyPositions: Array<{ x: number; y: number }>;
      }>
    ) => {
      const { originalArmyId, newArmyPositions } = action.payload;
      const newArmySet = new Set(
        newArmyPositions.map((pos) => `${pos.x},${pos.y}`)
      );

      state.armies = state.armies.map((army) => {
        if (army.id === originalArmyId) {
          return {
            ...army,
            positions: army.positions.filter(
              (pos) => !newArmySet.has(`${pos.x},${pos.y}`)
            ),
          };
        }
        return army;
      });

      state.armyFormationMode = ARMY_FORMATION_MODE.NONE;
      state.splittingArmyId = null;
    },
    deleteArmy: (state, action: PayloadAction<string>) => {
      state.armies = state.armies.filter((army) => army.id !== action.payload);
    },
    changeArmyDirection: (
      state,
      action: PayloadAction<{ armyId: string; direction: ArmyDirection }>
    ) => {
      const army = state.armies.find((a) => a.id === action.payload.armyId);
      if (army) {
        army.direction = action.payload.direction;
      }
    },
    moveArmyToTile: (
      state,
      action: PayloadAction<{
        armyId: string;
        targetX: number;
        targetY: number;
      }>
    ) => {
      const { armyId, targetX, targetY } = action.payload;
      const armyIndex = state.armies.findIndex((a) => a.id === armyId);
      if (armyIndex === -1) return;

      const army = state.armies[armyIndex];
      // 移動方向計算
      const {
        direction: moveDirection,
        offsetX,
        offsetY,
      } = calculateMoveDirection(army, targetX, targetY, state.placedTroops);

      if (!moveDirection) return;

      let newDirection: ArmyDirection;
      switch (moveDirection) {
        case "up":
          newDirection = ARMY_DIRECTION.UP;
          break;
        case "down":
          newDirection = ARMY_DIRECTION.DOWN;
          break;
        case "left":
          newDirection = ARMY_DIRECTION.LEFT;
          break;
        case "right":
          newDirection = ARMY_DIRECTION.RIGHT;
          break;
      }

      // Positions更新
      const newPositions = army.positions.map((pos) => ({
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }));

      state.armies[armyIndex] = {
        ...army,
        positions: newPositions,
        direction: newDirection,
      };

      // PlacedTroops更新
      const armyPositionsSet = new Set(
        army.positions.map((pos) => `${pos.x},${pos.y}`)
      );

      state.placedTroops = state.placedTroops.map((troop) => {
        if (armyPositionsSet.has(`${troop.x},${troop.y}`)) {
          return {
            ...troop,
            x: troop.x + offsetX,
            y: troop.y + offsetY,
          };
        }
        return troop;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase("battle/startBattle", (state) => {
      // バトル開始時に敵軍を追加
      state.armies.push(...enemyArmies);
      state.placedTroops.push(...enemyPlacedTroops);
    });
  },
});

export const {
  placeTroop,
  removeTroop,
  beginTroopDrag,
  endTroopDrag,
  switchArmyFormationMode,
  beginSelectionDrag,
  updateSelectionDrag,
  endSelectionDrag,
  confirmArmy,
  splitArmy,
  deleteArmy,
  changeArmyDirection,
  moveArmyToTile,
} = armySlice.actions;

export default armySlice.reducer;
