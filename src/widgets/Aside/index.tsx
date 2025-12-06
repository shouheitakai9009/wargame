import { useAppSelector, useAppDispatch } from "../../states";
import { switchPreparationTab, toggleLeftSidebar } from "../../states/slice";
import { BATTLE_PHASE, PREPARATION_TAB } from "../../states/battle";
import { SoldierPlacement } from "./SoldierPlacement";
import { ArmyPlacement } from "./ArmyPlacement";
import { Sidebar } from "../../designs/Sidebar";

export function Aside() {
  const dispatch = useAppDispatch();
  const { phase, preparationTab, isLeftSidebarOpen } = useAppSelector(
    (state) => state.app
  );

  // バトル中は兵配置タブをdisabled
  const isSoldierTabDisabled = phase === BATTLE_PHASE.BATTLE;

  const tabs = [
    {
      id: PREPARATION_TAB.DEPLOY_SOLDIER,
      label: "兵配置",
      disabled: isSoldierTabDisabled,
    },
    { id: PREPARATION_TAB.FORM_ARMY, label: "軍編成" },
  ];

  return (
    <Sidebar
      side="left"
      isOpen={isLeftSidebarOpen}
      onToggle={() => dispatch(toggleLeftSidebar())}
      width="w-64"
      tabs={tabs}
      activeTabId={preparationTab}
      onTabChange={(tabId) =>
        dispatch(
          switchPreparationTab(
            tabId as (typeof PREPARATION_TAB)[keyof typeof PREPARATION_TAB]
          )
        )
      }
    >
      {preparationTab === PREPARATION_TAB.DEPLOY_SOLDIER &&
        !isSoldierTabDisabled && <SoldierPlacement />}
      {(preparationTab === PREPARATION_TAB.FORM_ARMY ||
        isSoldierTabDisabled) && <ArmyPlacement />}
    </Sidebar>
  );
}
