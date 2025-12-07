import { useEffect } from "react";
import { Layout, LayoutBody, LayoutMain } from "../designs/Layout";
import { Header } from "../widgets/Header";
import { Aside } from "../widgets/Aside";
import { RightSidebar } from "../widgets/RightSidebar";
import { Map as BattleMap } from "../widgets/Map";
import { BattleAnnouncement } from "../widgets/BattleAnnouncement";
import { GlobalContextMenu } from "../widgets/GlobalContextMenu";
import { useAppDispatch, resetState } from "../states";

export default function BattlePage() {
  const dispatch = useAppDispatch();

  // ページアクセス時にステートをリセット
  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  return (
    <Layout>
      <LayoutBody>
        <Aside />

        <LayoutMain>
          <div className="relative h-full flex flex-col bg-slate-800/50 border border-slate-700 overflow-hidden">
            {/* ヘッダー */}
            <Header />

            {/* マップ */}
            <div className="flex-1 overflow-hidden">
              <BattleMap />
            </div>
          </div>
        </LayoutMain>

        <RightSidebar />
      </LayoutBody>

      {/* バトルアナウンス */}
      <BattleAnnouncement />

      {/* グローバルコンテキストメニュー */}
      <GlobalContextMenu />
    </Layout>
  );
}
