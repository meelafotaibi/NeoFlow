"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Wallet,
  BarChart3,
  History,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type NavItem = "dashboard" | "plans" | "tasks" | "finance" | "analytics" | "history";

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plans", label: "Plans", icon: Timer },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
];

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 glass-card border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-border/30">
            <div className="relative">
              <img
                src="/icon.png"
                alt="NeoFlow Logo"
                className="w-10 h-10 rounded-xl object-cover border border-primary/30 shadow-md glow-blue"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">NeoFlow</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Life OS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 glow-blue"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/30">
            <div className="glass rounded-lg p-2.5">
              <p className="text-[11px] text-muted-foreground mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-xs text-foreground font-mono">All systems online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
