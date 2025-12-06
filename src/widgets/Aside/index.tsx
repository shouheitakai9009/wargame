import { useAppSelector, useAppDispatch } from "../../states";
import { switchPreparationTab, toggleLeftSidebar } from "../../states/slice";
import { BATTLE_PHASE, PREPARATION_TAB } from "../../states/battle";
import { SoldierPlacement } from "./SoldierPlacement";
import { ArmyPlacement } from "./ArmyPlacement";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Aside() {
  const dispatch = useAppDispatch();
  const { phase, preparationTab, isLeftSidebarOpen } = useAppSelector(
    (state) => state.app
  );

  // バトル中は兵配置タブをdisabled
  const isSoldierTabDisabled = phase === BATTLE_PHASE.BATTLE;

  return (
    <div className="relative flex">
      {/* サイドバー本体 */}
      <aside
        className={`bg-slate-800 border-r border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
          isLeftSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-r-0"
        }`}
      >
        <div className="overflow-y-auto custom-scrollbar h-full">
          {/* タブヘッダー */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() =>
                !isSoldierTabDisabled &&
                dispatch(switchPreparationTab(PREPARATION_TAB.DEPLOY_SOLDIER))
              }
              disabled={isSoldierTabDisabled}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                preparationTab === PREPARATION_TAB.DEPLOY_SOLDIER
                  ? "bg-slate-700 text-white border-b-2 border-blue-500"
                  : isSoldierTabDisabled
                  ? "text-slate-600 cursor-not-allowed"
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
            {preparationTab === PREPARATION_TAB.DEPLOY_SOLDIER &&
              !isSoldierTabDisabled && <SoldierPlacement />}
            {(preparationTab === PREPARATION_TAB.FORM_ARMY ||
              isSoldierTabDisabled) && <ArmyPlacement />}
          </div>
        </div>
      </aside>

      {/* トグルボタン */}
      <button
        onClick={() => dispatch(toggleLeftSidebar())}
        className={`absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 z-10 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r-lg border border-l-0 border-slate-600 transition-all duration-300 ${
          !isLeftSidebarOpen ? "translate-x-0" : ""
        }`}
        aria-label={
          isLeftSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"
        }
      >
        {isLeftSidebarOpen ? (
          <ChevronLeft size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </button>
    </div>
  );
}
