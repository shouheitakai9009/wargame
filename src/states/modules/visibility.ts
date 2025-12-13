import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { TroopVision } from "../visibility";
import { calculateTroopVision } from "@/lib/visibility";
import { initialMap } from "@/data/initialMap";

type VisibilityState = {
  // 各兵の視界情報（キー: troopId、値: 視界内のタイル座標配列）
  troopVisions: Record<string, TroopVision>;
};

const initialState: VisibilityState = {
  troopVisions: {},
};

/**
 * 特定の兵の視界を更新するThunk
 */
export const updateTroopVisionThunk = createAsyncThunk(
  "visibility/updateTroopVision",
  async (troopId: string, { getState }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = getState() as any;

    // playerTroopsとenemyTroopsの両方から検索
    const allTroops = [...state.army.playerTroops, ...state.army.enemyTroops];

    const troop = allTroops.find((t) => t.id === troopId);

    if (!troop) return null;

    const visibleTilesSet = calculateTroopVision(troop, initialMap);

    return {
      troopId,
      position: { x: troop.x, y: troop.y },
      visibleTiles: Array.from(visibleTilesSet),
    };
  }
);

/**
 * 全兵の視界を再計算するThunk
 */
export const recalculateAllVisionsThunk = createAsyncThunk(
  "visibility/recalculateAll",
  async (_, { getState }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = getState() as any;
    const { playerTroops, enemyTroops } = state.army;

    const allTroops = [...playerTroops, ...enemyTroops];

    const visions = allTroops.map((troop) => {
      const visibleTilesSet = calculateTroopVision(troop, initialMap);
      return {
        troopId: troop.id,
        position: { x: troop.x, y: troop.y },
        visibleTiles: Array.from(visibleTilesSet),
      };
    });

    return visions;
  }
);

const visibilitySlice = createSlice({
  name: "visibility",
  initialState,
  reducers: {
    /**
     * 兵の視界を更新（移動時に呼ばれる）
     */
    updateTroopVision: (state, action: PayloadAction<TroopVision>) => {
      const { troopId } = action.payload;
      state.troopVisions[troopId] = action.payload;
    },

    /**
     * 全兵の視界を再計算（ターン開始時など）
     */
    recalculateAllVisions: (state, action: PayloadAction<TroopVision[]>) => {
      state.troopVisions = {};
      action.payload.forEach((vision) => {
        state.troopVisions[vision.troopId] = vision;
      });
    },

    /**
     * 兵を削除時に視界情報もクリア
     */
    removeTroopVision: (state, action: PayloadAction<string>) => {
      delete state.troopVisions[action.payload];
    },

    /**
     * 全視界情報をクリア
     */
    clearAllVisions: (state) => {
      state.troopVisions = {};
    },
  },
  extraReducers: (builder) => {
    // updateTroopVisionThunkの結果を反映
    builder.addCase(updateTroopVisionThunk.fulfilled, (state, action) => {
      if (action.payload) {
        state.troopVisions[action.payload.troopId] = action.payload;
      }
    });

    // recalculateAllVisionsThunkの結果を反映
    builder.addCase(recalculateAllVisionsThunk.fulfilled, (state, action) => {
      state.troopVisions = {};
      action.payload.forEach((vision) => {
        state.troopVisions[vision.troopId] = vision;
      });
    });
  },
});

export const {
  updateTroopVision,
  recalculateAllVisions,
  removeTroopVision,
  clearAllVisions,
} = visibilitySlice.actions;

export default visibilitySlice.reducer;
