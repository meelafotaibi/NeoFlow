"use client";

import { useEffect, useState } from "react";
import { calculateCountdown, type CountdownTime } from "@/lib/countdown";

export function useCountdown(deadline: string): CountdownTime {
  const [countdown, setCountdown] = useState<CountdownTime>(() =>
    calculateCountdown(deadline)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return countdown;
}
