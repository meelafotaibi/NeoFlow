"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Wallet,
  BarChart3,
  Search,
  Sparkles,
  Plus,
  Zap,
} from "lucide-react";
import { useNeoFlow } from "@/lib/store";
import { type NavItem } from "@/components/sidebar";

interface QuickCommandPaletteProps {
  onNavigate: (item: NavItem) => void;
}

export function QuickCommandPalette({ onNavigate }: QuickCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { plans, tasks } = useNeoFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navActions = [
    { label: "Go to Dashboard", icon: LayoutDashboard, action: () => onNavigate("dashboard") },
    { label: "Go to Plans & Goals", icon: Timer, action: () => onNavigate("plans") },
    { label: "Go to Tasks & Kanban", icon: CheckSquare, action: () => onNavigate("tasks") },
    { label: "Go to Finance & Wallet", icon: Wallet, action: () => onNavigate("finance") },
    { label: "Go to Analytics & Velocity", icon: BarChart3, action: () => onNavigate("analytics") },
  ];

  const filteredNav = navActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPlans = plans.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Floating Trigger Pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 glass px-3.5 py-2 rounded-full border border-border/50 shadow-2xl flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-105"
        title="Open Command Palette (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">Search or Cmd+K</span>
        <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono border border-border/40">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-border/50 sm:max-w-[550px] p-0 overflow-hidden">
          <div className="flex items-center border-b border-border/30 px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search navigation, tasks, plans, or actions..."
              className="border-none shadow-none focus-visible:ring-0 bg-transparent py-4 text-sm"
              autoFocus
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto p-2 space-y-3">
            {/* Quick Actions */}
            {filteredNav.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  Actions & Navigation
                </p>
                <div className="space-y-0.5">
                  {filteredNav.map((act, i) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          act.action();
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-primary/20 hover:text-primary transition-all text-left"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plans */}
            {filteredPlans.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  Matching Plans
                </p>
                <div className="space-y-0.5">
                  {filteredPlans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate("plans");
                        setOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Timer className="h-3.5 w-3.5 text-secondary" />
                        <span className="font-medium truncate">{p.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.progress}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {filteredTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  Matching Tasks
                </p>
                <div className="space-y-0.5">
                  {filteredTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onNavigate("tasks");
                        setOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-3.5 w-3.5 text-accent" />
                        <span className="font-medium truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">
                        {t.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
