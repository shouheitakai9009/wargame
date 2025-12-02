import { Layout, LayoutHeader, LayoutBody, LayoutMain } from "../designs/Layout";
import { Header } from "../widgets/Header";
import { Aside } from "../widgets/Aside";
import { RightSidebar } from "../widgets/RightSidebar";
import { BattleMap } from "../widgets/Map";

export default function BattlePage() {
  return (
    <Layout>
      <LayoutHeader>
        <Header />
      </LayoutHeader>

      <LayoutBody>
        <Aside />

        <LayoutMain>
          <div className="h-full bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <BattleMap />
          </div>
        </LayoutMain>

        <RightSidebar />
      </LayoutBody>
    </Layout>
  );
}
