import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/states";
import { removeAttackEffect } from "@/states/modules/combat";
import { TILE_SIZE } from "@/states/map";

/**
 * 攻撃エフェクトコンポーネント
 * マップ上に攻撃の視覚効果を表示
 */
export function AttackEffects() {
  const activeEffects = useAppSelector((state) => state.combat.activeEffects);
  const dispatch = useAppDispatch();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {activeEffects.map((effect) => (
        <AttackEffect
          key={effect.id}
          effect={effect}
          onComplete={() => dispatch(removeAttackEffect({ id: effect.id }))}
        />
      ))}
    </div>
  );
}

type AttackEffectProps = {
  effect: {
    id: string;
    attackerX: number;
    attackerY: number;
    defenderX: number;
    defenderY: number;
    damage: number;
    timestamp: number;
  };
  onComplete: () => void;
};

function AttackEffect({ effect, onComplete }: AttackEffectProps) {
  const { defenderX, defenderY, damage } = effect;

  // エフェクトの位置計算（ピクセル座標）
  const defenderPx = defenderX * TILE_SIZE + TILE_SIZE / 2;
  const defenderPy = defenderY * TILE_SIZE + TILE_SIZE / 2;

  // 1.5秒後にエフェクトを削除
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {/* ヒットエフェクト（波紋） */}
      <HitEffect x={defenderPx} y={defenderPy} />

      {/* ダメージ数値ポップアップ */}
      <DamagePopup x={defenderPx} y={defenderPy} damage={damage} />
    </>
  );
}

/**
 * ヒットエフェクト（波紋）
 */
function HitEffect({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute animate-hit-ripple"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="w-16 h-16 rounded-full border-4 border-red-500 opacity-80" />
    </div>
  );
}

/**
 * ダメージ数値ポップアップ
 */
function DamagePopup({ x, y, damage }: { x: number; y: number; damage: number }) {
  return (
    <div
      className="absolute animate-damage-popup font-bold text-2xl pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y - 20}px`,
        transform: "translate(-50%, -50%)",
        color: "#ff4444",
        textShadow: "0 0 8px rgba(0,0,0,0.8), 0 0 4px rgba(255,68,68,0.8)",
      }}
    >
      -{damage}
    </div>
  );
}

