import { type CategoryType } from "@/lib/types";

export interface AiStrategyResponse {
  type: string;
  headline: string;
  actionSteps: string[];
  impactScore: string;
  suggestedType: "plan" | "task";
  category?: CategoryType;
  suggestedTitle: string;
  suggestedDescription?: string;
  suggestedSubtasks?: string[];
  priority?: "low" | "medium" | "high";
  mathAnswer?: string;
}

export interface AiContext {
  tasksCount: number;
  urgentTaskTitle?: string;
  plansCount: number;
  savedAmount: number;
  totalGoalCost: number;
  productivityIndex: number;
  tasksDueToday?: number;
  monthlySavingsRate?: number;
}

export async function fetchGeminiAiAdvice(
  userQuery: string,
  contextData: AiContext
): Promise<AiStrategyResponse> {
  const q = userQuery.toLowerCase().trim();

  // Price & Savings Calculation Engine
  const priceMatch = q.match(/\$?([\d,]+)/);
  const mentionedPrice = priceMatch ? parseInt(priceMatch[1].replace(",", "")) : 0;
  const monthlyRate = contextData.monthlySavingsRate || 500;

  if ((q.includes("month") || q.includes("how long") || q.includes("when")) &&
      (q.includes("mac") || q.includes("buy") || q.includes("afford") || mentionedPrice > 0)) {
    const targetPrice = mentionedPrice > 0 ? mentionedPrice : 1299;
    const gap = Math.max(0, targetPrice - contextData.savedAmount);
    const monthsNeeded = gap > 0 ? Math.ceil(gap / monthlyRate) : 0;
    const weeksNeeded = monthsNeeded * 4;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

    return {
      type: "Financial Calculation",
      headline: monthsNeeded === 0 ? "You can buy it NOW!" : `${monthsNeeded} months to reach $${targetPrice.toLocaleString()}`,
      mathAnswer: monthsNeeded === 0
        ? `You already have $${contextData.savedAmount.toLocaleString()} - enough to buy it right now!`
        : `You need $${gap.toLocaleString()} more. At $${monthlyRate.toLocaleString()}/month, that is ${monthsNeeded} months (~${weeksNeeded} weeks). Target date: ${targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
      suggestedType: "plan",
      suggestedTitle: `Save for $${targetPrice.toLocaleString()} Purchase Goal`,
      suggestedDescription: `Monthly savings plan to reach $${targetPrice.toLocaleString()} in ${monthsNeeded} months`,
      category: "life",
      actionSteps: [
        `Current wallet: $${contextData.savedAmount.toLocaleString()} | Gap: $${gap.toLocaleString()}`,
        `At $${monthlyRate.toLocaleString()}/month rate -> ${monthsNeeded} months (${targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })})`,
        `Boost monthly savings to $${(monthlyRate * 1.5).toLocaleString()} to hit it in ${Math.ceil(gap / (monthlyRate * 1.5))} months instead.`,
      ],
      impactScore: `${monthsNeeded}mo Timeline`,
    };
  }

  // Tasks due today
  if (q.includes("task") && (q.includes("today") || q.includes("how many") || q.includes("left"))) {
    const todayCount = contextData.tasksDueToday || 0;
    return {
      type: "Daily Task Briefing",
      headline: `${todayCount} task${todayCount !== 1 ? "s" : ""} due today`,
      mathAnswer: todayCount === 0
        ? "No tasks due today - perfect moment to get ahead on tomorrow's queue!"
        : `You have ${todayCount} task${todayCount !== 1 ? "s" : ""} due today. Start with your highest-priority item first.`,
      suggestedType: "task",
      suggestedTitle: `Clear today's ${todayCount} task${todayCount !== 1 ? "s" : ""}`,
      actionSteps: [
        `${todayCount} task${todayCount !== 1 ? "s" : ""} due today (${contextData.tasksCount} total in queue)`,
        `Top priority: "${contextData.urgentTaskTitle || "Review your task board"}"`,
        `Run a 25-min Pomodoro sprint to eliminate the first task immediately.`,
      ],
      impactScore: "+30% Daily Output",
    };
  }

  // Islamic Prayers
  if (q.includes("pray") || q.includes("prayer") || q.includes("salah") || q.includes("salat") ||
      q.includes("fajr") || q.includes("dhuhr") || q.includes("asr") || q.includes("maghrib") || q.includes("isha")) {
    return {
      type: "Islamic Prayer Habit Plan",
      headline: `5 Daily Prayers Productivity System`,
      mathAnswer: `Praying all 5 prayers is a strong daily productivity anchor. Each prayer serves as a natural time-block structuring your day into 5 focused work sessions.`,
      suggestedType: "plan",
      suggestedTitle: "5 Daily Prayers - Anchor Routine",
      suggestedDescription: "Track Fajr, Dhuhr, Asr, Maghrib & Isha with daily check-ins and build a consistent streak",
      category: "habit",
      suggestedSubtasks: [
        "Fajr - Before sunrise (Sunnah + Fard)",
        "Dhuhr - Midday prayer (Focus break)",
        "Asr - Afternoon prayer (Energy reset)",
        "Maghrib - Sunset prayer (Day review)",
        "Isha - Night prayer (Reflection & rest)",
      ],
      actionSteps: [
        `Create a daily check-in plan with all 5 prayers as milestones - check in daily to build your streak.`,
        `Use each prayer as a natural Pomodoro block divider - work deeply between each prayer.`,
        `Set phone reminders for Fajr, Dhuhr, Asr, Maghrib, and Isha.`,
      ],
      impactScore: "+50% Life Balance",
    };
  }

  // Hydration
  if (q.includes("water") || q.includes("drink") || q.includes("hydrat") || q.includes("thirst")) {
    return {
      type: "Hydration Habit Tracker",
      headline: `Daily Water Intake Counter & Lifetime Tracker`,
      mathAnswer: `Recommended daily intake is 8 glasses (2L) of water per day.`,
      suggestedType: "plan",
      suggestedTitle: "Daily Water Intake - 8 Glasses Goal",
      suggestedDescription: "Track 8 glasses of water daily to maintain peak physical and cognitive energy",
      category: "habit",
      suggestedSubtasks: [
        "Glass 1 - Morning wake-up",
        "Glass 2 - Mid-morning",
        "Glass 3 - Before lunch",
        "Glass 4 - After lunch",
        "Glass 5 - Mid-afternoon",
        "Glass 6 - Late afternoon",
        "Glass 7 - With dinner",
        "Glass 8 - Evening",
      ],
      actionSteps: [
        `Goal: 8 glasses (2L) daily. Keep a water bottle on your desk at all times.`,
        `Check in daily to build your hydration streak.`,
        `Set reminders every 2 hours for optimal hydration.`,
      ],
      impactScore: "+40% Energy & Focus",
    };
  }

  // Programming & Skills
  if (q.includes("programming") || q.includes("coding") || q.includes("developer") ||
      q.includes("software") || q.includes("flutter") || q.includes("react") ||
      q.includes("python") || q.includes("javascript") || q.includes("code")) {
    const lang = q.includes("flutter") ? "Flutter/Dart" : q.includes("python") ? "Python"
      : q.includes("javascript") ? "JavaScript" : q.includes("react") ? "React/Next.js" : "Programming";
    return {
      type: "Skill Mastery Roadmap",
      headline: `${lang} Development Mastery Plan`,
      suggestedType: "plan",
      suggestedTitle: `Master ${lang} - 90-Day Skill Plan`,
      suggestedDescription: `Daily coding practice, project building, and skill progression roadmap for ${lang}`,
      category: "skill",
      suggestedSubtasks: [
        "Week 1-2: Core syntax, data types & control flow",
        "Week 3-4: Functions, OOP & state management",
        "Week 5-8: Build first real project",
        "Week 9-12: Deploy production app",
      ],
      actionSteps: [
        `Phase 1 (Days 1-30): Master ${lang} fundamentals - 1 hour daily minimum.`,
        `Phase 2 (Days 31-60): Build a real project from scratch - ship it publicly.`,
        `Phase 3 (Days 61-90): Add advanced features, optimize, and expand your portfolio.`,
      ],
      impactScore: "+45% Dev Velocity",
    };
  }

  // Workout / Fitness
  if (q.includes("workout") || q.includes("gym") || q.includes("exercise") ||
      q.includes("fitness") || q.includes("run") || q.includes("sport")) {
    return {
      type: "Fitness Habit Plan",
      headline: `Daily Workout & Fitness Routine`,
      suggestedType: "plan",
      suggestedTitle: "Daily Workout - 45min Fitness Plan",
      suggestedDescription: "Build a consistent daily exercise habit with progressive strength training",
      category: "habit",
      suggestedSubtasks: [
        "10-min warm-up & stretching",
        "25-min strength or cardio training",
        "5-min cooldown & mindfulness",
        "Log workout in daily check-in",
      ],
      actionSteps: [
        `Commit to 45 minutes of daily exercise.`,
        `Progressive overload: increase intensity 10% each week.`,
        `Check in daily on your plan to build a visible streak.`,
      ],
      impactScore: "+35% Energy & Mental Clarity",
    };
  }

  // Meditation
  if (q.includes("meditat") || q.includes("mindful") || q.includes("breathe") ||
      q.includes("calm") || q.includes("stress") || q.includes("anxiety")) {
    return {
      type: "Mindfulness Practice Plan",
      headline: `Daily Meditation & Mindfulness Routine`,
      suggestedType: "plan",
      suggestedTitle: "10-Min Daily Meditation Practice",
      suggestedDescription: "Morning breathwork and mindfulness to build clarity, focus, and emotional resilience",
      category: "habit",
      suggestedSubtasks: [
        "Morning: 5-min breathing exercise",
        "Mid-day: 3-min mindful pause between tasks",
        "Evening: 5-min gratitude & reflection journaling",
      ],
      actionSteps: [
        `Start each morning with 10 minutes of box breathing.`,
        `Use the daily check-in to track your streak.`,
        `Evening: write 3 things you are grateful for before sleep.`,
      ],
      impactScore: "+30% Mental Clarity",
    };
  }

  // Study & Exam Prep
  if (q.includes("study") || q.includes("exam") || q.includes("step") ||
      q.includes("test") || q.includes("learn") || q.includes("course")) {
    return {
      type: "Study & Exam Mastery",
      headline: `Structured Study & Exam Preparation Plan`,
      suggestedType: "plan",
      suggestedTitle: "Daily 2-Hour Study Block",
      suggestedDescription: "Dedicated daily study sessions with spaced repetition and Pomodoro sprints",
      category: "study",
      suggestedSubtasks: [
        "Session 1: 25-min deep reading & notes",
        "Session 2: 25-min active recall & practice questions",
        "Session 3: 25-min review weak areas",
        "Session 4: 15-min summary & flashcard review",
      ],
      actionSteps: [
        `Block 2 hours daily for deep study - no distractions, full focus.`,
        `Use spaced repetition: review yesterday's material for 10 mins before starting new content.`,
        `Practice past exams under timed conditions.`,
      ],
      impactScore: "+50% Exam Readiness",
    };
  }

  // Default response
  const isHabitLike = q.includes("everyday") || q.includes("daily") || q.includes("habit") ||
    q.includes("routine") || q.includes("always") || q.includes("consistent");

  const suggestedType: "plan" | "task" = isHabitLike ? "plan" : "task";
  const title = userQuery.trim().charAt(0).toUpperCase() + userQuery.trim().slice(1);

  return {
    type: suggestedType === "plan" ? "Habit & Routine Plan" : "Actionable Task",
    headline: `AI Strategy for "${title}"`,
    suggestedType,
    suggestedTitle: title,
    suggestedDescription: `Structured execution approach for: ${title}`,
    category: suggestedType === "plan" ? "life" : undefined,
    priority: "high",
    actionSteps: [
      `AI classified this as a ${suggestedType === "plan" ? "recurring PLAN" : "one-time TASK"}.`,
      `Click "${suggestedType === "plan" ? "+ Add as Active Plan" : "+ Add as Priority Task"}" to instantly create it.`,
      `Start a 25-minute Focus Sprint immediately after adding it to your board.`,
    ],
    impactScore: "+25% Execution Speed",
  };
}
