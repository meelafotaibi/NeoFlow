"use client";

import { useState } from "react";
import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
import { ProgressRing } from "@/components/progress-ring";
import { CountdownDisplay } from "@/components/countdown-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Pencil,
  Trash2,
  Timer,
  Calendar,
  Sparkles,
  Check,
  X,
  Flame,
} from "lucide-react";
import { CATEGORY_LABELS, type CategoryType, type Plan } from "@/lib/types";
import { formatDate } from "@/lib/countdown";
import { ImagePicker } from "@/components/image-picker";
import { PreciseDateTimePicker } from "@/components/precise-datetime-picker";

// Get last N days as date strings
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Get current streak count
function getStreak(checkins: Record<string, boolean> | undefined): number {
  if (!checkins) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (checkins[dateStr] === true) {
      streak++;
    } else if (checkins[dateStr] === false || i > 0) {
      break;
    }
  }
  return streak;
}

export function PlansPage() {
  const { plans, addPlan, updatePlan, deletePlan, toggleDailyCheckin } = useNeoFlow();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [filterCategory, setFilterCategory] = useState<CategoryType | "all">("all");

  const filteredPlans = filterCategory === "all"
    ? plans
    : plans.filter((p) => p.category === filterCategory);

  const sortedPlans = [...filteredPlans].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Plans</h1>
          <p className="text-muted-foreground mt-1">
            Track your goals with live countdowns
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filterCategory}
            onValueChange={(v) => setFilterCategory(v as CategoryType | "all")}
          >
            <SelectTrigger className="w-[140px] bg-muted/50 border-border/50">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="gradient-text">Create New Plan</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add a new plan with a deadline and track your progress.
                </DialogDescription>
              </DialogHeader>
              <PlanForm
                onSubmit={(plan) => {
                  addPlan(plan);
                  setIsAddOpen(false);
                }}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans Grid */}
      {sortedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlan(plan)}
              onDelete={() => deletePlan(plan.id)}
              onToggleCheckin={(date) => toggleDailyCheckin(plan.id, date)}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Timer className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first plan to start tracking your goals
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </GlassCard>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Plan</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your plan details and progress.
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <PlanForm
              initialData={editingPlan}
              onSubmit={(updates) => {
                updatePlan(editingPlan.id, updates);
                setEditingPlan(null);
              }}
              onCancel={() => setEditingPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCheckin: (date: string) => void;
}

function PlanCard({ plan, onEdit, onDelete, onToggleCheckin }: PlanCardProps) {
  const last7Days = getLastNDays(7);
  const streak = getStreak(plan.dailyCheckins);

  const categoryColors: Record<CategoryType, string> = {
    study: "bg-primary/20 text-primary border-primary/30",
    skill: "bg-secondary/20 text-secondary border-secondary/30",
    life: "bg-accent/20 text-accent border-accent/30",
    exam: "bg-destructive/20 text-destructive border-destructive/30",
    habit: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  };

  const progressColors: Record<CategoryType, "blue" | "purple" | "cyan" | "green"> = {
    study: "blue",
    skill: "purple",
    life: "cyan",
    exam: "blue",
    habit: "green",
  };

  return (
    <GlassCard className="relative group" glow="blue" hover>
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/20"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/20 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* AI Image Placeholder */}
      {plan.imageUrl ? (
        <div className="w-full h-64 rounded-lg overflow-hidden mb-4 bg-muted/10 flex items-center justify-center border border-border/20">
          <img
            src={plan.imageUrl}
            alt={plan.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-64 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 border border-border/30">
          <Sparkles className="h-10 w-10 text-primary/50" />
        </div>
      )}

      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[plan.category]}`}
        >
          {CATEGORY_LABELS[plan.category]}
        </span>
        {/* Streak Badge */}
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="h-3 w-3" />
            {streak} day{streak > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold mt-3 text-foreground">{plan.title}</h3>
      {plan.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {plan.description}
        </p>
      )}

      {/* Daily Check-in Tracker */}
      <div className="mt-4 glass rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Daily Streak & Progress</span>
          <span className="text-[11px] text-primary/80 font-mono">
            {Object.values(plan.dailyCheckins || {}).filter((v) => v === true).length} active days
          </span>
        </div>
        <div className="flex gap-1 justify-between">
          {last7Days.map((date) => {
            const status = plan.dailyCheckins?.[date];
            const dayLabel = new Date(date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
            const isToday = date === new Date().toISOString().split("T")[0];
            
            return (
              <button
                key={date}
                onClick={() => onToggleCheckin(date)}
                className={`
                  flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all
                  ${isToday ? "ring-1 ring-primary/50" : ""}
                  ${status === true 
                    ? "bg-chart-4/20 text-chart-4" 
                    : status === false 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }
                `}
                title={`${date}${isToday ? " (Today)" : ""} - Click to toggle`}
              >
                <span className="text-[10px] font-medium">{dayLabel}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                  {status === true ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : status === false ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current opacity-30" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deadline & Countdown */}
      <div className="mt-4 glass rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3" />
          <span>Due: {formatDate(plan.deadline)}</span>
        </div>
        <CountdownDisplay deadline={plan.deadline} size="md" />
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-lg font-bold">{plan.progress}%</p>
        </div>
        <ProgressRing
          progress={plan.progress}
          size={56}
          strokeWidth={4}
          color={progressColors[plan.category]}
        />
      </div>
    </GlassCard>
  );
}

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (plan: Omit<Plan, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function PlanForm({ initialData, onSubmit, onCancel }: PlanFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState<CategoryType>(initialData?.category || "study");
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [progress, setProgress] = useState(initialData?.progress || 0);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    onSubmit({
      title,
      category,
      deadline: new Date(deadline).toISOString(),
      description,
      progress,
      imageUrl: imageUrl || undefined,
      dailyCheckins: initialData?.dailyCheckins,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Finish Flutter Course"
          className="bg-muted/50 border-border/50"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as CategoryType)}>
          <SelectTrigger className="bg-muted/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PreciseDateTimePicker
        value={deadline}
        onChange={setDeadline}
        label="Exact Target Plan Deadline (Hour & Minute)"
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of your plan"
          className="bg-muted/50 border-border/50"
        />
      </div>

      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        titleQuery={title}
        label="Plan Cover Image / Visual Goal (Optional)"
      />

      <div className="space-y-2">
        <Label>Progress: {progress}%</Label>
        <Slider
          value={[progress]}
          onValueChange={(v) => setProgress(v[0])}
          max={100}
          step={1}
          className="py-2"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        >
          {initialData ? "Update" : "Create"} Plan
        </Button>
      </div>
    </form>
  );
}
