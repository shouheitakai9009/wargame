import {
  startBattle,
  finishBattle,
  endPlayerPhase,
  endEnemyPhase,
  endBattle,
} from "@/states/modules/battle";
import { showError } from "@/states/modules/ui";
import { useAppDispatch, useAppSelector } from "@/states";
import { BATTLE_PHASE, TURN_PHASE } from "@/states/battle";
import { Button } from "@/designs/ui/button";
import { recalculateAllVisionsThunk } from "@/states/modules/visibility";
import { useMemo } from "react";

export function Header() {
  const phase = useAppSelector((state) => state.battle.phase);
  const turn = useAppSelector((state) => state.battle.turn);
  const turnPhase = useAppSelector((state) => state.battle.turnPhase);
  const playerTroops = useAppSelector((state) => state.army.playerTroops);
  const armies = useAppSelector((state) => state.army.armies);
  const dispatch = useAppDispatch();

  const handleStartBattle = () => {
    // バリデーション: 全ての兵が軍に所属しているかチェック
    const unassignedTroop = playerTroops.find(
      (troop) =>
        !armies.some((army) =>
          army.positions.some((pos) => pos.x === troop.x && pos.y === troop.y)
        )
    );

    if (unassignedTroop) {
      dispatch(showError("全ての兵を軍に所属させてください"));
      return;
    }

    if (armies.length === 0) {
      dispatch(showError("軍を作成してください"));
      return;
    }

    dispatch(startBattle());
    // バトル開始時に全兵の視界を初期化
    dispatch(recalculateAllVisionsThunk());
  };

  const phaseLabel = useMemo(() => {
    if (turnPhase === TURN_PHASE.PLAYER) {
      return (
        <span className="bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full text-sm font-bold border border-blue-700 animate-pulse">
          自軍フェーズ
        </span>
      );
    } else {
      return (
        <span className="bg-red-900/50 text-red-200 px-3 py-1 rounded-full text-sm font-bold border border-red-700">
          敵軍フェーズ
        </span>
      );
    }
  }, [turnPhase]);

  const handleTurnAction = () => {
    if (turnPhase === TURN_PHASE.PLAYER) {
      dispatch(endPlayerPhase());
    } else {
      // AI実装までは手動で進める
      dispatch(endEnemyPhase());
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-slate-900 border-slate-800">
      <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        War Simulator
      </h1>

      <div className="flex items-center gap-4">
        {phase === BATTLE_PHASE.PREPARATION && (
          <Button
            onClick={handleStartBattle}
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 font-bold px-8 shadow-lg shadow-blue-900/20"
          >
            開戦
          </Button>
        )}

        {phase === BATTLE_PHASE.BATTLE && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-4">
              {phaseLabel}
              <div className="text-lg font-bold text-slate-200">
                Turn <span className="text-cyan-400 text-2xl ml-1">{turn}</span>
              </div>
            </div>
            <Button
              onClick={handleTurnAction}
              variant={
                turnPhase === TURN_PHASE.PLAYER ? "default" : "secondary"
              }
              className={`${
                turnPhase === TURN_PHASE.PLAYER
                  ? "bg-blue-700 hover:bg-blue-600 border-blue-600"
                  : "bg-red-900/30 text-red-200 hover:bg-red-900/50 border-red-800"
              } border`}
            >
              {turnPhase === TURN_PHASE.PLAYER
                ? "フェーズ終了"
                : "敵ターン終了(Debug)"}
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
