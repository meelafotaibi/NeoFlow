"use client";

import { useState } from "react";
import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
import { ProgressRing } from "@/components/progress-ring";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Target,
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { type FinancialGoal } from "@/lib/types";
import { formatCurrency } from "@/lib/countdown";
import { CurrencySymbol } from "@/components/currency-symbol";
import { SavingsSimulator } from "@/components/savings-simulator";
import { ImagePicker } from "@/components/image-picker";
import { TransactionLedger } from "@/components/transaction-ledger";

export function FinancePage() {
  const {
    financialGoals,
    savedAmount,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    purchaseFinancialGoal,
    unpurchaseFinancialGoal,
    updateSavedAmount,
    addToSavings,
  } = useNeoFlow();
  
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [savingsInput, setSavingsInput] = useState("");

  const activeGoals = financialGoals.filter((g) => !g.isPurchased);
  const purchasedGoals = financialGoals.filter((g) => g.isPurchased);

  const totalGoalCost = activeGoals.reduce((sum, g) => sum + g.price, 0);
  const overallProgress = totalGoalCost > 0 ? (savedAmount / totalGoalCost) * 100 : 0;
  
  // Calculate how many active goals can be afforded cumulatively (waterfall by price)
  const sortedGoals = [...activeGoals].sort((a, b) => a.price - b.price);
  let cumulativeCost = 0;
  const affordableGoals = sortedGoals.filter((g) => {
    cumulativeCost += g.price;
    return cumulativeCost <= savedAmount;
  });
  const affordableGoalIds = new Set(affordableGoals.map((g) => g.id));

  const handleAddSavings = () => {
    const amount = parseFloat(savingsInput);
    if (!isNaN(amount) && amount !== 0) {
      addToSavings(amount);
      setSavingsInput("");
      setIsAddSavingsOpen(false);
    }
  };

  // Calculate remaining after affordable goals
  const affordableTotal = affordableGoals.reduce((sum, g) => sum + g.price, 0);
  const remainingAfterAffordable = savedAmount - affordableTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Finance</h1>
          <p className="text-muted-foreground mt-1">
            Track your savings and financial goals
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddSavingsOpen} onOpenChange={setIsAddSavingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/20">
                <Wallet className="h-4 w-4 mr-2" />
                Add Savings
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="gradient-text">Add to Savings Wallet</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add or withdraw from your savings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount (use negative to withdraw)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={savingsInput}
                      onChange={(e) => setSavingsInput(e.target.value)}
                      placeholder="0.00"
                      className="pl-9 bg-muted/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddSavingsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30"
                    onClick={handleAddSavings}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="gradient-text">Create Financial Goal</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add a new financial goal to track your savings progress.
                </DialogDescription>
              </DialogHeader>
              <GoalForm
                onSubmit={(goal) => {
                  addFinancialGoal(goal);
                  setIsAddGoalOpen(false);
                }}
                onCancel={() => setIsAddGoalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="cyan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Saved</p>
              <p className="text-2xl font-bold mt-1 text-accent flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(savedAmount)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-accent" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Goals</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(totalGoalCost)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Still Need</p>
              <p className="text-2xl font-bold mt-1 flex items-center">
                <CurrencySymbol className="h-[0.85em] mr-1" />
                {formatCurrency(Math.max(0, totalGoalCost - savedAmount))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className={affordableGoals.length === financialGoals.length && financialGoals.length > 0 ? "border-green-500/30" : ""}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Can Afford</p>
              <p className="text-2xl font-bold mt-1 text-green-400">
                {affordableGoals.length}/{financialGoals.length}
              </p>
            </div>
            <ProgressRing 
              progress={financialGoals.length > 0 ? (affordableGoals.length / financialGoals.length) * 100 : 0} 
              size={48} 
              strokeWidth={4} 
              color="green" 
            />
          </div>
        </GlassCard>
      </div>

      {/* Smart Savings Forecast Engine */}
      <SavingsSimulator />

      {/* Transaction History Ledger */}
      <TransactionLedger />

      {/* Savings Wallet Visual */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center glow-cyan">
            <Wallet className="h-16 w-16 text-accent" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">Your Savings Wallet</h2>
            <p className="text-muted-foreground mt-1">
              Current balance: <span className="text-accent font-semibold inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-1" />{formatCurrency(savedAmount)}</span>
            </p>
            {financialGoals.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {affordableGoals.length === financialGoals.length ? (
                  <span className="text-green-400">You can afford all your goals!</span>
                ) : affordableGoals.length > 0 ? (
                  <>
                    You can afford <span className="text-green-400 font-medium">{affordableGoals.length}</span> goal{affordableGoals.length > 1 ? "s" : ""}.
                    {remainingAfterAffordable > 0 && (
                      <> <span className="text-accent inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-1" />{formatCurrency(remainingAfterAffordable)}</span> towards next goal.</>
                    )}
                  </>
                ) : (
                  <>Keep saving! <span className="text-accent inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-1" />{formatCurrency(savedAmount)}</span> towards your first goal.</>
                )}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-semibold"
                onClick={() => addToSavings(10)}
              >
                +$10
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-semibold"
                onClick={() => addToSavings(50)}
              >
                +$50
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-semibold"
                onClick={() => addToSavings(100)}
              >
                +$100
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-semibold"
                onClick={() => addToSavings(500)}
              >
                +$500
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/20 font-semibold"
                onClick={() => addToSavings(1000)}
              >
                +$1,000
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/20 font-semibold"
                onClick={() => updateSavedAmount(0)}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Goals Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Financial Goals</h2>
          {financialGoals.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Sorted by price (cheapest first)
            </p>
          )}
        </div>
        {financialGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedGoals.map((goal, index) => {
              // Calculate cumulative progress for this goal
              const previousGoalsCost = sortedGoals
                .slice(0, index)
                .reduce((sum, g) => sum + g.price, 0);
              const availableForThisGoal = Math.max(0, savedAmount - previousGoalsCost);
              const progress = Math.min(100, (availableForThisGoal / goal.price) * 100);
              const remaining = Math.max(0, goal.price - availableForThisGoal);
              const canAfford = affordableGoalIds.has(goal.id);

              return (
                <GlassCard 
                  key={goal.id} 
                  className={`relative group ${canAfford ? "border-green-500/30" : ""}`} 
                  glow={canAfford ? "cyan" : "blue"} 
                  hover
                >
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/20"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/20 text-destructive"
                      onClick={() => deleteFinancialGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Affordability Badge */}
                  <div className="absolute top-3 left-3">
                    {canAfford ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle className="h-3 w-3" />
                        Affordable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <AlertCircle className="h-3 w-3" />
                        Saving
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  {goal.imageUrl ? (
                    <div className="w-full h-64 rounded-lg overflow-hidden mb-4 mt-8 bg-muted/10 flex items-center justify-center border border-border/20">
                      <img
                        src={goal.imageUrl}
                        alt={goal.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 mt-8 border border-border/30">
                      <Sparkles className="h-10 w-10 text-primary/50" />
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="text-lg font-semibold">{goal.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1 flex items-center">
                    <CurrencySymbol className="h-[0.85em] mr-1" />
                    {formatCurrency(goal.price)}
                  </p>

                  {/* Progress */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {canAfford ? (
                          <span className="text-green-400">Ready to purchase!</span>
                        ) : (
                          <span className="inline-flex items-center">
                            <CurrencySymbol className="h-[0.85em] mr-1" />
                            {formatCurrency(remaining)}&nbsp;more needed
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                        <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(Math.min(availableForThisGoal, goal.price))}</span>
                        <span>/</span>
                        <span className="inline-flex items-center"><CurrencySymbol className="h-[0.85em] mr-0.5" />{formatCurrency(goal.price)}</span>
                      </p>
                    </div>
                    <ProgressRing
                      progress={progress}
                      size={56}
                      strokeWidth={4}
                      color={canAfford ? "green" : "blue"}
                    />
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        canAfford 
                          ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                          : "bg-gradient-to-r from-primary to-accent"
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>

                  {canAfford && (
                    <div className="mt-3">
                      <Button
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            try {
                              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                              const osc = audioCtx.createOscillator();
                              const gain = audioCtx.createGain();
                              osc.type = "sine";
                              osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                              osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
                              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                              osc.connect(gain);
                              gain.connect(audioCtx.destination);
                              osc.start();
                              osc.stop(audioCtx.currentTime + 0.4);
                            } catch {}
                          }
                          purchaseFinancialGoal(goal.id);
                        }}
                        className="w-full bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30 text-xs font-bold py-2 shadow-lg glow-cyan"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Claim & Buy Goal ({formatCurrency(goal.price)})
                      </Button>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active financial goals</h3>
            <p className="text-muted-foreground mb-4">
              Add your first goal to start tracking your savings
            </p>
            <Button
              onClick={() => setIsAddGoalOpen(true)}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Purchased & Claimed Goals Section */}
      {purchasedGoals.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-4" />
            <h2 className="text-xl font-bold gradient-text">Purchased & Achieved Goals 🎉</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-chart-4/20 text-chart-4 border border-chart-4/30">
              {purchasedGoals.length} Fulfilled
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {purchasedGoals.map((goal) => (
              <GlassCard key={goal.id} className="border-chart-4/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-chart-4/20 text-chart-4 border border-chart-4/30">
                    <CheckCircle className="h-3 w-3" />
                    Fulfilled
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => unpurchaseFinancialGoal(goal.id)}
                    title="Revert goal back to active goals and restore savings balance"
                  >
                    Undo Purchase
                  </Button>
                </div>
                <h3 className="text-base font-semibold line-through text-muted-foreground">{goal.name}</h3>
                <p className="text-xl font-bold text-chart-4 mt-1 flex items-center">
                  <CurrencySymbol className="h-[0.85em] mr-1" />
                  {formatCurrency(goal.price)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Claimed: {goal.purchasedAt ? new Date(goal.purchasedAt).toLocaleDateString() : "Recently"}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Financial Goal</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your financial goal details.
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              initialData={editingGoal}
              onSubmit={(updates) => {
                updateFinancialGoal(editingGoal.id, updates);
                setEditingGoal(null);
              }}
              onCancel={() => setEditingGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GoalFormProps {
  initialData?: FinancialGoal;
  onSubmit: (goal: Omit<FinancialGoal, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name || isNaN(priceNum) || priceNum <= 0) return;

    onSubmit({
      name,
      price: priceNum,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., New MacBook Pro"
          className="bg-muted/50 border-border/50"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="pl-9 bg-muted/50 border-border/50"
            required
          />
        </div>
      </div>

      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        titleQuery={name}
        label="Goal Image / Photo Attachment (Optional)"
      />

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        >
          {initialData ? "Update" : "Create"} Goal
        </Button>
      </div>
    </form>
  );
}
