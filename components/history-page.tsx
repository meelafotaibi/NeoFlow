"use client";

import { useState, useMemo } from "react";
import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
import { formatCurrency } from "@/lib/countdown";
import { CurrencySymbol } from "@/components/currency-symbol";
import { ProgressRing } from "@/components/progress-ring";
import {
  History,
  CheckCircle2,
  Target,
  Trophy,
  Award,
  Sparkles,
  Timer,
  Wallet,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Flame,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  RotateCcw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ArchiveTab = "all" | "tasks" | "plans" | "goals" | "ledger";

export function HistoryPage() {
  const { tasks, plans, financialGoals, transactions, savedAmount } = useNeoFlow();
  const [activeTab, setActiveTab] = useState<ArchiveTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);

  // Completed items filters
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks]);
  const completedPlans = useMemo(() => plans.filter((p) => p.progress >= 100), [plans]);
  const purchasedGoals = useMemo(() => financialGoals.filter((g) => g.isPurchased), [financialGoals]);

  // Statistics
  const totalTasksDone = completedTasks.length;
  const totalPlansMastered = completedPlans.length;
  const totalGoalsAchieved = purchasedGoals.length;
  const totalGoalValueAchieved = purchasedGoals.reduce((sum, g) => sum + g.price, 0);
  const totalDepositAmount = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Search Filter
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return completedTasks;
    const q = searchQuery.toLowerCase();
    return completedTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [completedTasks, searchQuery]);

  const filteredPlans = useMemo(() => {
    if (!searchQuery) return completedPlans;
    const q = searchQuery.toLowerCase();
    return completedPlans.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [completedPlans, searchQuery]);

  const filteredGoals = useMemo(() => {
    if (!searchQuery) return purchasedGoals;
    const q = searchQuery.toLowerCase();
    return purchasedGoals.filter((g) => g.name.toLowerCase().includes(q));
  }, [purchasedGoals, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((t) => t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q));
  }, [transactions, searchQuery]);

  const typeBadges = {
    deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-green-400 bg-green-500/10 border-green-500/30" },
    withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-destructive bg-destructive/10 border-destructive/30" },
    purchase: { label: "Purchase", icon: ShoppingBag, color: "text-accent bg-accent/10 border-accent/30" },
    refund: { label: "Refund", icon: RotateCcw, color: "text-secondary bg-secondary/10 border-secondary/30" },
  };

  return (
    <div className="space-y-6">
      {/* 10 Million % Productivity Header */}
      <GlassCard glow="purple" className="relative overflow-hidden border border-primary/40 p-6">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-accent animate-pulse" />
                Productivity Mastery Index
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-mono font-bold">
                10,000,000% Optimal
              </span>
            </div>
            <h1 className="text-3xl font-black gradient-text">Archive & Lifetime Achievements</h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Every completed task, mastered plan, and unlocked financial goal recorded in your lifetime productivity vault.
            </p>
          </div>

          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border border-border/50 shrink-0">
            <Award className="h-10 w-10 text-accent animate-pulse shrink-0" />
            <div>
              <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Goals Achieved</div>
              <div className="text-2xl font-black text-foreground font-mono">
                {totalGoalsAchieved} Unlocked
              </div>
              <div className="text-xs text-accent font-semibold flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-0.5" />
                {formatCurrency(totalGoalValueAchieved)} Value
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Lifetime Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks Completed</p>
              <p className="text-2xl font-bold mt-1 text-primary font-mono">{totalTasksDone}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Plans Mastered</p>
              <p className="text-2xl font-bold mt-1 text-secondary font-mono">{totalPlansMastered}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Timer className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Financial Goals Met</p>
              <p className="text-2xl font-bold mt-1 text-green-400 font-mono">{totalGoalsAchieved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Deposited</p>
              <p className="text-2xl font-bold mt-1 text-accent font-mono flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(totalDepositAmount)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Interactive Archive Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All History", icon: History },
            { id: "tasks", label: `Tasks (${completedTasks.length})`, icon: CheckCircle2 },
            { id: "plans", label: `Plans (${completedPlans.length})`, icon: Timer },
            { id: "goals", label: `Goals (${purchasedGoals.length})`, icon: Target },
            { id: "ledger", label: `Ledger (${transactions.length})`, icon: Wallet },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ArchiveTab)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md glow-blue"
                    : "glass text-muted-foreground hover:text-foreground border border-border/40"
                )}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archive history..."
            className="pl-9 bg-muted/60 border-border/50 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Tab 1: Achieved Financial Goals Section */}
      {(activeTab === "all" || activeTab === "goals") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Achieved & Fulfilled Financial Goals ({filteredGoals.length})
            </h2>
          </div>

          {filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGoals.map((goal) => (
                <GlassCard key={goal.id} glow="cyan" className="border-green-500/40 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                      <Check className="h-3.5 w-3.5" />
                      Goal Mastered & Claimed
                    </span>
                  </div>

                  {goal.imageUrl && (
                    <div className="w-full h-40 rounded-lg overflow-hidden my-3 border border-green-500/30">
                      <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="text-base font-bold text-foreground">{goal.name}</h3>
                  <p className="text-xl font-bold text-green-400 mt-1 flex items-center font-mono">
                    <CurrencySymbol className="h-[0.85em] mr-1" />
                    {formatCurrency(goal.price)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                    Claimed Date: {goal.purchasedAt ? new Date(goal.purchasedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                  </p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8 text-xs text-muted-foreground">
              No financial goals achieved yet. Save funds and claim your goals on the Finance page!
            </GlassCard>
          )}
        </div>
      )}

      {/* Tab 2: Mastered Plans Section */}
      {(activeTab === "all" || activeTab === "plans") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Timer className="h-5 w-5 text-secondary" />
              Mastered Active Plans (100% Progress) ({filteredPlans.length})
            </h2>
          </div>

          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map((plan) => (
                <GlassCard key={plan.id} glow="purple" className="border-secondary/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {plan.category || "Skill"} Roadmap
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-mono font-bold border border-secondary/30">
                      100% Completed
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground">{plan.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8 text-xs text-muted-foreground">
              No plans completed at 100% yet. Progress your active plans to unlock completion certificates!
            </GlassCard>
          )}
        </div>
      )}

      {/* Tab 3: Completed Tasks Section */}
      {(activeTab === "all" || activeTab === "tasks") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Completed Tasks Archive ({filteredTasks.length})
            </h2>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <GlassCard key={task.id} className="p-3.5 border border-primary/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground line-through opacity-80 truncate">{task.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Priority: {task.priority.toUpperCase()} | Subtasks: {task.subtasks.length} done
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-mono font-bold shrink-0 border border-green-500/20">
                    Done
                  </span>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-8 text-xs text-muted-foreground">
              No completed tasks archived yet. Check off items in your task queue to build your record!
            </GlassCard>
          )}
        </div>
      )}

      {/* Tab 4: Financial Transaction Ledger Section (Expandable for 100+ deposits) */}
      {(activeTab === "all" || activeTab === "ledger") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              Financial Transaction History ({filteredTransactions.length})
            </h2>

            {filteredTransactions.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                className="text-xs border-accent/40 text-accent hover:bg-accent/20 font-bold"
              >
                {isLedgerExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" /> Collapse Ledger
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" /> Expand All ({filteredTransactions.length} Records)
                  </>
                )}
              </Button>
            )}
          </div>

          {filteredTransactions.length > 0 ? (
            <GlassCard className="p-3 border border-border/40 space-y-2">
              <div
                className={cn(
                  "space-y-1.5 transition-all duration-300",
                  isLedgerExpanded ? "max-h-[500px] overflow-y-auto pr-1" : "max-h-64 overflow-y-auto pr-1"
                )}
              >
                {(isLedgerExpanded ? filteredTransactions : filteredTransactions.slice(0, 5)).map((tx) => {
                  const info = typeBadges[tx.type] || typeBadges.deposit;
                  const Icon = info.icon;
                  const isPositive = tx.type === "deposit" || tx.type === "refund";

                  return (
                    <div
                      key={tx.id}
                      className="glass p-2.5 rounded-lg flex items-center justify-between border border-border/30 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("p-1.5 rounded-lg border shrink-0", info.color)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "font-mono font-bold text-xs shrink-0 ml-2 flex items-center",
                          isPositive ? "text-green-400" : "text-foreground"
                        )}
                      >
                        {isPositive ? "+" : "-"}
                        <CurrencySymbol className="h-[0.85em] mx-0.5" />
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLedgerExpanded && filteredTransactions.length > 5 && (
                <div className="pt-2 text-center border-t border-border/30">
                  <button
                    onClick={() => setIsLedgerExpanded(true)}
                    className="text-xs text-accent font-bold hover:underline inline-flex items-center gap-1"
                  >
                    View all {filteredTransactions.length} transactions <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-8 text-xs text-muted-foreground">
              No transaction history recorded yet.
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
