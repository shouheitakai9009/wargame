import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../states";
import { startBattle, nextTurn, finishBattle } from "../../states/slice";
import { BATTLE_PHASE } from "../../states/battle";
import { Button } from "@/designs/ui/button";

export function Header() {
  const dispatch = useAppDispatch();
  const { phase } = useAppSelector((state) => state.app);

  return (
    <div
      className="absolute w-full z-10 flex items-center justify-between p-4 overflow-hidden border border-white/10"
      style={{
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* リキッドグラスの装飾レイヤー */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
          filter: "blur(40px)",
        }}
      />

      {/* 上部のハイライト */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
        }}
      />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/">← ホームに戻る</Link>
        </Button>
        <h1 className="text-lg font-bold">戦闘画面</h1>
      </div>
      <div className="flex items-center gap-3">
        {phase === BATTLE_PHASE.PREPARATION && (
          <Button onClick={() => dispatch(startBattle())} size="sm">
            バトル開始
          </Button>
        )}

        {phase === BATTLE_PHASE.BATTLE && (
          <Button onClick={() => dispatch(nextTurn())} size="sm">
            次ターン
          </Button>
        )}

        {phase === BATTLE_PHASE.RESULT && (
          <Button
            variant="destructive"
            onClick={() => dispatch(finishBattle())}
            size="sm"
          >
            バトルを終了する
          </Button>
        )}
      </div>
    </div>
  );
}
