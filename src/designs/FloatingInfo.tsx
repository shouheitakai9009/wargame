import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

type Position = "bottom" | "top" | "left" | "right";

type Props = {
  children: ReactNode;
  position?: Position;
  className?: string;
};

const positionStyles: Record<Position, string> = {
  bottom: "bottom-8 left-1/2 -translate-x-1/2",
  top: "top-8 left-1/2 -translate-x-1/2",
  left: "left-8 top-1/2 -translate-y-1/2",
  right: "right-8 top-1/2 -translate-y-1/2",
};

export function FloatingInfo({
  children,
  position = "bottom",
  className = "",
}: Props) {
  return (
    <Card
      className={`fixed ${positionStyles[position]} z-10 shadow-lg ${className}`}
    >
      {children}
    </Card>
  );
}
