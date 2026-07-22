export interface Plan {
  id: string;
  title: string;
  category: "study" | "skill" | "life" | "exam" | "habit";
  deadline: string;
  description: string;
  progress: number;
  imageUrl?: string;
  createdAt: string;
  // Daily check-in tracking (date strings as keys, true = completed, false = skipped)
  dailyCheckins?: Record<string, boolean>;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  imageUrl?: string;
  createdAt: string;
  subtasks?: SubTask[];
  estimatedMinutes?: number;
  tags?: string[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  createdAt: string;
  isPurchased?: boolean;
  purchasedAt?: string;
}

export interface TransactionRecord {
  id: string;
  type: "deposit" | "withdrawal" | "purchase" | "refund";
  amount: number;
  description: string;
  createdAt: string;
}

export interface NeoFlowStore {
  plans: Plan[];
  tasks: Task[];
  financialGoals: FinancialGoal[];
  savedAmount: number;
  transactions?: TransactionRecord[];
}

export type CategoryType = Plan["category"];
export type TaskStatus = Task["status"];
export type Priority = Task["priority"];

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  study: "bg-neon-blue",
  skill: "bg-neon-purple",
  life: "bg-neon-cyan",
  exam: "bg-destructive",
  habit: "bg-chart-4",
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  study: "Study",
  skill: "Skill",
  life: "Life",
  exam: "Exam",
  habit: "Habit",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-muted-foreground",
  medium: "text-neon-cyan",
  high: "text-destructive",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-muted",
  "in-progress": "bg-neon-blue",
  done: "bg-chart-4",
};
