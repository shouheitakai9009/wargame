import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../states";
import { startBattle, nextTurn, finishBattle } from "../../states/slice";
import { BATTLE_PHASE } from "../../states/battle";
import { Button } from "@/designs/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/designs/ui/button-group";

export function Header() {
  const dispatch = useAppDispatch();
  const { phase, turn } = useAppSelector((state) => state.app);

  return (
    <div className="flex items-center justify-between">
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
          <ButtonGroup>
            <ButtonGroupText>ターン: {turn}</ButtonGroupText>
            <Button onClick={() => dispatch(nextTurn())} size="sm">
              次ターン
            </Button>
          </ButtonGroup>
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
