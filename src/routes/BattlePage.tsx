import { useEffect } from "react";
import { Layout, LayoutBody, LayoutMain } from "../designs/Layout";
import { Header } from "../widgets/Header";
import { Aside } from "../widgets/Aside";
import { RightSidebar } from "../widgets/RightSidebar";
import { BattleMap } from "../widgets/Map";
import { BattleAnnouncement } from "../widgets/BattleAnnouncement";
import { useAppDispatch } from "../states";
import { resetState } from "../states/slice";

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
    </Layout>
  );
}
