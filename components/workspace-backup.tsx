"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useNeoFlow } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Download, Upload, Users, ShieldCheck, Database, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceBackup() {
  const store = useNeoFlow();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<string>("Personal OS");

  // Export current data as JSON file
  const handleExportData = () => {
    const exportData = {
      plans: store.plans,
      tasks: store.tasks,
      financialGoals: store.financialGoals,
      savedAmount: store.savedAmount,
      transactions: store.transactions || [],
      exportedAt: new Date().toISOString(),
      profile: activeProfile,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neoflow-workspace-${activeProfile.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file data
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === "object") {
            if (parsed.savedAmount !== undefined) store.updateSavedAmount(parsed.savedAmount);
            
            // Save imported data directly into local store
            localStorage.setItem("neoflow-data", JSON.stringify(parsed));
            setImportStatus("Workspace restored successfully! Reloading...");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch {
          setImportStatus("Error parsing JSON backup file.");
        }
      };
    }
  };

  return (
    <GlassCard glow="cyan" className="space-y-4 border border-accent/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center glow-cyan">
            <Database className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              Multi-User Sync & Workspace Backup Center
              <ShieldCheck className="h-4 w-4 text-accent" />
            </h3>
            <p className="text-xs text-muted-foreground">
              Export, import, or share full dashboard data files with others
            </p>
          </div>
        </div>

        {/* Profile Switcher Pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
          {["Personal OS", "Business / Work", "Shared Family"].map((prof) => (
            <button
              key={prof}
              onClick={() => setActiveProfile(prof)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1",
                activeProfile === prof
                  ? "bg-accent text-accent-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3 w-3" />
              {prof}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons: Export & Import */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Export Data Button */}
        <div className="glass p-3.5 rounded-xl border border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <Download className="h-4 w-4 text-primary" />
              Export & Collect My Data
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">JSON Backup</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Download your active tasks, plans, savings wallet, and transaction history into a single backup file.
          </p>
          <Button
            onClick={handleExportData}
            className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-semibold h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download Backup (.json)
          </Button>
        </div>

        {/* Import Data Button */}
        <div className="glass p-3.5 rounded-xl border border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-accent" />
              Import Data (Self or Others)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Load JSON</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Import a backup JSON file from another device, teammate, or prior workspace session.
          </p>
          <label className="w-full flex items-center justify-center gap-1.5 bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 text-xs font-semibold h-8 rounded-md cursor-pointer transition-all">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-accent" />
          {importStatus}
        </div>
      )}
    </GlassCard>
  );
}
