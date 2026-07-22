"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useNeoFlow } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { TrendingUp, Sparkles, Calendar, CheckCircle2, DollarSign, Clock, Cpu } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { cppEngine } from "@/lib/cpp-engine-adapter";

type TimeHorizon = "daily" | "weekly" | "monthly";

export function SavingsSimulator() {
  const { financialGoals, savedAmount, updateSavedAmount } = useNeoFlow();
  const [horizon, setHorizon] = useState<TimeHorizon>("monthly");
  const [periodSavings, setPeriodSavings] = useState<number>(1500);

  const activeGoals = financialGoals.filter((g) => !g.isPurchased);
  const totalCost = activeGoals.reduce((sum, g) => sum + g.price, 0);

  // Convert contribution to daily equivalent for precise day/week/month math
  const dailyContribution =
    horizon === "daily"
      ? periodSavings
      : horizon === "weekly"
      ? periodSavings / 7
      : periodSavings / 30.4375;

  // Generate 9-period forecast curve using C++ Engine Adapter
  const forecastData = Array.from({ length: 9 }).map((_, periodIndex) => {
    const label =
      horizon === "daily"
        ? periodIndex === 0
          ? "Today"
          : `Day ${periodIndex * 5}`
        : horizon === "weekly"
        ? periodIndex === 0
          ? "Today"
          : `Wk ${periodIndex}`
        : periodIndex === 0
        ? "Today"
        : `Mo ${periodIndex}`;

    const stepMultiplier = horizon === "daily" ? 5 : 1;
    const currentProjected = savedAmount + periodIndex * periodSavings * stepMultiplier;

    return {
      period: label,
      saved: currentProjected,
      target: totalCost,
    };
  });

  // Calculate detailed goal unlock timeline via C++ Engine
  let runningSavings = savedAmount;
  const sortedGoals = [...activeGoals].sort((a, b) => a.price - b.price);
  const goalTimeline = sortedGoals.map((goal) => {
    const projection = cppEngine.calculateGoalProjection({
      currentSavings: runningSavings,
      periodContribution: dailyContribution,
      goalCost: goal.price,
      timeHorizon: horizon,
    });

    if (projection.isAffordable) {
      runningSavings -= goal.price;
    }

    return {
      goal,
      daysNeeded: projection.daysNeeded,
      weeksNeeded: projection.weeksNeeded,
      monthsNeeded: projection.monthsNeeded,
      isAlreadyAffordable: projection.isAffordable,
      executionTimeMs: projection.executionTimeMs,
    };
  });

  const handleSetQuickBalance = (amount: number) => {
    updateSavedAmount(amount);
  };

  return (
    <GlassCard glow="cyan" className="relative overflow-hidden border border-accent/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center glow-cyan">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-1.5 text-base">
              Savings Forecast & Power Simulator
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Cpu className="h-3 w-3 text-accent" />
              Powered by C++ Analytics Engine (sub-millisecond calculation)
            </p>
          </div>
        </div>

        {/* Quick Balance Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground font-medium">Quick Wallet Test:</span>
          <button
            onClick={() => handleSetQuickBalance(10000)}
            className="px-2 py-1 rounded bg-accent/10 hover:bg-accent/20 text-accent text-[11px] border border-accent/20 font-mono font-medium transition-all"
          >
            $10k
          </button>
          <button
            onClick={() => handleSetQuickBalance(100000)}
            className="px-2 py-1 rounded bg-accent/20 hover:bg-accent/30 text-accent text-[11px] border border-accent/40 font-mono font-bold transition-all glow-cyan"
          >
            $100k
          </button>
        </div>
      </div>

      {/* Control Panel: Time Horizon & Contribution */}
      <div className="glass rounded-xl p-4 mb-4 border border-border/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border/40">
            <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1.5" />
            {(["daily", "weekly", "monthly"] as TimeHorizon[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all",
                  horizon === h
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Amount Display & Input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Saving Rate:</span>
            <div className="relative w-36">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="number"
                value={periodSavings}
                onChange={(e) => setPeriodSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                className="pl-7 bg-muted/60 border-border/50 text-xs font-bold text-accent h-8"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">/{horizon.slice(0, 2)}</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>$50</span>
            <span>$1,000</span>
            <span>$2,500</span>
            <span>$5,000</span>
            <span>$10,000+</span>
          </div>
          <Slider
            value={[Math.min(10000, periodSavings)]}
            onValueChange={(v) => setPeriodSavings(v[0])}
            min={50}
            max={10000}
            step={50}
            className="py-1"
          />
        </div>
      </div>

      {/* Projection Area Chart */}
      <div className="h-48 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(34, 211, 238, 0.3)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#F8FAFC",
              }}
              formatter={(val: unknown) => [
                `$${Number(val).toLocaleString()}`,
                "Forecasted Balance",
              ]}
            />
            <Area
              type="monotone"
              dataKey="saved"
              stroke="#22D3EE"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#savingsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Unlock Timeline Predictions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-accent" />
            Goal Unlock Forecast:
          </p>
          <span className="text-[11px] text-muted-foreground font-mono">
            Wallet Balance: ${savedAmount.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {goalTimeline.map(({ goal, daysNeeded, weeksNeeded, monthsNeeded, isAlreadyAffordable }) => (
            <div
              key={goal.id}
              className={cn(
                "glass p-3 rounded-xl flex items-center justify-between border transition-all text-xs",
                isAlreadyAffordable
                  ? "border-green-500/40 bg-green-500/10"
                  : "border-border/40 hover:border-accent/50"
              )}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  {isAlreadyAffordable ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-accent shrink-0" />
                  )}
                  <span className="font-bold truncate text-foreground">{goal.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  Cost: ${goal.price.toLocaleString()}
                </p>
              </div>

              <div className="text-right shrink-0">
                {isAlreadyAffordable ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                    Ready to Buy
                  </span>
                ) : (
                  <div>
                    <span className="font-bold text-accent text-xs block font-mono">
                      ~{daysNeeded} days
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      ({weeksNeeded} wks / {monthsNeeded} mos)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
