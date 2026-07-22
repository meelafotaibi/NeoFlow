"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useNeoFlow } from "@/lib/store";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/types";

export function CalendarView() {
  const { tasks, plans } = useNeoFlow();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Collect all items mapped by date string (YYYY-MM-DD)
  const itemsByDate: Record<string, { type: "task" | "plan"; title: string; priority?: string; status?: string; category?: string }[]> = {};

  tasks.forEach((t) => {
    try {
      const dStr = new Date(t.deadline).toISOString().split("T")[0];
      if (!itemsByDate[dStr]) itemsByDate[dStr] = [];
      itemsByDate[dStr].push({
        type: "task",
        title: t.title,
        priority: t.priority,
        status: t.status,
      });
    } catch {}
  });

  plans.forEach((p) => {
    try {
      const dStr = new Date(p.deadline).toISOString().split("T")[0];
      if (!itemsByDate[dStr]) itemsByDate[dStr] = [];
      itemsByDate[dStr].push({
        type: "plan",
        title: p.title,
        category: p.category,
      });
    } catch {}
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedItems = itemsByDate[selectedDateStr] || [];

  return (
    <GlassCard glow="purple" className="space-y-4 border border-border/40">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              Interactive Calendar & Timeline
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Mapped deadlines for tasks & plans
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg glass hover:bg-muted/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold font-mono text-foreground">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg glass hover:bg-muted/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-10 rounded-lg bg-transparent" />
        ))}

        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayDate = new Date(year, month, dayNum);
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const dayItems = itemsByDate[dateStr] || [];

          return (
            <button
              key={dayNum}
              onClick={() => setSelectedDateStr(dateStr)}
              className={cn(
                "h-10 rounded-lg p-1 flex flex-col items-center justify-between transition-all border relative",
                isToday ? "ring-1 ring-primary font-bold" : "",
                isSelected
                  ? "bg-secondary/20 border-secondary/50 text-secondary"
                  : "glass hover:bg-muted/40 border-border/30 text-foreground"
              )}
            >
              <span className="text-[11px] font-mono leading-none">{dayNum}</span>

              {/* Indicator Dots */}
              {dayItems.length > 0 && (
                <div className="flex gap-0.5 items-center justify-center">
                  {dayItems.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.type === "plan" ? "bg-primary" : "bg-accent"
                      )}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[8px] font-mono text-muted-foreground">+</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda Drawer */}
      <div className="glass rounded-xl p-3 border border-border/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            Agenda for {new Date(selectedDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} due
          </span>
        </div>

        {selectedItems.length > 0 ? (
          <div className="space-y-1.5">
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                className="glass p-2 rounded-lg flex items-center justify-between text-xs border border-border/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0",
                      item.type === "plan"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-accent/20 text-accent border border-accent/30"
                    )}
                  >
                    {item.type}
                  </span>
                  <span className="font-medium truncate text-foreground">{item.title}</span>
                </div>
                {item.status === "done" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground py-1 text-center">
            No deadlines scheduled for this date.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
