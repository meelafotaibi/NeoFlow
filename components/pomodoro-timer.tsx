"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
} from "lucide-react";
import { useNeoFlow } from "@/lib/store";
import { cn } from "@/lib/utils";

type Mode = "work" | "shortBreak" | "longBreak";

const MODE_TIMES: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  work: "Deep Work Session",
  shortBreak: "Short Break",
  longBreak: "Recharge Break",
};

export function PomodoroTimer() {
  const { tasks, updateTask } = useNeoFlow();
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Play audio chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playChime();
      if (mode === "work") {
        setCompletedSessions((prev) => prev + 1);
        if (selectedTaskId) {
          updateTask(selectedTaskId, { status: "done" });
        }
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeLeft, mode, selectedTaskId, updateTask, soundEnabled]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const totalSeconds = MODE_TIMES[mode];
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <GlassCard glow={mode === "work" ? "blue" : "cyan"} className="relative overflow-hidden">
      {/* Background Pulse Glow when Active */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none rounded-xl" />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Focus Studio
              {completedSessions > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-mono">
                  ⚡ {completedSessions} session{completedSessions > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">{MODE_LABELS[mode]}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute audio notification" : "Enable audio notification"}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mode Selectors */}
      <div className="flex gap-1 p-1 glass rounded-lg mb-4">
        {(["work", "shortBreak", "longBreak"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={cn(
              "flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all",
              mode === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "work" ? "Focus" : m === "shortBreak" ? "Break" : "Rest"}
          </button>
        ))}
      </div>

      {/* Active Task Selector */}
      <div className="mb-4">
        <label className="text-[11px] text-muted-foreground mb-1 block font-medium">
          Target Task to Attach:
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full bg-muted/40 text-foreground border border-border/50 rounded-lg p-2 text-xs outline-none focus:border-primary"
        >
          <option value="">-- Select a Task to Auto-Complete --</option>
          {tasks
            .filter((t) => t.status !== "done")
            .map((t) => (
              <option key={t.id} value={t.id}>
                [{t.priority.toUpperCase()}] {t.title}
              </option>
            ))}
        </select>
        {activeTask && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-accent">
            <Target className="h-3 w-3" />
            <span className="truncate">Active: {activeTask.title}</span>
          </div>
        )}
      </div>

      {/* Display Counter */}
      <div className="text-center py-4 glass rounded-xl relative">
        <div className="text-5xl font-mono font-bold tracking-tight text-foreground">
          {formatTime}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-muted/30 h-1.5 rounded-full overflow-hidden mt-4 px-2">
          <div
            className="bg-gradient-to-r from-primary via-secondary to-accent h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "flex-1 font-semibold transition-all",
            isActive
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
              : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 glow-blue"
          )}
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 mr-2" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" /> Start Focus
            </>
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={resetTimer} className="border-border/50">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
}
