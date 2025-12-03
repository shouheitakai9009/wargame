import { useAppSelector, useAppDispatch } from "../../states";
import { switchPreparationTab } from "../../states/slice";
import { BATTLE_PHASE, PREPARATION_TAB } from "../../states/battle";
import { SoldierPlacement } from "./SoldierPlacement";
import { ArmyPlacement } from "./ArmyPlacement";

export function Aside() {
  const dispatch = useAppDispatch();
  const { phase, preparationTab } = useAppSelector((state) => state.app);

  // 準備中のみ表示
  if (phase !== BATTLE_PHASE.PREPARATION) {
    return null;
  }

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto custom-scrollbar">
      {/* タブヘッダー */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() =>
            dispatch(switchPreparationTab(PREPARATION_TAB.DEPLOY_SOLDIER))
          }
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            preparationTab === PREPARATION_TAB.DEPLOY_SOLDIER
              ? "bg-slate-700 text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          兵配置
        </button>
        <button
          onClick={() =>
            dispatch(switchPreparationTab(PREPARATION_TAB.FORM_ARMY))
          }
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            preparationTab === PREPARATION_TAB.FORM_ARMY
              ? "bg-slate-700 text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          軍編成
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="p-4">
        {preparationTab === PREPARATION_TAB.DEPLOY_SOLDIER && (
          <SoldierPlacement />
        )}
        {preparationTab === PREPARATION_TAB.FORM_ARMY && <ArmyPlacement />}
      </div>
    </aside>
  );
}
