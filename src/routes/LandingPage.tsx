import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          War Game Simulator
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          戦略的な戦闘シミュレーションゲーム
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/battle"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            戦闘開始
          </Link>
          <button className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg transition-colors duration-200">
            ルール説明
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-800/50 rounded-lg backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">⚔️ 戦略的戦闘</h3>
            <p className="text-slate-400">
              地形や部隊の特性を活かした戦略的な戦闘を楽しめます
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-lg backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">🗺️ 多様な地形</h3>
            <p className="text-slate-400">
              森林、山岳、水域など様々な地形が戦況に影響します
            </p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-lg backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">🎯 リアルタイム</h3>
            <p className="text-slate-400">
              リアルタイムで展開する戦闘をコントロールしましょう
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
