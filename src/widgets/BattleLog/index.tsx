import { useAppSelector } from "../../states";
import { BATTLE_PHASE } from "../../states/battle";

export function BattleLog() {
  const { phase, turn } = useAppSelector((state) => state.battle);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">戦闘ログ</h2>
      <div className="space-y-2 text-sm">
        <div className="p-2 bg-slate-700/50 rounded">
          <span className="text-slate-400">フェーズ:</span>{" "}
          {phase === BATTLE_PHASE.PREPARATION && "準備中"}
          {phase === BATTLE_PHASE.BATTLE && "バトル中"}
          {phase === BATTLE_PHASE.RESULT && "結果"}
        </div>
        {phase === BATTLE_PHASE.BATTLE && (
          <div className="p-2 bg-green-600/20 border border-green-600/30 rounded">
            現在ターン: {turn}
          </div>
        )}
      </div>
    </div>
  );
}
