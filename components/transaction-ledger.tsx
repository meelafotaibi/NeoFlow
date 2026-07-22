"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useNeoFlow } from "@/lib/store";
import { formatCurrency } from "@/lib/countdown";
import { CurrencySymbol } from "@/components/currency-symbol";
import { History, ArrowUpRight, ArrowDownLeft, ShoppingBag, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TransactionLedger() {
  const { transactions = [] } = useNeoFlow();
  const [isExpanded, setIsExpanded] = useState(false);

  if (transactions.length === 0) {
    return (
      <GlassCard className="text-center py-6 text-xs text-muted-foreground">
        <History className="h-5 w-5 mx-auto mb-1 text-muted-foreground/60" />
        No transaction history recorded yet. Add savings or claim goals to log history!
      </GlassCard>
    );
  }

  const typeBadges = {
    deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-green-400 bg-green-500/10 border-green-500/30" },
    withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-destructive bg-destructive/10 border-destructive/30" },
    purchase: { label: "Purchase", icon: ShoppingBag, color: "text-accent bg-accent/10 border-accent/30" },
    refund: { label: "Refund", icon: RotateCcw, color: "text-secondary bg-secondary/10 border-secondary/30" },
  };

  const visibleTransactions = isExpanded ? transactions : transactions.slice(0, 5);

  return (
    <GlassCard className="space-y-3 border border-border/40">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <History className="h-4 w-4 text-primary" />
          Financial Transaction Ledger & History
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {transactions.length} record{transactions.length > 1 ? "s" : ""}
          </span>

          {transactions.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs font-bold text-accent hover:bg-accent/20"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 mr-1" /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 mr-1" /> Expand ({transactions.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "space-y-1.5 transition-all duration-300",
          isExpanded ? "max-h-96 overflow-y-auto pr-1" : "max-h-56 overflow-y-auto pr-1"
        )}
      >
        {visibleTransactions.map((tx) => {
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

      {!isExpanded && transactions.length > 5 && (
        <div className="pt-1 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-[11px] text-accent font-semibold hover:underline inline-flex items-center gap-1"
          >
            Show {transactions.length - 5} more transactions <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </GlassCard>
  );
}
