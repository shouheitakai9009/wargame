import { useAppSelector, useAppDispatch } from "../../states";
import { switchRightSidebarTab } from "../../states/slice";
import { RIGHT_SIDEBAR_TAB } from "../../states/battle";
import { BattleLog } from "../BattleLog";
import { RuleExplanation } from "../RuleExplanation";

export function RightSidebar() {
  const dispatch = useAppDispatch();
  const { rightSidebarTab } = useAppSelector((state) => state.app);

  return (
    <aside className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto custom-scrollbar">
      {/* タブヘッダー */}
      <div className="flex border-b border-slate-700">
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
            dispatch(switchRightSidebarTab(RIGHT_SIDEBAR_TAB.RULE_EXPLANATION))
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
      <div className="p-4">
        {rightSidebarTab === RIGHT_SIDEBAR_TAB.BATTLE_LOG && <BattleLog />}
        {rightSidebarTab === RIGHT_SIDEBAR_TAB.RULE_EXPLANATION && (
          <RuleExplanation />
        )}
      </div>
    </aside>
  );
}
