import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/designs/ui/card";
import { Swords, ShieldCheck, Crosshair, Zap } from "lucide-react";
import type { SoldierType } from "@/states/soldier";
import { useDrag } from "@react-aria/dnd";
import { useAppDispatch } from "@/states";
import { beginTroopDrag, endTroopDrag } from "@/states/slice";

type Props = {
  type: SoldierType;
  name: string;
  icon: LucideIcon;
  stats: {
    attack: number;
    defense: number;
    range: number;
    speed: number;
  };
  theme: {
    primary: string;
    secondary: string;
  };
};

export function TroopCard({ type, name, icon: Icon, stats, theme }: Props) {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { dragProps, isDragging } = useDrag({
    getItems: () => [
      {
        "application/json": JSON.stringify({ type, theme }),
      },
    ],
    onDragStart: () => {
      dispatch(beginTroopDrag());
    },
    onDragEnd: () => {
      dispatch(endTroopDrag());
    },
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Ensure drag state is set immediately for visual feedback
    dispatch(beginTroopDrag());
    dragProps.onDragStart?.(e);
    if (previewRef.current) {
      e.dataTransfer.setDragImage(previewRef.current, 20, 20);
    }
  };

  const renderDots = (value: number, isHovered: boolean = false) => {
    const max = 5;
    const dots = [];
    for (let i = 0; i < max; i++) {
      dots.push(
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            i < value
              ? isHovered
                ? "bg-white scale-125"
                : "bg-white/90"
              : "bg-white/20"
          }`}
          style={{
            boxShadow:
              i < value && isHovered ? `0 0 8px ${theme.primary}` : "none",
            animationDelay: `${i * 50}ms`,
          }}
        />
      );
    }
    return <div className="flex gap-1">{dots}</div>;
  };

  return (
    <>
      <div
        ref={previewRef}
        className="absolute -top-[1000px] -left-[1000px] w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-50"
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <Icon size={24} className="text-white" />
      </div>

      <div
        ref={ref}
        {...dragProps}
        onDragStart={handleDragStart}
        className={isDragging ? "opacity-50" : ""}
      >
        <Card
          className="group relative overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            boxShadow: `0 4px 20px ${theme.primary}40, 0 0 0 1px ${theme.primary}20`,
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `
              0 0 60px 8px ${theme.primary}90,
              0 0 40px 4px ${theme.primary}70,
              0 12px 48px ${theme.primary}80,
              0 0 0 3px ${theme.primary}60,
              inset 0 0 20px ${theme.primary}30
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 20px ${theme.primary}40, 0 0 0 1px ${theme.primary}20`;
          }}
        >
          {/* Animated background glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${theme.secondary}40, transparent 70%)`,
            }}
          />

          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6), transparent)`,
                filter: "blur(8px)",
              }}
            />
          </div>

          <CardHeader className="relative p-4 pb-2">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/30"
                style={{
                  boxShadow: `0 4px 12px ${theme.primary}60`,
                }}
              >
                <Icon size={28} className="text-white drop-shadow-lg" />
              </div>
              <CardTitle className="text-lg font-bold text-white drop-shadow-md">
                {name}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="relative p-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Attack */}
              <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div className="flex items-center gap-1.5">
                  <Swords
                    size={14}
                    className="text-white/90 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                    攻撃
                  </span>
                </div>
                {renderDots(stats.attack)}
              </div>

              {/* Defense */}
              <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                    className="text-white/90 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                    防御
                  </span>
                </div>
                {renderDots(stats.defense)}
              </div>

              {/* Range */}
              <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div className="flex items-center gap-1.5">
                  <Crosshair
                    size={14}
                    className="text-white/90 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                    射程
                  </span>
                </div>
                {renderDots(stats.range)}
              </div>

              {/* Speed */}
              <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105">
                <div className="flex items-center gap-1.5">
                  <Zap
                    size={14}
                    className="text-white/90 transition-transform duration-300 group-hover:rotate-12"
                  />
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                    速度
                  </span>
                </div>
                {renderDots(stats.speed)}
              </div>
            </div>
          </CardContent>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.secondary}, transparent)`,
            }}
          />
        </Card>
      </div>
    </>
  );
}
