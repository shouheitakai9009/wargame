import { Link } from "react-router-dom";

export default function BattlePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              ← ホームに戻る
            </Link>
            <h1 className="text-2xl font-bold">戦闘画面</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded border border-green-600/30">
              ターン: 1
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              次のターン
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Army Info */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">軍隊情報</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-600/20 border border-blue-600/30 rounded">
              <h3 className="font-semibold text-blue-400">第一軍団</h3>
              <div className="mt-2 text-sm text-slate-300">
                <div>兵力: 1000</div>
                <div>士気: 85%</div>
              </div>
            </div>
            <div className="p-3 bg-red-600/20 border border-red-600/30 rounded">
              <h3 className="font-semibold text-red-400">敵軍</h3>
              <div className="mt-2 text-sm text-slate-300">
                <div>兵力: 800</div>
                <div>士気: 70%</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Battle Area */}
        <main className="flex-1 p-6">
          <div className="h-full bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-semibold mb-2">戦場マップ</h2>
              <p className="text-slate-400">ここに戦場のマップが表示されます</p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Battle Log */}
        <aside className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">戦闘ログ</h2>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-slate-400">ターン 1:</span> 戦闘開始
            </div>
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-blue-400">第一軍団</span> が配置されました
            </div>
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-red-400">敵軍</span> が配置されました
            </div>
            <div className="p-2 bg-green-600/20 border border-green-600/30 rounded">
              準備完了 - 戦闘を開始できます
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
