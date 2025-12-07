import { useAppSelector, useAppDispatch } from "../../states";
import { switchRightSidebarTab, toggleRightSidebar } from "@/states/modules/ui";
import { RIGHT_SIDEBAR_TAB } from "../../states/battle";
import { BattleLog } from "../BattleLog";
import { RuleExplanation } from "../RuleExplanation";
import { Sidebar } from "../../designs/Sidebar";

export function RightSidebar() {
  const dispatch = useAppDispatch();
  const { rightSidebarTab, isRightSidebarOpen } = useAppSelector(
    (state) => state.ui
  );

  const tabs = [
    { id: RIGHT_SIDEBAR_TAB.BATTLE_LOG, label: "戦闘ログ" },
    { id: RIGHT_SIDEBAR_TAB.RULE_EXPLANATION, label: "ルール解説" },
  ];

  return (
    <Sidebar
      side="right"
      isOpen={isRightSidebarOpen}
      onToggle={() => dispatch(toggleRightSidebar())}
      width="w-80"
      tabs={tabs}
      activeTabId={rightSidebarTab}
      onTabChange={(tabId) =>
        dispatch(
          switchRightSidebarTab(
            tabId as (typeof RIGHT_SIDEBAR_TAB)[keyof typeof RIGHT_SIDEBAR_TAB]
          )
        )
      }
    >
      {rightSidebarTab === RIGHT_SIDEBAR_TAB.BATTLE_LOG && <BattleLog />}
      {rightSidebarTab === RIGHT_SIDEBAR_TAB.RULE_EXPLANATION && (
        <RuleExplanation />
      )}
    </Sidebar>
  );
}
