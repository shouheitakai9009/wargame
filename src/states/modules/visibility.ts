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

// ... (existing exports)

// Selectors
import { createSelector } from "@reduxjs/toolkit";
import type { PlacedTroop } from "@/lib/placement";
import type { Army } from "@/states/army";

const selectPlayerTroops = (state: any) =>
  state.army.playerTroops as PlacedTroop[];
const selectArmies = (state: any) => state.army.armies as Army[];
const selectTroopVisions = (state: any) =>
  state.visibility.troopVisions as Record<string, TroopVision>;

/**
 * プレイヤーの視界 + 視界内の敵軍の全位置を統合した「可視タイルセット」を返す
 * メモ化されているため、関係するstateが変わらない限り再計算されない
 */
export const selectRevealedTiles = createSelector(
  [selectPlayerTroops, selectArmies, selectTroopVisions],
  (playerTroops, armies, troopVisions) => {
    const revealedSet = new Set<string>();

    // 1. プレイヤーの視界をすべて追加
    playerTroops.forEach((troop) => {
      const vision = troopVisions[troop.id];
      if (vision?.visibleTiles) {
        vision.visibleTiles.forEach((tile) => revealedSet.add(tile));
      }
    });

    // 2. 視界内に一部でも入っている軍を探す
    armies.forEach((army) => {
      // プレイヤーの軍は（視界ロジック上は）自分の視界を提供する側だが、
      // ここでは「マップ上で見えるもの」を計算している。
      // 便宜上、全軍チェックしても良いが、敵軍だけチェックする方が効率的？
      // いや、敵軍ID判定が必要。
      const isEnemy = army.id.startsWith("enemy-"); // 簡易判定
      if (!isEnemy) return;

      const isSpotted = army.positions.some((pos) =>
        revealedSet.has(`${pos.x},${pos.y}`)
      );

      // 3. 発見された軍の全位置を可視セットに追加
      if (isSpotted) {
        army.positions.forEach((pos) => revealedSet.add(`${pos.x},${pos.y}`));
      }
    });

    return revealedSet;
  }
);

export default visibilitySlice.reducer;
