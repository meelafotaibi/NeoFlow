"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { getUrgencyLevel } from "@/lib/countdown";
import { cn } from "@/lib/utils";

interface CountdownDisplayProps {
  deadline: string;
  size?: "sm" | "md" | "lg";
  showSeconds?: boolean;
  className?: string;
}

export function CountdownDisplay({
  deadline,
  size = "md",
  showSeconds = true,
  className,
}: CountdownDisplayProps) {
  const countdown = useCountdown(deadline);
  const urgency = getUrgencyLevel(countdown);

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-2",
    lg: "text-lg gap-3",
  };

  const unitSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const urgencyClasses = {
    critical: "text-destructive animate-pulse-glow",
    warning: "text-accent",
    normal: "text-foreground",
  };

  if (countdown.isExpired) {
    return (
      <span className={cn("text-destructive font-semibold", className)}>
        Expired
      </span>
    );
  }

  return (
    <div className={cn("flex items-center font-mono", sizeClasses[size], urgencyClasses[urgency], className)}>
      <TimeUnit value={countdown.days} unit="d" size={unitSizes[size]} />
      <TimeUnit value={countdown.hours} unit="h" size={unitSizes[size]} />
      <TimeUnit value={countdown.minutes} unit="m" size={unitSizes[size]} />
      {showSeconds && <TimeUnit value={countdown.seconds} unit="s" size={unitSizes[size]} />}
    </div>
  );
}

function TimeUnit({ value, unit, size }: { value: number; unit: string; size: string }) {
  return (
    <div className="flex items-baseline">
      <span className="font-bold tabular-nums">{value.toString().padStart(2, "0")}</span>
      <span className={cn("text-muted-foreground ml-0.5", size)}>{unit}</span>
    </div>
  );
}
