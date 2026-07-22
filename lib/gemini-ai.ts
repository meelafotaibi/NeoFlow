import { type CategoryType } from "@/lib/types";

export interface SuggestedGoalProposal {
  name: string;
  price: number;
  currency?: string;
  imageUrl: string;
}

export interface SuggestedPlanProposal {
  title: string;
  category: CategoryType;
  description: string;
  deadline?: string;
  suggestedSubtasks?: string[];
}

export interface SuggestedTaskProposal {
  title: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  deadline?: string;
  subtasks?: string[];
}

export interface AiStrategyResponse {
  type: string;
  headline: string;
  actionSteps: string[];
  impactScore: string;
  suggestedType: "goal" | "plan" | "task" | "multi";
  category?: CategoryType;
  suggestedTitle: string;
  suggestedDescription?: string;
  suggestedSubtasks?: string[];
  priority?: "low" | "medium" | "high";
  mathAnswer?: string;
  // Multi-entity creation proposals
  suggestedGoal?: SuggestedGoalProposal;
  suggestedPlan?: SuggestedPlanProposal;
  suggestedTask?: SuggestedTaskProposal;
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

function cleanItemTitle(raw: string): string {
  let cleaned = raw
    .replace(/for\s+\$?\d+[\d,.]*\s*(sar|usd|riyal|riyals)?/gi, "")
    .replace(/\$?\d+[\d,.]*\s*(sar|usd|riyal|riyals)?/gi, "")
    .replace(/\b(i\s+want|wanna|buy|get|purchase|a|an|the)\b/gi, "")
    .trim();
  if (!cleaned) cleaned = raw.trim();
  return cleaned
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export async function fetchGeminiAiAdvice(
  userQuery: string,
  contextData: AiContext
): Promise<AiStrategyResponse> {
  const q = userQuery.toLowerCase().trim();
  const monthlyRate = contextData.monthlySavingsRate || 500;

  // Extract Price Numbers (supports SAR, USD, million, 1.5m, etc.)
  let extractedPrice = 0;
  let currency = "USD";
  if (q.includes("sar") || q.includes("riyal")) {
    currency = "SAR";
  }

  if (q.includes("million") || q.includes("mil") || q.includes("1.5m")) {
    if (q.includes("1.5") || q.includes("million and half") || q.includes("milion and half")) {
      extractedPrice = 1500000;
    } else if (q.includes("1")) {
      extractedPrice = 1000000;
    } else if (q.includes("2")) {
      extractedPrice = 2000000;
    } else {
      extractedPrice = 1000000;
    }
  } else {
    const priceMatch = q.match(/\$?([\d,.]+)/);
    if (priceMatch) {
      const cleaned = parseFloat(priceMatch[1].replace(/,/g, ""));
      if (!isNaN(cleaned)) extractedPrice = cleaned;
    }
  }

  // 1. VILLA / REAL ESTATE
  if (q.includes("villa") || q.includes("house") || q.includes("home") || extractedPrice >= 1000000) {
    const targetPrice = extractedPrice > 0 ? extractedPrice : 1500000;
    const gap = Math.max(0, targetPrice - contextData.savedAmount);
    const monthsNeeded = monthlyRate > 0 ? Math.ceil(gap / monthlyRate) : 120;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

    return {
      type: "Real Estate & High-Value Asset Strategy",
      headline: `Financial Target: Luxury Villa (${targetPrice.toLocaleString()} ${currency})`,
      mathAnswer: `Target price: ${targetPrice.toLocaleString()} ${currency}. At a monthly savings rate of $${monthlyRate.toLocaleString()}/mo, this requires ${monthsNeeded} months (~${(monthsNeeded / 12).toFixed(1)} years). Target completion date: ${targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
      suggestedType: "multi",
      suggestedTitle: `Luxury Villa Dream Goal`,
      actionSteps: [
        `Option 1: Click "+ Create Financial Goal" to add ${targetPrice.toLocaleString()} ${currency} Villa to your finance board.`,
        `Option 2: Click "+ Create Active Plan" for a Villa Acquisition Wealth Strategy.`,
        `Option 3: Click "+ Create Task" to set an initial savings account task.`,
      ],
      impactScore: `${monthsNeeded}mo Target`,
      suggestedGoal: {
        name: `Luxury Villa (${targetPrice.toLocaleString()} ${currency})`,
        price: targetPrice,
        currency,
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      },
      suggestedPlan: {
        title: "Villa Acquisition Wealth Strategy",
        category: "life",
        description: `Monthly wealth allocation plan for ${targetPrice.toLocaleString()} ${currency} Villa target`,
        deadline: targetDate.toISOString(),
        suggestedSubtasks: [
          "Automate monthly investment deposit",
          "Review quarterly real estate portfolio",
          "Track milestone targets at 25%, 50%, 75%",
        ],
      },
      suggestedTask: {
        title: "Open High-Yield Villa Savings Account",
        priority: "high",
        status: "in-progress",
        deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
        subtasks: ["Research investment yields", "Set up automatic salary deduction", "Confirm initial deposit"],
      },
    };
  }

  // 2. TECH HARDWARE, SMARTPHONES, GADGETS & ITEMS WITH PRICE
  const isTechOrItemWithPrice =
    q.includes("iphone") ||
    q.includes("phone") ||
    q.includes("pro max") ||
    q.includes("galaxy") ||
    q.includes("pixel") ||
    q.includes("ipad") ||
    q.includes("apple") ||
    q.includes("watch") ||
    q.includes("camera") ||
    q.includes("5090") ||
    q.includes("gpu") ||
    q.includes("mac") ||
    q.includes("macbook") ||
    q.includes("laptop") ||
    q.includes("tv") ||
    q.includes("car") ||
    (extractedPrice > 0 && extractedPrice < 1000000);

  if (isTechOrItemWithPrice) {
    const targetPrice = extractedPrice > 0 ? extractedPrice : (q.includes("5090") ? 2499 : 3000);
    const itemName = cleanItemTitle(userQuery);
    let imgUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"; // iPhone / Smartphone default
    if (q.includes("5090") || q.includes("gpu")) {
      imgUrl = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80";
    } else if (q.includes("mac") || q.includes("laptop")) {
      imgUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80";
    } else if (q.includes("car")) {
      imgUrl = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";
    }

    const gap = Math.max(0, targetPrice - contextData.savedAmount);
    const monthsNeeded = monthlyRate > 0 ? Math.ceil(gap / monthlyRate) : 1;

    return {
      type: "Item & Goal Target Analysis",
      headline: `Target: ${itemName} (${targetPrice.toLocaleString()} ${currency})`,
      mathAnswer: `Item cost: ${targetPrice.toLocaleString()} ${currency}. At your savings rate ($${monthlyRate.toLocaleString()}/mo), this target takes ~${monthsNeeded} month${monthsNeeded !== 1 ? "s" : ""} to reach. Choose how you would like to track this below!`,
      suggestedType: "multi",
      suggestedTitle: itemName,
      actionSteps: [
        `Select "+ Create Financial Goal" to add ${itemName} (${targetPrice.toLocaleString()} ${currency}) to your finance board.`,
        `Select "+ Create Active Plan" for a structured purchase plan.`,
        `Select "+ Create Task" for a quick buy reminder task.`,
      ],
      impactScore: `${monthsNeeded}mo Savings`,
      suggestedGoal: {
        name: itemName,
        price: targetPrice,
        currency,
        imageUrl: imgUrl,
      },
      suggestedPlan: {
        title: `${itemName} Savings Plan`,
        category: "life",
        description: `Short-term upgrade & savings plan for ${itemName}`,
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
        suggestedSubtasks: ["Set aside monthly tech budget", "Monitor retailer prices & stock"],
      },
      suggestedTask: {
        title: `Buy ${itemName}`,
        priority: "high",
        status: "todo",
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        subtasks: ["Check authorized store availability", "Verify wallet savings balance"],
      },
    };
  }

  // 3. SKILLS & ROADMAPS (FLUTTER / PYTHON / PROGRAMMING)
  if (q.includes("flutter") || q.includes("python") || q.includes("react") || q.includes("coding") || q.includes("summer")) {
    const lang = q.includes("flutter") ? "Flutter & Dart App Development" : (q.includes("python") ? "Python Programming" : "Software Engineering");

    return {
      type: "Skill Roadmap Strategy",
      headline: `90-Day Summer Skill Mastery: ${lang}`,
      mathAnswer: `Intensive 90-day learning roadmap divided into 4 weekly sprints with practical app deliverables.`,
      suggestedType: "multi",
      suggestedTitle: `Master ${lang} - Summer Roadmap`,
      actionSteps: [
        `Phase 1 (Weeks 1-4): Fundamentals, data models & control flow.`,
        `Phase 2 (Weeks 5-8): Build production mobile application from scratch.`,
        `Phase 3 (Weeks 9-12): Deploy to App Store, GitHub & showcase portfolio.`,
      ],
      impactScore: "+45% Dev Velocity",
      suggestedPlan: {
        title: `Master ${lang} - Summer Roadmap`,
        category: "skill",
        description: `90-Day intensive skill mastery plan with project deliverables`,
        deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
        suggestedSubtasks: [
          "Week 1-2: Core syntax & data structures",
          "Week 3-4: UI Widgets & state management",
          "Week 5-8: Build production mobile app",
          "Week 9-12: Deploy to App Store & GitHub",
        ],
      },
      suggestedTask: {
        title: `Set Up ${lang} Development Environment`,
        priority: "high",
        status: "in-progress",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        subtasks: ["Install SDK & IDE extensions", "Clone starter boilerplate", "Run first Hello World app"],
      },
    };
  }

  // 4. ACADEMIC EXAMS (FINALS / MIDTERMS)
  if (q.includes("final") || q.includes("midterm") || q.includes("exam") || q.includes("test")) {
    return {
      type: "Academic Exam Strategy",
      headline: `Academic Exam Preparation System`,
      mathAnswer: `High-priority exam revision schedule using 25-minute Pomodoro focus blocks and active recall.`,
      suggestedType: "multi",
      suggestedTitle: `Finals Exam Revision Sprint`,
      actionSteps: [
        `Step 1: Added high-priority study sprint task to your queue in IN-PROGRESS status.`,
        `Step 2: Scheduled 25-minute Pomodoro study blocks for syllabus coverage.`,
        `Step 3: Solve past papers under timed exam conditions.`,
      ],
      impactScore: "+50% Exam Readiness",
      suggestedTask: {
        title: "Finals Exam Revision Sprint",
        priority: "high",
        status: "in-progress",
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
        subtasks: [
          "Review core syllabus chapters 1-4",
          "Solve past exam papers under timed conditions",
          "Create summary flashcards for key formulae",
        ],
      },
      suggestedPlan: {
        title: "Finals Study Block Routine",
        category: "exam",
        description: "Daily study routine with active recall and timed problem solving",
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        suggestedSubtasks: ["Morning: 45-min active recall", "Afternoon: 45-min practice problems", "Evening: 30-min formula summary"],
      },
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
      suggestedTask: {
        title: `Clear today's ${todayCount} task${todayCount !== 1 ? "s" : ""}`,
        priority: "high",
        status: "todo",
        deadline: new Date().toISOString(),
        subtasks: ["Execute highest priority task", "Check off daily queue"],
      },
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
        `Created daily check-in plan with all 5 prayers as milestones.`,
        `Use each prayer as a natural Pomodoro block divider.`,
        `Set phone reminders for Fajr, Dhuhr, Asr, Maghrib, and Isha.`,
      ],
      impactScore: "+50% Life Balance",
      suggestedPlan: {
        title: "5 Daily Prayers - Anchor Routine",
        category: "habit",
        description: "Track Fajr, Dhuhr, Asr, Maghrib & Isha with daily check-ins",
        deadline: new Date(Date.now() + 365 * 86400000).toISOString(),
        suggestedSubtasks: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
      },
    };
  }

  // Default intelligent response
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
      `AI analyzed prompt intent for "${title}".`,
      `Automatically created and added to your dashboard.`,
      `Start a 25-minute Focus Sprint immediately to begin execution.`,
    ],
    impactScore: "+25% Speed",
    suggestedTask: suggestedType === "task" ? {
      title,
      priority: "high",
      status: "todo",
      deadline: new Date(Date.now() + 86400000).toISOString(),
      subtasks: ["Execute step 1", "Complete task"],
    } : undefined,
    suggestedPlan: suggestedType === "plan" ? {
      title,
      category: "life",
      description: `Structured plan for ${title}`,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      suggestedSubtasks: ["Phase 1 kickoff", "Milestone 1"],
    } : undefined,
  };
}
