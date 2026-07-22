"use client";

import { useEffect, useState } from "react";
import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
import { ProgressRing } from "@/components/progress-ring";
import { CountdownDisplay } from "@/components/countdown-display";
import { formatCurrency } from "@/lib/countdown";
import { CurrencySymbol } from "@/components/currency-symbol";
import { CATEGORY_LABELS } from "@/lib/types";
import { SmartFocusEngine } from "@/components/smart-focus-engine";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { PdfPrintExport } from "@/components/pdf-print-export";
import { auth } from "@/lib/firebase";
import {
  Plus,
  Timer,
  CheckSquare,
  Wallet,
  TrendingUp,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged, type User } from "firebase/auth";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name} ☀️`;
  if (hour < 17) return `Good afternoon, ${name} 🌤️`;
  if (hour < 21) return `Good evening, ${name} 🌅`;
  return `Good night, ${name} 🌙`;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { plans, tasks, financialGoals, savedAmount } = useNeoFlow();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  const displayName = firebaseUser?.displayName?.split(" ")[0] || firebaseUser?.email?.split("@")[0] || "there";

  // Get nearest deadline from plans and tasks
  const allDeadlines = [
    ...plans.map((p) => ({ type: "plan" as const, item: p, deadline: new Date(p.deadline) })),
    ...tasks
      .filter((t) => t.status !== "done")
      .map((t) => ({ type: "task" as const, item: t, deadline: new Date(t.deadline) })),
  ].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const nearestDeadline = allDeadlines[0];

  // Calculate stats
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const avgPlanProgress = plans.length > 0
    ? plans.reduce((sum, p) => sum + p.progress, 0) / plans.length
    : 0;

  const totalGoalCost = financialGoals.reduce((sum, g) => sum + g.price, 0);
  const savingsProgress = totalGoalCost > 0 ? (savedAmount / totalGoalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{getGreeting(displayName)}</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your life command center — let&apos;s make today count.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => onNavigate("plans")}
            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
          <Button
            onClick={() => onNavigate("tasks")}
            variant="outline"
            className="border-border/50 hover:bg-muted/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <PdfPrintExport />
        </div>
      </div>

      {/* AI Smart Intelligence Engine */}
      <SmartFocusEngine />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="blue" hover onClick={() => onNavigate("plans")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Plans</p>
              <p className="text-2xl font-bold mt-1">{plans.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-accent" />
            <span>{Math.round(avgPlanProgress)}% avg progress</span>
          </div>
        </GlassCard>

        <GlassCard glow="purple" hover onClick={() => onNavigate("tasks")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks</p>
              <p className="text-2xl font-bold mt-1">{completedTasks}/{totalTasks}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-accent" />
            <span>{Math.round(taskCompletionRate)}% completion rate</span>
          </div>
        </GlassCard>

        <GlassCard glow="cyan" hover onClick={() => onNavigate("finance")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(savedAmount)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3 w-3 text-accent" />
            <span>{financialGoals.length} goals tracked</span>
          </div>
        </GlassCard>

        <GlassCard hover onClick={() => onNavigate("analytics")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Goal Progress</p>
              <p className="text-2xl font-bold mt-1">{Math.round(savingsProgress)}%</p>
            </div>
            <ProgressRing progress={savingsProgress} size={48} strokeWidth={4} color="green" showLabel={false} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <CurrencySymbol className="h-[0.85em] mr-1" />
              {formatCurrency(totalGoalCost - savedAmount)}&nbsp;remaining
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Studio Pomodoro */}
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>

        {/* Nearest Deadline */}
        <GlassCard className="lg:col-span-2" glow="blue">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Nearest Target Deadline</h2>
          </div>
          
          {nearestDeadline ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xl font-bold text-foreground">
                  {nearestDeadline.type === "plan" 
                    ? nearestDeadline.item.title 
                    : nearestDeadline.item.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    nearestDeadline.type === "plan" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary/20 text-secondary"
                  }`}>
                    {nearestDeadline.type === "plan" 
                      ? CATEGORY_LABELS[(nearestDeadline.item as typeof plans[0]).category]
                      : "Task"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Due: {nearestDeadline.deadline.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <CountdownDisplay 
                  deadline={nearestDeadline.deadline.toISOString()} 
                  size="lg" 
                />
                <p className="text-xs text-muted-foreground mt-2">Time Remaining</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming deadlines</p>
              <Button
                onClick={() => onNavigate("plans")}
                className="mt-4 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create a Plan
              </Button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Plans */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Plans</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("plans")}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {plans.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                className="glass rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{plan.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[plan.category]}
                  </p>
                </div>
                <ProgressRing
                  progress={plan.progress}
                  size={40}
                  strokeWidth={3}
                  showLabel={false}
                  color="blue"
                />
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No plans yet. Create your first plan!
              </p>
            )}
          </div>
        </GlassCard>

        {/* Recent Tasks */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("tasks")}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="glass rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {task.status.replace("-", " ")} - {task.priority} priority
                  </p>
                </div>
                <CountdownDisplay deadline={task.deadline} size="sm" showSeconds={false} />
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No tasks yet. Add your first task!
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
