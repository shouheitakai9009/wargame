import {
  configureStore,
  combineReducers,
  type UnknownAction,
} from "@reduxjs/toolkit";
import uiReducer from "./modules/ui";
import battleReducer from "./modules/battle";
import armyReducer from "./modules/army";
import mapReducer from "./modules/map";
import visibilityReducer from "./modules/visibility";
import { useDispatch, useSelector } from "react-redux";

const appReducer = combineReducers({
  ui: uiReducer,
  battle: battleReducer,
  army: armyReducer,
  map: mapReducer,
  visibility: visibilityReducer,
});

type AppRootState = ReturnType<typeof appReducer>;

export const RESET_STATE = "RESET_STATE";
export const resetState = () => ({ type: RESET_STATE });

const rootReducer = (
  state: AppRootState | undefined,
  action: UnknownAction
) => {
  if (action.type === RESET_STATE) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
