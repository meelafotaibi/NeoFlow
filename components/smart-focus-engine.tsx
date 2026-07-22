"use client";

import { useState, useMemo } from "react";
import { useNeoFlow } from "@/lib/store";
import { fetchGeminiAiAdvice, type AiStrategyResponse } from "@/lib/gemini-ai";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  Lightbulb,
  Send,
  Bot,
  ArrowRight,
  ShieldCheck,
  Check,
  Cpu,
  Building2,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cppEngine } from "@/lib/cpp-engine-adapter";

type InsightCategory = "overview" | "priority" | "streaks" | "tips";

export function SmartFocusEngine() {
  const { plans, tasks, financialGoals, savedAmount, transactions, addPlan, addTask, addFinancialGoal } = useNeoFlow();
  const [activeTab, setActiveTab] = useState<InsightCategory>("overview");
  const [userQuery, setUserQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [customResponse, setCustomResponse] = useState<AiStrategyResponse | null>(null);
  const [autoCreatedItems, setAutoCreatedItems] = useState<string[]>([]);

  const triggerAudioFeedback = () => {
    if (typeof window !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880.0, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {}
    }
  };

  // Calculate Real-time Productivity Index using C++ Engine Optimization
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    
    const focusStats = cppEngine.computeFocusStats(completedTasks * 25, 10, 0);

    const totalPlans = plans.length;
    const avgProgress = totalPlans > 0 ? plans.reduce((acc, p) => acc + p.progress, 0) / totalPlans : 50;
    const planPoints = (avgProgress / 100) * 30;

    const totalCheckins = plans.reduce((acc, p) => {
      const active = Object.values(p.dailyCheckins || {}).filter((v) => v === true).length;
      return acc + active;
    }, 0);
    const streakPoints = Math.min(20, totalCheckins * 4);

    const productivityIndex = Math.min(100, Math.round((focusStats.focusEfficiencyScore * 0.5) + planPoints + streakPoints));

    const prioritizedTasksList = cppEngine.prioritizeTasks(
      tasks.map((t) => ({
        id: t.id,
        priority: t.priority,
        isCompleted: t.status === "done",
        estimatedMinutes: 30,
        daysUntilDue: Math.max(0, Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000)),
      }))
    );

    const topPrioritizedId = prioritizedTasksList[0]?.id;
    const topUrgentTask = tasks.find((t) => t.id === topPrioritizedId) || tasks.find((t) => t.status !== "done");

    const today = new Date().toISOString().split("T")[0];
    const tasksDueToday = tasks.filter((t) => {
      if (t.status === "done") return false;
      const deadline = new Date(t.deadline).toISOString().split("T")[0];
      return deadline <= today;
    }).length;

    const deposits = (transactions || []).filter((tx) => tx.type === "deposit");
    const monthlySavingsRate = deposits.length > 0
      ? Math.round(deposits.slice(0, 10).reduce((s, t) => s + t.amount, 0) / Math.max(1, deposits.slice(0, 10).length) * 4)
      : 500;

    const activeGoals = financialGoals.filter((g) => !g.isPurchased);
    const totalGoalCost = activeGoals.reduce((sum, g) => sum + g.price, 0);

    return {
      productivityIndex,
      completedTasks,
      totalTasks,
      topUrgentTask,
      totalPlans,
      savedAmount,
      totalGoalCost,
      urgentTasksCount: tasks.filter((t) => t.status !== "done").length,
      tasksDueToday,
      monthlySavingsRate,
      executionTimeMs: focusStats.executionTimeMs,
    };
  }, [plans, tasks, financialGoals, savedAmount, transactions]);

  const [createdItems, setCreatedItems] = useState<Set<string>>(new Set());
  const [createdItemNames, setCreatedItemNames] = useState<string[]>([]);

  // Proactive AI execution handler (fetches AI proposals for user choice)
  const handleAiAsk = async (promptText?: string) => {
    const query = promptText || userQuery;
    if (!query || query.trim().length === 0) return;

    setIsThinking(true);
    setCustomResponse(null);
    setCreatedItems(new Set());
    setCreatedItemNames([]);

    const res = await fetchGeminiAiAdvice(query, {
      tasksCount: stats.urgentTasksCount,
      urgentTaskTitle: stats.topUrgentTask?.title,
      plansCount: stats.totalPlans,
      savedAmount: stats.savedAmount,
      totalGoalCost: stats.totalGoalCost,
      productivityIndex: stats.productivityIndex,
      tasksDueToday: stats.tasksDueToday,
      monthlySavingsRate: stats.monthlySavingsRate,
    });

    setCustomResponse(res);
    setIsThinking(false);
  };

  const handleCreateGoal = (goal: { name: string; price: number; currency?: string; imageUrl: string }) => {
    addFinancialGoal({
      name: goal.name,
      price: goal.price,
      imageUrl: goal.imageUrl,
    });
    triggerAudioFeedback();
    const key = `goal-${goal.name}`;
    setCreatedItems((prev) => new Set(prev).add(key));
    setCreatedItemNames((prev) => [...prev, `Financial Goal: "${goal.name}" (${goal.price.toLocaleString()} ${goal.currency || "USD"})`]);
  };

  const handleCreatePlan = (plan: { title: string; category?: any; description: string; deadline?: string; suggestedSubtasks?: string[] }) => {
    addPlan({
      title: plan.title,
      category: plan.category || "skill",
      description: plan.description,
      deadline: plan.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      progress: 0,
    });
    triggerAudioFeedback();
    const key = `plan-${plan.title}`;
    setCreatedItems((prev) => new Set(prev).add(key));
    setCreatedItemNames((prev) => [...prev, `Active Plan: "${plan.title}"`]);
  };

  const handleCreateTask = (task: { title: string; priority?: any; status?: any; deadline?: string; subtasks?: string[] }) => {
    const subtasks = (task.subtasks || ["Step 1", "Step 2"]).map((st, i) => ({
      id: `${Date.now()}-${i}`,
      title: st,
      completed: false,
    }));

    addTask({
      title: task.title,
      priority: task.priority || "high",
      status: task.status || "in-progress",
      deadline: task.deadline || new Date(Date.now() + 24 * 3600000).toISOString(),
      subtasks,
    });
    triggerAudioFeedback();
    const key = `task-${task.title}`;
    setCreatedItems((prev) => new Set(prev).add(key));
    setCreatedItemNames((prev) => [...prev, `Priority Task: "${task.title}"`]);
  };

  // Standard tab content
  const insightContent = useMemo(() => {
    switch (activeTab) {
      case "priority":
        if (stats.topUrgentTask) {
          return {
            title: `Recommended Focus: "${stats.topUrgentTask.title}"`,
            description: `Priority: ${stats.topUrgentTask.priority.toUpperCase()} | Due: ${new Date(stats.topUrgentTask.deadline).toLocaleDateString()}. Completing this will boost your Flow State Index by +12 pts.`,
            icon: Target,
            badge: "Top Priority",
            badgeColor: "bg-destructive/20 text-destructive border-destructive/30",
          };
        }
        return {
          title: "All critical tasks completed!",
          description: "Great job! Create a new task or review your active plans to maintain momentum.",
          icon: CheckCircle2,
          badge: "Clear Queue",
          badgeColor: "bg-chart-4/20 text-chart-4 border-chart-4/30",
        };

      case "streaks":
        return {
          title: `Daily Momentum: ${stats.completedTasks}/${stats.totalTasks} Tasks Done`,
          description: "Consistency builds mastery! Keep checking in daily on your active plans to boost your flow state multiplier.",
          icon: Flame,
          badge: "Active Streak",
          badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };

      case "tips":
        return {
          title: "Genius Tip: Use the Focus Studio Pomodoro Companion",
          description: "Attach tasks directly to 25-minute deep work sessions on your dashboard to auto-complete tasks on timer finish.",
          icon: Lightbulb,
          badge: "Productivity Hack",
          badgeColor: "bg-accent/20 text-accent border-accent/30",
        };

      case "overview":
      default:
        return {
          title: `Productivity Index: ${stats.productivityIndex}% (${stats.productivityIndex >= 70 ? "Optimal Flow" : "Building Velocity"})`,
          description: stats.topUrgentTask
            ? `Next high impact move: Complete "${stats.topUrgentTask.title}"`
            : "Your schedule is clean. Take time to plan your upcoming goals!",
          icon: TrendingUp,
          badge: `${stats.productivityIndex}% Score`,
          badgeColor: "bg-secondary/20 text-secondary border-secondary/30",
        };
    }
  }, [activeTab, stats]);

  const IconComponent = insightContent.icon;

  return (
    <GlassCard glow="blue" className="relative overflow-hidden border border-primary/40 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center glow-blue shrink-0">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold gradient-text">Neo Proactive AI Co-Pilot</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider flex items-center gap-1">
                <Bot className="h-3 w-3 text-primary animate-pulse" />
                C++ Engine Auto-Execute
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Cpu className="h-3 w-3 text-accent" />
              Intelligent query parsing with instant automatic Goal, Plan & Task creation
            </p>
          </div>
        </div>

        {/* Productivity Score Pill */}
        <div className="flex items-center gap-2 glass px-3.5 py-1.5 rounded-xl border border-border/50 shrink-0">
          <Zap className="h-4 w-4 text-accent animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground font-medium uppercase">Flow State Index</div>
            <div className="text-base font-bold text-foreground font-mono">{stats.productivityIndex}/100</div>
          </div>
        </div>
      </div>

      {/* Interactive AI Prompt Bar */}
      <div className="glass rounded-xl p-2.5 mb-4 border border-primary/30 space-y-2">
        <div className="flex gap-2">
          <Input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiAsk()}
            placeholder="Ask AI Co-Pilot anything or type any goal, project, or task..."
            className="bg-muted/60 border-border/50 text-xs py-2 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            onClick={() => handleAiAsk()}
            disabled={isThinking}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4 shrink-0 font-bold shadow-md glow-blue"
          >
            {isThinking ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" /> Execute AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Live Output & Confirmation Banner */}
      {isThinking ? (
        <div className="glass rounded-xl p-5 border border-primary/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
            <Sparkles className="h-5 w-5 animate-spin" />
            Analyzing prompt, calculating timelines, and auto-creating goals & plans...
          </div>
        </div>
      ) : customResponse ? (
        <div className="glass rounded-xl p-4 border border-accent/40 space-y-3 relative animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              {customResponse.type}
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
              {customResponse.impactScore}
            </span>
          </div>

          <h3 className="font-bold text-sm text-foreground">{customResponse.headline}</h3>

          {/* Math / Direct Explanation Box */}
          {customResponse.mathAnswer && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-xs text-foreground font-medium leading-relaxed">
              <span className="text-primary font-bold">AI Strategy Math: </span>
              {customResponse.mathAnswer}
            </div>
          )}

          {/* Interactive Option Selection Buttons */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-primary/30 space-y-2.5">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" />
              <span>How would you like to add this to your dashboard?</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {customResponse.suggestedGoal && (
                <Button
                  onClick={() => handleCreateGoal(customResponse.suggestedGoal!)}
                  disabled={createdItems.has(`goal-${customResponse.suggestedGoal.name}`)}
                  className={cn(
                    "text-xs px-3.5 py-2 font-bold transition-all flex items-center gap-1.5 shadow-md",
                    createdItems.has(`goal-${customResponse.suggestedGoal.name}`)
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white glow-green"
                  )}
                >
                  {createdItems.has(`goal-${customResponse.suggestedGoal.name}`) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Added as Financial Goal
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      + Add as Financial Goal ({customResponse.suggestedGoal.price.toLocaleString()} {customResponse.suggestedGoal.currency || "USD"})
                    </>
                  )}
                </Button>
              )}

              {customResponse.suggestedPlan && (
                <Button
                  onClick={() => handleCreatePlan(customResponse.suggestedPlan!)}
                  disabled={createdItems.has(`plan-${customResponse.suggestedPlan.title}`)}
                  className={cn(
                    "text-xs px-3.5 py-2 font-bold transition-all flex items-center gap-1.5 shadow-md",
                    createdItems.has(`plan-${customResponse.suggestedPlan.title}`)
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-purple-600 hover:bg-purple-500 text-white glow-purple"
                  )}
                >
                  {createdItems.has(`plan-${customResponse.suggestedPlan.title}`) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      Added as Active Plan
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      + Add as Active Plan
                    </>
                  )}
                </Button>
              )}

              {customResponse.suggestedTask && (
                <Button
                  onClick={() => handleCreateTask(customResponse.suggestedTask!)}
                  disabled={createdItems.has(`task-${customResponse.suggestedTask.title}`)}
                  className={cn(
                    "text-xs px-3.5 py-2 font-bold transition-all flex items-center gap-1.5 shadow-md",
                    createdItems.has(`task-${customResponse.suggestedTask.title}`)
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white glow-blue"
                  )}
                >
                  {createdItems.has(`task-${customResponse.suggestedTask.title}`) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      Added as Priority Task
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      + Add as Priority Task
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Creation Success Banner */}
          {createdItemNames.length > 0 && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                <span>Added to your dashboard:</span>
              </div>
              <div className="space-y-1 pl-6">
                {createdItemNames.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Goal Visual Image Preview */}
          {customResponse.suggestedGoal && (
            <div className="glass p-3 rounded-xl border border-accent/40 flex items-center justify-between gap-3 bg-accent/5">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={customResponse.suggestedGoal.imageUrl}
                  alt={customResponse.suggestedGoal.name}
                  className="w-14 h-14 rounded-lg object-cover border border-accent/30 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-accent uppercase font-bold tracking-wider flex items-center gap-1">
                    Goal Preview
                  </span>
                  <h4 className="font-bold text-sm text-foreground truncate">{customResponse.suggestedGoal.name}</h4>
                  <p className="text-xs font-mono font-bold text-accent">
                    Price: {customResponse.suggestedGoal.price.toLocaleString()} {customResponse.suggestedGoal.currency || "USD"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleCreateGoal(customResponse.suggestedGoal!)}
                disabled={createdItems.has(`goal-${customResponse.suggestedGoal.name}`)}
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {createdItems.has(`goal-${customResponse.suggestedGoal.name}`) ? "Added ✓" : "+ Add Goal"}
              </Button>
            </div>
          )}

          {/* Strategy Steps */}
          <div className="space-y-1.5 pt-1">
            {customResponse.actionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Tabs & Standard Overview */
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "overview", label: "Smart Overview", icon: Sparkles },
              { id: "priority", label: "Recommended Focus", icon: Target },
              { id: "streaks", label: "Streak Momentum", icon: Flame },
              { id: "tips", label: "Genius Hacks", icon: Lightbulb },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as InsightCategory)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "glass text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="glass rounded-xl p-4 border border-border/40 relative">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-sm text-foreground">{insightContent.title}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", insightContent.badgeColor)}>
                    {insightContent.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insightContent.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
