import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../states";
import { startBattle, nextTurn, finishBattle } from "../../states/slice";
import { BATTLE_PHASE } from "../../states/battle";

export function Header() {
  const dispatch = useAppDispatch();
  const { phase, turn } = useAppSelector((state) => state.app);

  return (
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
        {phase === BATTLE_PHASE.PREPARATION && (
          <button
            onClick={() => dispatch(startBattle())}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            バトル開始
          </button>
        )}

        {phase === BATTLE_PHASE.BATTLE && (
          <>
            <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded border border-green-600/30">
              ターン: {turn}
            </div>
            <button
              onClick={() => dispatch(nextTurn())}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              次ターン
            </button>
          </>
        )}

        {phase === BATTLE_PHASE.RESULT && (
          <button
            onClick={() => dispatch(finishBattle())}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            バトルを終了する
          </button>
        )}
      </div>
    </div>
  );
}
