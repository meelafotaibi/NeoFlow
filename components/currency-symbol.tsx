"use client";

import { cn } from "@/lib/utils";

interface CurrencySymbolProps {
  className?: string;
}

export function CurrencySymbol({ className }: CurrencySymbolProps) {
  return (
    <img
      src="/currency-symbol.png"
      alt="Currency"
      className={cn(
        "inline-block h-[0.85em] w-auto align-middle mr-1 select-none dark:invert",
        className
      )}
      style={{ verticalAlign: "middle", marginTop: "-0.1em" }}
    />
  );
}
