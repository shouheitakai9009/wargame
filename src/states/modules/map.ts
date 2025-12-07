import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type MapEffect, type MapEffectType } from "../battle";

export type MapState = {
  mapEffect: MapEffect | null;
};

export const initialMapState: MapState = {
  mapEffect: null,
};

export const mapSlice = createSlice({
  name: "map",
  initialState: initialMapState,
  reducers: {
    triggerMapEffect: (
      state,
      action: PayloadAction<{
        type: MapEffectType;
        direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
      }>
    ) => {
      state.mapEffect = {
        type: action.payload.type,
        direction: action.payload.direction,
        timestamp: Date.now(),
      };
    },
    clearMapEffect: (state) => {
      state.mapEffect = null;
    },
  },
});

export const { triggerMapEffect, clearMapEffect } = mapSlice.actions;

export default mapSlice.reducer;
