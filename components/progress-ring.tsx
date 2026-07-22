"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  color?: "blue" | "purple" | "cyan" | "green";
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  className,
  showLabel = true,
  color = "blue",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    blue: "stroke-primary",
    purple: "stroke-secondary",
    cyan: "stroke-accent",
    green: "stroke-chart-4",
  };

  const glowColors = {
    blue: "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    purple: "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    cyan: "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    green: "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className={cn("-rotate-90", glowColors[color])}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(colorClasses[color], "transition-all duration-500 ease-out")}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
