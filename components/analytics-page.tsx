"use client";

import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
import { ProgressRing } from "@/components/progress-ring";
import { CATEGORY_LABELS, type CategoryType } from "@/lib/types";
import { formatCurrency } from "@/lib/countdown";
import { CurrencySymbol } from "@/components/currency-symbol";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle2,
  Timer,
  Wallet,
} from "lucide-react";

export function AnalyticsPage() {
  const { plans, tasks, financialGoals, savedAmount } = useNeoFlow();

  // Plan stats by category
  const plansByCategory = Object.keys(CATEGORY_LABELS).map((cat) => {
    const categoryPlans = plans.filter((p) => p.category === cat as CategoryType);
    const avgProgress = categoryPlans.length > 0
      ? categoryPlans.reduce((sum, p) => sum + p.progress, 0) / categoryPlans.length
      : 0;
    return {
      name: CATEGORY_LABELS[cat as CategoryType],
      value: categoryPlans.length,
      progress: avgProgress,
    };
  }).filter((c) => c.value > 0);

  // Vibrant colors for charts
  const TASK_STATUS_COLORS = {
    todo: "#F59E0B",      // Amber
    inProgress: "#3B82F6", // Blue
    done: "#10B981",       // Green
  };

  // Task stats by status - with vibrant colors
  const tasksByStatus = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length, fill: TASK_STATUS_COLORS.todo },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, fill: TASK_STATUS_COLORS.inProgress },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length, fill: TASK_STATUS_COLORS.done },
  ].filter((s) => s.value > 0);

  // Task stats by priority with colors
  const PRIORITY_COLORS = {
    high: "#EF4444",    // Red
    medium: "#F59E0B",  // Amber
    low: "#22D3EE",     // Cyan
  };

  const tasksByPriority = [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length, fill: PRIORITY_COLORS.high },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, fill: PRIORITY_COLORS.medium },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length, fill: PRIORITY_COLORS.low },
  ];

  // Financial overview
  const totalGoalCost = financialGoals.reduce((sum, g) => sum + g.price, 0);
  const savingsProgress = totalGoalCost > 0 ? (savedAmount / totalGoalCost) * 100 : 0;

  // Overall stats
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const avgPlanProgress = plans.length > 0
    ? plans.reduce((sum, p) => sum + p.progress, 0) / plans.length
    : 0;

  // Vibrant category colors
  const CATEGORY_COLORS = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#22D3EE", // Cyan
    "#10B981", // Green
    "#EF4444", // Red
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights into your productivity and progress
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Plans</p>
              <p className="text-2xl font-bold">{plans.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Done</p>
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Saved</p>
              <p className="text-2xl font-bold flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(savedAmount)}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goal Progress</p>
              <p className="text-2xl font-bold">{Math.round(savingsProgress)}%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="text-center">
          <h3 className="text-sm text-muted-foreground mb-4">Plan Progress</h3>
          <div className="flex justify-center">
            <ProgressRing progress={avgPlanProgress} size={120} strokeWidth={8} color="blue" />
          </div>
          <p className="text-lg font-semibold mt-4">Average Completion</p>
          <p className="text-sm text-muted-foreground">{plans.length} active plans</p>
        </GlassCard>

        <GlassCard className="text-center">
          <h3 className="text-sm text-muted-foreground mb-4">Task Completion</h3>
          <div className="flex justify-center">
            <ProgressRing progress={taskCompletionRate} size={120} strokeWidth={8} color="purple" />
          </div>
          <p className="text-lg font-semibold mt-4">Completion Rate</p>
          <p className="text-sm text-muted-foreground">{completedTasks} of {totalTasks} tasks done</p>
        </GlassCard>

        <GlassCard className="text-center">
          <h3 className="text-sm text-muted-foreground mb-4">Savings Goal</h3>
          <div className="flex justify-center">
            <ProgressRing progress={Math.min(100, savingsProgress)} size={120} strokeWidth={8} color="cyan" />
          </div>
          <p className="text-lg font-semibold mt-4">Goal Reached</p>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(savedAmount)}</span>
            <span>/</span>
            <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(totalGoalCost)}</span>
          </p>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans by Category */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Plans by Category</h3>
          </div>
          {plansByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={plansByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {plansByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No plans to display
            </div>
          )}
        </GlassCard>

        {/* Tasks by Status */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">Tasks by Status</h3>
          </div>
          {tasksByStatus.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {tasksByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS.todo }} />
                  <span className="text-xs text-muted-foreground">To Do</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS.inProgress }} />
                  <span className="text-xs text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS.done }} />
                  <span className="text-xs text-muted-foreground">Done</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No tasks to display
            </div>
          )}
        </GlassCard>
      </div>

      {/* Task Priority Bar Chart */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Tasks by Priority</h3>
        </div>
        {tasks.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByPriority}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Tasks"
                  radius={[4, 4, 0, 0]}
                >
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No tasks to display
          </div>
        )}
      </GlassCard>

      {/* Financial Goals Overview */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Financial Goals Progress</h3>
        </div>
        {financialGoals.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              // Calculate cumulative affordability
              let remainingSavings = savedAmount;
              return financialGoals
                .sort((a, b) => a.price - b.price) // Sort by price ascending
                .map((goal) => {
                  const canAffordFully = remainingSavings >= goal.price;
                  const partialAmount = Math.min(remainingSavings, goal.price);
                  const progress = (partialAmount / goal.price) * 100;
                  
                  // Deduct from remaining if fully affordable
                  if (canAffordFully) {
                    remainingSavings -= goal.price;
                  }
                  
                  return (
                    <div key={goal.id} className="glass rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(Math.min(partialAmount, goal.price))}</span>
                          <span>/</span>
                          <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(goal.price)}</span>
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            canAffordFully 
                              ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                              : "bg-gradient-to-r from-primary to-accent"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% funded</span>
                        {canAffordFully && (
                          <span className="text-green-400 font-medium">Ready to purchase!</span>
                        )}
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No financial goals to display
          </div>
        )}
      </GlassCard>
    </div>
  );
}
