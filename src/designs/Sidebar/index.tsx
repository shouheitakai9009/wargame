import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabButton } from "./TabButton";

type Tab = {
  id: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  side: "left" | "right";
  isOpen: boolean;
  onToggle: () => void;
  width: string; // 例: "w-64" or "w-80"
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
};

export function Sidebar({
  side,
  isOpen,
  onToggle,
  width,
  tabs,
  activeTabId,
  onTabChange,
  children,
}: Props) {
  const isLeft = side === "left";

  // トグルボタンの共通スタイル
  const baseToggleClasses =
    "bg-slate-700 hover:bg-slate-600 text-white p-2 border border-slate-600 transition-all duration-300 z-10";

  // トグルボタンのスタイル(位置とボーダー方向のみ左右で異なる)
  const toggleButtonClasses = isLeft
    ? `absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-0 rounded-r-lg ${baseToggleClasses} ${
        !isOpen ? "translate-x-0" : ""
      }`
    : `absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-0 rounded-l-lg ${baseToggleClasses}`;

  // サイドバー本体のスタイル
  const sidebarClasses = isLeft
    ? `bg-slate-800 border-r border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? `${width} opacity-100` : "w-0 opacity-0 border-r-0"
      }`
    : `bg-slate-800 border-l border-slate-700 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? `${width} opacity-100` : "w-0 opacity-0 border-l-0"
      }`;

  // トグルアイコン
  const ToggleIcon = isLeft
    ? isOpen
      ? ChevronLeft
      : ChevronRight
    : isOpen
    ? ChevronRight
    : ChevronLeft;

  return (
    <div className="relative flex">
      {/* 左サイドバーの場合: サイドバー → トグルボタン */}
      {isLeft && (
        <>
          <aside className={sidebarClasses}>
            <div
              className={`${width} h-full ${
                isLeft
                  ? "overflow-y-auto custom-scrollbar"
                  : "flex flex-col overflow-y-auto custom-scrollbar"
              }`}
            >
              {/* タブヘッダー */}
              <div
                className={`flex border-b border-slate-700 ${
                  !isLeft ? "shrink-0" : ""
                }`}
              >
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    label={tab.label}
                    isActive={activeTabId === tab.id}
                    disabled={tab.disabled}
                    onClick={() => onTabChange(tab.id)}
                  />
                ))}
              </div>

              {/* タブコンテンツ */}
              <div className={`p-4 ${!isLeft ? "flex-1" : ""}`}>{children}</div>
            </div>
          </aside>

          <button
            onClick={onToggle}
            className={toggleButtonClasses}
            aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          >
            <ToggleIcon size={20} />
          </button>
        </>
      )}

      {/* 右サイドバーの場合: トグルボタン → サイドバー */}
      {!isLeft && (
        <>
          <button
            onClick={onToggle}
            className={toggleButtonClasses}
            aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          >
            <ToggleIcon size={20} />
          </button>

          <aside className={sidebarClasses}>
            <div
              className={`${width} h-full flex flex-col overflow-y-auto custom-scrollbar`}
            >
              {/* タブヘッダー */}
              <div className="flex border-b border-slate-700 shrink-0">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    label={tab.label}
                    isActive={activeTabId === tab.id}
                    disabled={tab.disabled}
                    onClick={() => onTabChange(tab.id)}
                  />
                ))}
              </div>

              {/* タブコンテンツ */}
              <div className="p-4 flex-1">{children}</div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
