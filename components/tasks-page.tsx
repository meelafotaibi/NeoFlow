"use client";

import { useState } from "react";
import { useNeoFlow } from "@/lib/store";
import { GlassCard } from "@/components/glass-card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  CheckSquare,
  Circle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ListTodo,
  Sparkles,
  Tag,
  Timer,
  X,
  Zap,
  Calendar as CalendarIcon,
  LayoutGrid,
} from "lucide-react";
import { type Task, type TaskStatus, type Priority, type SubTask } from "@/lib/types";
import { formatDate } from "@/lib/countdown";
import { cn } from "@/lib/utils";
import { ImagePicker } from "@/components/image-picker";
import { PreciseDateTimePicker } from "@/components/precise-datetime-picker";
import { CalendarView } from "@/components/calendar-view";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleSubtask } = useNeoFlow();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      const matchSub = t.subtasks?.some((st) => st.title.toLowerCase().includes(q));
      if (!matchTitle && !matchTags && !matchSub) return false;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { todo: 0, "in-progress": 1, done: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const todoTasks = sortedTasks.filter((t) => t.status === "todo");
  const inProgressTasks = sortedTasks.filter((t) => t.status === "in-progress");
  const doneTasks = sortedTasks.filter((t) => t.status === "done");

  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            Tasks & Focus Board
            <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Subtask checklists, time estimates & down-to-the-minute scheduling
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "kanban"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 font-semibold glow-blue">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-[540px]">
              <DialogHeader>
                <DialogTitle className="gradient-text text-xl">Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                onSubmit={(task) => {
                  addTask(task);
                  setIsAddOpen(false);
                }}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter & Live Search Toolbar */}
      <div className="glass rounded-xl p-3 border border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Live search tasks, subtasks, tags..."
            className="pl-9 bg-muted/40 border-border/50 text-xs h-9"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as TaskStatus | "all")}
          >
            <SelectTrigger className="w-[130px] bg-muted/40 border-border/50 text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterPriority}
            onValueChange={(v) => setFilterPriority(v as Priority | "all")}
          >
            <SelectTrigger className="w-[130px] bg-muted/40 border-border/50 text-xs h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content: Kanban Columns OR Calendar View */}
      {viewMode === "calendar" ? (
        <CalendarView />
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-bold text-foreground">To Do</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted font-mono">
                {todoTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  onStatusChange={(status) => updateTask(task.id, { status })}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                />
              ))}
              {todoTasks.length === 0 && (
                <div className="glass rounded-lg p-6 text-center text-muted-foreground text-xs border border-dashed border-border/40">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">In Progress</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  onStatusChange={(status) => updateTask(task.id, { status })}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="glass rounded-lg p-6 text-center text-muted-foreground text-xs border border-dashed border-border/40">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-chart-4" />
              <h2 className="font-bold text-foreground">Done</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-chart-4/20 text-chart-4 font-mono font-bold">
                {doneTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  onStatusChange={(status) => updateTask(task.id, { status })}
                  onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                />
              ))}
              {doneTasks.length === 0 && (
                <div className="glass rounded-lg p-6 text-center text-muted-foreground text-xs border border-dashed border-border/40">
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <GlassCard className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-4">
            <CheckSquare className="h-8 w-8 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first task to get started
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </GlassCard>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="glass-card border-border/50 sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              initialData={editingTask}
              onSubmit={(updates) => {
                updateTask(editingTask.id, updates);
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onToggleSubtask: (subId: string) => void;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleSubtask,
}: TaskCardProps) {
  const priorityColors: Record<Priority, string> = {
    low: "text-muted-foreground bg-muted/40 border-border/30",
    medium: "text-accent bg-accent/10 border-accent/30",
    high: "text-destructive bg-destructive/10 border-destructive/30",
  };

  const priorityIcons: Record<Priority, typeof AlertTriangle | null> = {
    low: null,
    medium: null,
    high: AlertTriangle,
  };

  const PriorityIcon = priorityIcons[task.priority];

  const statusButtons: { status: TaskStatus; icon: typeof Circle }[] = [
    { status: "todo", icon: Circle },
    { status: "in-progress", icon: Clock },
    { status: "done", icon: CheckCircle2 },
  ];

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <GlassCard className="relative group border border-border/40 hover:border-primary/40 transition-all">
      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-primary/20"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-destructive/20 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Priority Badge & Time Estimate */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
            priorityColors[task.priority]
          )}
        >
          {PriorityIcon && <PriorityIcon className="h-3 w-3" />}
          {PRIORITY_LABELS[task.priority]} Priority
        </span>

        {task.estimatedMinutes && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full border border-border/30">
            <Timer className="h-3 w-3 text-primary" />
            {task.estimatedMinutes}m est.
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-bold text-base text-foreground pr-12 leading-snug",
          task.status === "done" && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {task.imageUrl && (
        <div className="w-full h-44 rounded-lg overflow-hidden mt-3 border border-border/30 bg-muted/10 flex items-center justify-center">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="max-w-full max-h-full object-cover"
          />
        </div>
      )}

      {/* Subtask Checklist Section */}
      {totalSubtasks > 0 && (
        <div className="mt-3 glass rounded-lg p-2.5 space-y-2 border border-border/30">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <ListTodo className="h-3.5 w-3.5 text-primary" /> Subtasks
            </span>
            <span className="font-mono text-[11px] text-primary font-bold">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>

          <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${subtaskPercent}%` }}
            />
          </div>

          <div className="space-y-1 pt-1">
            {task.subtasks!.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onToggleSubtask(st.id)}
                className="w-full flex items-center gap-2 text-xs text-left p-1 rounded hover:bg-muted/30 transition-all"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                    st.completed
                      ? "bg-chart-4 text-chart-4-foreground border-chart-4"
                      : "border-border/60 hover:border-primary"
                  )}
                >
                  {st.completed && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span
                  className={cn(
                    "truncate text-muted-foreground",
                    st.completed && "line-through text-muted-foreground/60"
                  )}
                >
                  {st.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deadline Countdown */}
      {task.status !== "done" && (
        <div className="mt-3 glass rounded-lg p-2 border border-border/30">
          <CountdownDisplay deadline={task.deadline} size="sm" />
        </div>
      )}

      {/* Status buttons */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
        {statusButtons.map(({ status, icon: Icon }) => (
          <Button
            key={status}
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 h-8 text-xs transition-all",
              task.status === status
                ? status === "done"
                  ? "bg-chart-4/20 text-chart-4 border border-chart-4/30 font-semibold"
                  : status === "in-progress"
                  ? "bg-primary/20 text-primary border border-primary/30 font-semibold"
                  : "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              if (status === "done" && task.status !== "done" && typeof window !== "undefined") {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
                  osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.25);
                  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.35);
                } catch {}
              }
              onStatusChange(status);
            }}
          >
            <Icon className="h-3 w-3 mr-1" />
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
    </GlassCard>
  );
}

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void;
  onCancel: () => void;
}

function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : ""
  );
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "todo");
  const [priority, setPriority] = useState<Priority>(initialData?.priority || "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(
    initialData?.estimatedMinutes ? initialData.estimatedMinutes.toString() : "30"
  );
  const [tagsInput, setTagsInput] = useState<string>(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  // Subtasks list state
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialData?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: SubTask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const est = parseInt(estimatedMinutes);

    onSubmit({
      title,
      deadline: new Date(deadline).toISOString(),
      status,
      priority,
      imageUrl: imageUrl || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      estimatedMinutes: !isNaN(est) && est > 0 ? est : undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Complete project architecture proposal"
          className="bg-muted/50 border-border/50 text-sm font-medium"
          required
        />
      </div>

      {/* Exact Datetime Picker */}
      <PreciseDateTimePicker
        value={deadline}
        onChange={setDeadline}
        label="Exact Task Deadline (Hour & Minute)"
      />

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
            <SelectTrigger className="bg-muted/50 border-border/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger className="bg-muted/50 border-border/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subtask Checklist Creator */}
      <div className="glass rounded-xl p-3 border border-border/40 space-y-2">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <ListTodo className="h-3.5 w-3.5 text-primary" /> Subtasks Checklist
        </Label>
        <div className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            placeholder="Add a step (e.g. Draft outline)..."
            className="bg-muted/50 border-border/50 text-xs h-8"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddSubtask}
            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        {subtasks.length > 0 && (
          <div className="space-y-1 pt-1 max-h-32 overflow-y-auto">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs"
              >
                <span className="truncate text-muted-foreground">{st.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimated Time & Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="est">Est. Minutes</Label>
          <div className="relative">
            <Timer className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="est"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="30"
              className="pl-8 bg-muted/50 border-border/50 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <div className="relative">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="work, urgent, dev"
              className="pl-8 bg-muted/50 border-border/50 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Image Picker */}
      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        titleQuery={title}
        label="Task Cover Image / Picture Attachment"
      />

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 font-semibold"
        >
          {initialData ? "Update" : "Create"} Task
        </Button>
      </div>
    </form>
  );
}
