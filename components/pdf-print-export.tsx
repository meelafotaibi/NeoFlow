"use client";

import { useNeoFlow } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency } from "@/lib/countdown";

export function PdfPrintExport() {
  const { plans, tasks, financialGoals, savedAmount, transactions } = useNeoFlow();

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const activeGoals = financialGoals.filter((g) => !g.isPurchased);
    const purchasedGoals = financialGoals.filter((g) => g.isPurchased);
    const totalCost = activeGoals.reduce((sum, g) => sum + g.price, 0);
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const avgPlanProgress = plans.length > 0 ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / plans.length) : 0;
    const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const css = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; background: #fff; font-size: 12px; line-height: 1.6; }
      .page { padding: 40px 48px; min-height: 297mm; page-break-after: always; position: relative; }
      .page:last-child { page-break-after: auto; }
      .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
      .brand-dot { width: 32px; height: 32px; background: linear-gradient(135deg, #0284C7, #7C3AED); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 16px; }
      .brand-name { font-size: 20px; font-weight: 900; background: linear-gradient(135deg, #0284C7, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .page-label { position: absolute; top: 40px; right: 48px; font-size: 10px; color: #94A3B8; font-weight: 500; }
      h1.cover-title { font-size: 40px; font-weight: 900; color: #0F172A; line-height: 1.2; margin: 40px 0 12px; }
      .cover-sub { font-size: 16px; color: #475569; margin-bottom: 48px; }
      .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
      .stat-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
      .stat-number { font-size: 28px; font-weight: 900; color: #0284C7; }
      .stat-label { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
      .divider { border: none; border-top: 1px solid #E2E8F0; margin: 24px 0; }
      h2.section-title { font-size: 18px; font-weight: 800; color: #1E293B; margin-bottom: 4px; }
      .section-desc { font-size: 11px; color: #64748B; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #F1F5F9; color: #475569; text-align: left; padding: 10px 14px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 2px solid #E2E8F0; }
      td { padding: 10px 14px; border-bottom: 1px solid #F1F5F9; font-size: 12px; vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
      .badge-blue { background: #DBEAFE; color: #1D4ED8; }
      .badge-green { background: #DCFCE7; color: #15803D; }
      .badge-yellow { background: #FEF9C3; color: #854D0E; }
      .badge-red { background: #FEE2E2; color: #B91C1C; }
      .badge-purple { background: #EDE9FE; color: #6D28D9; }
      .progress-bar-bg { background: #E2E8F0; border-radius: 4px; height: 6px; width: 120px; }
      .progress-bar-fill { background: linear-gradient(90deg, #0284C7, #7C3AED); border-radius: 4px; height: 6px; }
      .footer { position: absolute; bottom: 32px; left: 48px; right: 48px; display: flex; justify-content: space-between; align-items: center; color: #94A3B8; font-size: 10px; border-top: 1px solid #F1F5F9; padding-top: 12px; }
      @media print {
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .page { page-break-after: always; }
      }
    `;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>NeoFlow — Executive Report</title>
  <meta charset="utf-8"/>
  <style>${css}</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page">
  <div class="brand">
    <div class="brand-dot">N</div>
    <span class="brand-name">NeoFlow</span>
  </div>
  <span class="page-label">Page 1 of 5</span>

  <h1 class="cover-title">Personal Productivity<br/>Executive Report</h1>
  <p class="cover-sub">Generated on ${todayStr}</p>
  <hr class="divider"/>

  <div class="stat-grid">
    <div class="stat-box">
      <div class="stat-number">${plans.length}</div>
      <div class="stat-label">Active Plans</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${completedTasks}/${tasks.length}</div>
      <div class="stat-label">Tasks Completed</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">$${savedAmount.toLocaleString()}</div>
      <div class="stat-label">Wallet Savings</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${avgPlanProgress}%</div>
      <div class="stat-label">Avg Plan Progress</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${financialGoals.length}</div>
      <div class="stat-label">Financial Goals</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">$${totalCost.toLocaleString()}</div>
      <div class="stat-label">Goals Target Cost</div>
    </div>
  </div>

  <div class="footer">
    <span>NeoFlow Personal AI Dashboard</span>
    <span>${todayStr}</span>
  </div>
</div>

<!-- PAGE 2: PLANS -->
<div class="page">
  <div class="brand">
    <div class="brand-dot">N</div>
    <span class="brand-name">NeoFlow</span>
  </div>
  <span class="page-label">Page 2 of 5</span>

  <h2 class="section-title">Active Growth Plans</h2>
  <p class="section-desc">All active growth plans, habits, and milestones</p>

  ${plans.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Plan Title</th>
        <th>Category</th>
        <th>Progress</th>
        <th>Deadline</th>
        <th>Check-ins</th>
      </tr>
    </thead>
    <tbody>
      ${plans.map((p) => {
        const checkins = Object.values(p.dailyCheckins || {}).filter((v) => v === true).length;
        const catColors: Record<string, string> = { study: "badge-blue", skill: "badge-purple", life: "badge-green", exam: "badge-red", habit: "badge-yellow" };
        return `<tr>
          <td><strong>${p.title}</strong><br/><span style="color:#94A3B8;font-size:10px">${p.description?.substring(0, 60)}...</span></td>
          <td><span class="badge ${catColors[p.category] || "badge-blue"}">${p.category}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
              <span>${p.progress}%</span>
            </div>
          </td>
          <td>${new Date(p.deadline).toLocaleDateString()}</td>
          <td>${checkins} days completed</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>` : `<p style="color:#94A3B8;text-align:center;padding:40px">No plans created yet.</p>`}

  <div class="footer">
    <span>NeoFlow — Growth Plans Report</span>
    <span>${todayStr}</span>
  </div>
</div>

<!-- PAGE 3: TASKS -->
<div class="page">
  <div class="brand">
    <div class="brand-dot">N</div>
    <span class="brand-name">NeoFlow</span>
  </div>
  <span class="page-label">Page 3 of 5</span>

  <h2 class="section-title">Tasks & Operations Board</h2>
  <p class="section-desc">All tasks grouped by priority and status</p>

  ${tasks.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Task</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Deadline</th>
        <th>Subtasks</th>
      </tr>
    </thead>
    <tbody>
      ${tasks.map((t) => {
        const priColors: Record<string, string> = { high: "badge-red", medium: "badge-yellow", low: "badge-green" };
        const statusColors: Record<string, string> = { todo: "badge-blue", "in-progress": "badge-purple", done: "badge-green" };
        const subtasksDone = (t.subtasks || []).filter((s) => s.completed).length;
        const subtasksTotal = (t.subtasks || []).length;
        return `<tr>
          <td><strong>${t.title}</strong>${t.tags ? `<br/><span style="color:#94A3B8;font-size:10px">${t.tags.map((tg) => '#' + tg).join(" ")}</span>` : ""}</td>
          <td><span class="badge ${priColors[t.priority]}">${t.priority}</span></td>
          <td><span class="badge ${statusColors[t.status]}">${t.status.replace("-", " ")}</span></td>
          <td>${new Date(t.deadline).toLocaleDateString()}</td>
          <td>${subtasksTotal > 0 ? `${subtasksDone}/${subtasksTotal} done` : "—"}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>` : `<p style="color:#94A3B8;text-align:center;padding:40px">No tasks created yet.</p>`}

  <div class="footer">
    <span>NeoFlow — Tasks Report</span>
    <span>${todayStr}</span>
  </div>
</div>

<!-- PAGE 4: FINANCE -->
<div class="page">
  <div class="brand">
    <div class="brand-dot">N</div>
    <span class="brand-name">NeoFlow</span>
  </div>
  <span class="page-label">Page 4 of 5</span>

  <h2 class="section-title">Financial Goals & Ledger</h2>
  <p class="section-desc">Savings wallet, financial goals, and transaction history</p>

  <div class="stat-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 24px;">
    <div class="stat-box">
      <div class="stat-number">$${savedAmount.toLocaleString()}</div>
      <div class="stat-label">Current Wallet Balance</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">$${totalCost.toLocaleString()}</div>
      <div class="stat-label">Remaining Goal Cost</div>
    </div>
  </div>

  <h2 class="section-title" style="font-size:14px;margin-bottom:12px">Goals</h2>
  ${financialGoals.length > 0 ? `
  <table>
    <thead><tr><th>Goal</th><th>Price</th><th>Status</th><th>Affordable</th></tr></thead>
    <tbody>
      ${financialGoals.map((g) => `<tr>
        <td><strong>${g.name}</strong></td>
        <td>$${g.price.toLocaleString()}</td>
        <td><span class="badge ${g.isPurchased ? "badge-green" : "badge-blue"}">${g.isPurchased ? "Fulfilled" : "Active"}</span></td>
        <td>${savedAmount >= g.price ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-yellow">Saving</span>'}</td>
      </tr>`).join("")}
    </tbody>
  </table>` : `<p style="color:#94A3B8;text-align:center;padding:24px">No financial goals yet.</p>`}

  <hr class="divider"/>
  <h2 class="section-title" style="font-size:14px;margin-bottom:12px">Recent Transactions</h2>
  ${(transactions || []).length > 0 ? `
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead>
    <tbody>
      ${(transactions || []).slice(0, 15).map((tx) => {
        const txColors: Record<string, string> = { deposit: "badge-green", withdrawal: "badge-red", purchase: "badge-purple", refund: "badge-blue" };
        return `<tr>
          <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
          <td><span class="badge ${txColors[tx.type] || "badge-blue"}">${tx.type}</span></td>
          <td>$${tx.amount.toLocaleString()}</td>
          <td>${tx.description}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>` : `<p style="color:#94A3B8;text-align:center;padding:24px">No transactions yet.</p>`}

  <div class="footer">
    <span>NeoFlow — Financial Report</span>
    <span>${todayStr}</span>
  </div>
</div>

<!-- PAGE 5: ANALYTICS -->
<div class="page">
  <div class="brand">
    <div class="brand-dot">N</div>
    <span class="brand-name">NeoFlow</span>
  </div>
  <span class="page-label">Page 5 of 5</span>

  <h2 class="section-title">Analytics & Executive Insights</h2>
  <p class="section-desc">Productivity metrics, streaks, and performance overview</p>

  <div class="stat-grid">
    <div class="stat-box">
      <div class="stat-number">${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</div>
      <div class="stat-label">Task Completion Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${avgPlanProgress}%</div>
      <div class="stat-label">Avg Plan Progress</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${plans.reduce((s, p) => s + Object.values(p.dailyCheckins || {}).filter((v) => v).length, 0)}</div>
      <div class="stat-label">Total Check-in Days</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${purchasedGoals.length}</div>
      <div class="stat-label">Goals Achieved</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${(transactions || []).filter((t) => t.type === "deposit").length}</div>
      <div class="stat-label">Total Deposits</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${tasks.filter((t) => t.priority === "high" && t.status !== "done").length}</div>
      <div class="stat-label">High-Priority Pending</div>
    </div>
  </div>

  <hr class="divider"/>
  <h2 class="section-title" style="font-size:14px;margin-bottom:16px">Plan Streak Summary</h2>
  ${plans.length > 0 ? `
  <table>
    <thead><tr><th>Plan</th><th>Category</th><th>Check-in Days</th><th>Progress</th></tr></thead>
    <tbody>
      ${plans.map((p) => {
        const checkins = Object.values(p.dailyCheckins || {}).filter((v) => v).length;
        return `<tr>
          <td><strong>${p.title}</strong></td>
          <td>${p.category}</td>
          <td>${checkins} days completed</td>
          <td>${p.progress}%</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>` : `<p style="color:#94A3B8;text-align:center;padding:24px">No plans yet.</p>`}

  <div style="margin-top:40px;padding:20px;background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;text-align:center">
    <p style="font-size:14px;font-weight:700;color:#0F172A">Optimized Executive Performance Report</p>
    <p style="font-size:11px;color:#64748B;margin-top:6px">Generated by NeoFlow Personal AI Dashboard · ${todayStr}</p>
  </div>

  <div class="footer">
    <span>NeoFlow — Analytics Summary</span>
    <span>End of Report</span>
  </div>
</div>

</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 600);
  };

  return (
    <Button
      onClick={handlePrintPdf}
      variant="outline"
      className="border-border/50 hover:bg-muted/50 text-xs font-semibold"
    >
      <Printer className="h-3.5 w-3.5 mr-1.5" />
      Print PDF Report
    </Button>
  );
}
