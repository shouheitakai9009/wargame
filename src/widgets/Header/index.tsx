import {
  startBattle,
  finishBattle,
  nextTurn,
  endBattle,
} from "@/states/modules/battle";
import { useAppDispatch, useAppSelector } from "@/states";
import { BATTLE_PHASE } from "@/states/battle";
import { Button } from "@/designs/ui/button";

export function Header() {
  const phase = useAppSelector((state) => state.battle.phase);
  const turn = useAppSelector((state) => state.battle.turn);
  const dispatch = useAppDispatch();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-slate-900 border-slate-800">
      <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        War Simulator
      </h1>

      <div className="flex items-center gap-4">
        {phase === BATTLE_PHASE.PREPARATION && (
          <Button
            onClick={() => dispatch(startBattle())}
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 font-bold px-8 shadow-lg shadow-blue-900/20"
          >
            開戦
          </Button>
        )}

        {phase === BATTLE_PHASE.BATTLE && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-slate-200">
              Turn <span className="text-cyan-400 text-2xl ml-1">{turn}</span>
            </div>
            <Button
              onClick={() => dispatch(nextTurn())}
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              ターン終了
            </Button>
            <Button
              onClick={() => dispatch(endBattle())}
              variant="destructive"
              className="bg-red-900/50 hover:bg-red-900 border-red-900"
            >
              撤退
            </Button>
          </div>
        )}

        {phase === BATTLE_PHASE.RESULT && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-yellow-400">バトル終了</div>
            <Button onClick={() => dispatch(finishBattle())} variant="default">
              準備画面へ
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
