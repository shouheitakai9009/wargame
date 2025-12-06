import { useAppSelector, useAppDispatch } from "../../states";
import { switchRightSidebarTab, toggleRightSidebar } from "../../states/slice";
import { RIGHT_SIDEBAR_TAB } from "../../states/battle";
import { BattleLog } from "../BattleLog";
import { RuleExplanation } from "../RuleExplanation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function RightSidebar() {
  const dispatch = useAppDispatch();
  const { rightSidebarTab, isRightSidebarOpen } = useAppSelector(
    (state) => state.app
  );

  return (
    <div className="relative flex">
      {/* トグルボタン */}
      <button
        onClick={() => dispatch(toggleRightSidebar())}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-slate-800 border border-slate-700 border-r-0 rounded-l-lg p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10 shadow-md"
        aria-label={
          isRightSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"
        }
      >
        {isRightSidebarOpen ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>

      {/* サイドバー本体 */}
      <aside
        className={`bg-slate-800 border-l border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
          isRightSidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
        }`}
      >
        <div className="w-80 h-full flex flex-col overflow-y-auto custom-scrollbar">
          {/* タブヘッダー */}
          <div className="flex border-b border-slate-700 shrink-0">
            <button
              onClick={() =>
                dispatch(switchRightSidebarTab(RIGHT_SIDEBAR_TAB.BATTLE_LOG))
              }
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightSidebarTab === RIGHT_SIDEBAR_TAB.BATTLE_LOG
                  ? "bg-slate-700 text-white border-b-2 border-blue-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              戦闘ログ
            </button>
            <button
              onClick={() =>
                dispatch(
                  switchRightSidebarTab(RIGHT_SIDEBAR_TAB.RULE_EXPLANATION)
                )
              }
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightSidebarTab === RIGHT_SIDEBAR_TAB.RULE_EXPLANATION
                  ? "bg-slate-700 text-white border-b-2 border-blue-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              ルール解説
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className="p-4 flex-1">
            {rightSidebarTab === RIGHT_SIDEBAR_TAB.BATTLE_LOG && <BattleLog />}
            {rightSidebarTab === RIGHT_SIDEBAR_TAB.RULE_EXPLANATION && (
              <RuleExplanation />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
