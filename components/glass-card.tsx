"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "blue" | "purple" | "cyan" | "none";
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = false,
  onClick,
}: GlassCardProps) {
  const glowClasses = {
    blue: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    cyan: "hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
    none: "",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-300",
        hover && "cursor-pointer hover:scale-[1.02] hover:border-primary/30",
        glow !== "none" && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
