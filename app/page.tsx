"use client";

import { useState } from "react";
import { NeoFlowProvider } from "@/lib/store";
import { AuthGate } from "@/components/auth-gate";
import { Sidebar, type NavItem } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { PlansPage } from "@/components/plans-page";
import { TasksPage } from "@/components/tasks-page";
import { FinancePage } from "@/components/finance-page";
import { AnalyticsPage } from "@/components/analytics-page";
import { HistoryPage } from "@/components/history-page";
import { QuickCommandPalette } from "@/components/quick-command-palette";

function NeoFlowApp() {
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");

  const handleNavigate = (item: NavItem | string) => {
    if (["dashboard", "plans", "tasks", "finance", "analytics", "history"].includes(item)) {
      setActiveNav(item as NavItem);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />
      <QuickCommandPalette onNavigate={handleNavigate} />

      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 pt-16 lg:pt-6 lg:p-6 max-w-7xl mx-auto">
          <div className="page-transition">
            {activeNav === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
            {activeNav === "plans" && <PlansPage />}
            {activeNav === "tasks" && <TasksPage />}
            {activeNav === "finance" && <FinancePage />}
            {activeNav === "analytics" && <AnalyticsPage />}
            {activeNav === "history" && <HistoryPage />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <NeoFlowProvider>
      <AuthGate>
        <NeoFlowApp />
      </AuthGate>
    </NeoFlowProvider>
  );
}
