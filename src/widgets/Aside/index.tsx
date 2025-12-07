import { useAppDispatch, useAppSelector } from "@/states";
import { toggleLeftSidebar, switchPreparationTab } from "@/states/modules/ui";
import { BATTLE_PHASE, PREPARATION_TAB } from "@/states/battle";
import { SoldierPlacement } from "./SoldierPlacement";
import { ArmyPlacement } from "./ArmyPlacement";
import { Sidebar } from "@/designs/Sidebar";

export function Aside() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isLeftSidebarOpen);
  const activeTab = useAppSelector((state) => state.ui.preparationTab);
  const phase = useAppSelector((state) => state.battle.phase);

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
      isOpen={isOpen}
      onToggle={() => dispatch(toggleLeftSidebar())}
      width="w-64"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(tabId) =>
        dispatch(
          switchPreparationTab(
            tabId as (typeof PREPARATION_TAB)[keyof typeof PREPARATION_TAB]
          )
        )
      }
    >
      {activeTab === PREPARATION_TAB.DEPLOY_SOLDIER &&
        !isSoldierTabDisabled && <SoldierPlacement />}
      {(activeTab === PREPARATION_TAB.FORM_ARMY || isSoldierTabDisabled) && (
        <ArmyPlacement />
      )}
    </Sidebar>
  );
}
