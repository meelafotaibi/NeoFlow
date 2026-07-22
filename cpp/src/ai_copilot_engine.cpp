#include "ai_copilot_engine.hpp"
#include <algorithm>
#include <cctype>
#include <chrono>
#include <cmath>
#include <sstream>

namespace neoflow {

AiCopilotEngine::AiCopilotEngine() {}
AiCopilotEngine::~AiCopilotEngine() {}

static std::string toLower(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char c){ return std::tolower(c); });
    return lower;
}

double AiCopilotEngine::extractPrice(const std::string& query, std::string& currency) {
    std::string q = toLower(query);
    currency = "USD";
    if (q.find("sar") != std::string::npos || q.find("riyal") != std::string::npos) {
        currency = "SAR";
    }

    // Check for million / mil
    if (q.find("million") != std::string::npos || q.find("mil") != std::string::npos || q.find("1.5m") != std::string::npos) {
        if (q.find("1.5") != std::string::npos || q.find("million and half") != std::string::npos || q.find("milion and half") != std::string::npos) {
            return 1500000.0;
        }
        if (q.find("1") != std::string::npos) return 1000000.0;
        if (q.find("2") != std::string::npos) return 2000000.0;
        return 1000000.0;
    }

    // Number matching
    double foundPrice = 0.0;
    std::stringstream ss(query);
    std::string token;
    while (ss >> token) {
        std::string cleaned;
        for (char c : token) {
            if (std::isdigit(c) || c == '.') cleaned += c;
        }
        if (!cleaned.empty()) {
            try {
                double val = std::stod(cleaned);
                if (val > foundPrice) foundPrice = val;
            } catch (...) {}
        }
    }

    return foundPrice;
}

std::string AiCopilotEngine::resolveGoalImage(const std::string& query, const std::string& category) {
    std::string q = toLower(query);

    if (category == "real_estate" || q.find("villa") != std::string::npos || q.find("house") != std::string::npos || q.find("home") != std::string::npos) {
        return "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"; // Luxury Villa
    }
    if (q.find("5090") != std::string::npos || q.find("gpu") != std::string::npos || q.find("rtx") != std::string::npos || q.find("graphics card") != std::string::npos) {
        return "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80"; // GPU hardware
    }
    if (q.find("mac") != std::string::npos || q.find("macbook") != std::string::npos || q.find("laptop") != std::string::npos) {
        return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"; // MacBook Pro
    }
    if (q.find("porsche") != std::string::npos || q.find("car") != std::string::npos) {
        return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80"; // Porsche / Car
    }
    
    return "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80"; // Default financial growth asset
}

CopilotAnalysisResult AiCopilotEngine::parseUserIntent(const std::string& query, double currentSavings, double monthlyRate) {
    auto start = std::chrono::high_resolution_clock::now();
    CopilotAnalysisResult result;
    result.hasGoal = false;
    result.hasPlan = false;
    result.hasTask = false;

    std::string q = toLower(query);
    std::string currency = "USD";
    double price = extractPrice(query, currency);

    // 1. VILLA / REAL ESTATE
    if (q.find("villa") != std::string::npos || q.find("house") != std::string::npos || price >= 1000000.0) {
        double targetPrice = price > 0.0 ? price : 1500000.0;
        result.intentType = "financial_goal";
        result.headline = "Financial Target: Luxury Villa (" + std::to_string(static_cast<int>(targetPrice)) + " " + currency + ")";
        
        double gap = std::max(0.0, targetPrice - currentSavings);
        int monthsNeeded = (monthlyRate > 0.0) ? static_cast<int>(std::ceil(gap / monthlyRate)) : 120;
        result.mathExplanation = "Target price: " + std::to_string(static_cast<int>(targetPrice)) + " " + currency + ". At a monthly savings rate of " + std::to_string(static_cast<int>(monthlyRate)) + " " + currency + "/mo, this goal requires " + std::to_string(monthsNeeded) + " months.";

        result.actionSteps = {
            "Step 1: Grant permission to add the " + std::to_string(static_cast<int>(targetPrice)) + " " + currency + " Villa goal.",
            "Step 2: Initialize a dedicated Villa Savings Plan with monthly deposits.",
            "Step 3: Add high-priority wealth accumulation tasks to your board."
        };

        result.hasGoal = true;
        result.goal = { "Luxury Villa Dream Goal", targetPrice, currency, resolveGoalImage(query, "real_estate"), "real_estate" };

        result.hasPlan = true;
        result.plan = {
            "Villa Acquisition Wealth Strategy",
            "life",
            "Structured monthly allocation to reach " + std::to_string(static_cast<int>(targetPrice)) + " " + currency + " Villa goal",
            monthsNeeded * 30,
            { "Automate monthly investment deposit", "Review quarterly real estate portfolio", "Track milestone targets at 25%, 50%, 75%" }
        };

        result.hasTask = true;
        result.task = {
            "Open High-Yield Villa Savings Fund",
            "high",
            "in-progress",
            3,
            { "Research bank investment yields", "Set up automatic salary deduction", "Confirm first deposit" }
        };
    }
    // 2. TECH HARDWARE (5090 GPU / MAC / LAPTOP)
    else if (q.find("5090") != std::string::npos || q.find("gpu") != std::string::npos || q.find("mac") != std::string::npos || q.find("laptop") != std::string::npos) {
        double targetPrice = price > 0.0 ? price : (q.find("5090") != std::string::npos ? 2499.0 : 3000.0);
        std::string itemName = (q.find("5090") != std::string::npos) ? "NVIDIA RTX 5090 GPU" : (q.find("mac") != std::string::npos ? "Apple MacBook Pro" : "Tech Hardware Upgrade");

        result.intentType = "tech_hardware_goal";
        result.headline = "Tech Acquisition Plan: " + itemName + " ($" + std::to_string(static_cast<int>(targetPrice)) + ")";
        result.mathExplanation = "Hardware target: $" + std::to_string(static_cast<int>(targetPrice)) + ". Current wallet: $" + std::to_string(static_cast<int>(currentSavings)) + ".";

        result.actionSteps = {
            "Add $" + std::to_string(static_cast<int>(targetPrice)) + " " + itemName + " to your Financial Goals board.",
            "Attach a short-term savings sprint plan.",
            "Check off goal when wallet reaches target balance."
        };

        result.hasGoal = true;
        result.goal = { itemName, targetPrice, "USD", resolveGoalImage(query, "tech"), "tech" };

        result.hasPlan = true;
        result.plan = {
            itemName + " Savings Plan",
            "life",
            "Short-term hardware upgrade savings plan for " + itemName,
            60,
            { "Set aside $500 monthly tech budget", "Track GPU stock and pre-orders" }
        };
    }
    // 3. SKILL LEARNING (FLUTTER / PYTHON / PROGRAMMING)
    else if (q.find("flutter") != std::string::npos || q.find("python") != std::string::npos || q.find("react") != std::string::npos || q.find("coding") != std::string::npos || q.find("summer") != std::string::npos) {
        std::string skillName = (q.find("flutter") != std::string::npos) ? "Flutter & Dart App Development" : (q.find("python") != std::string::npos ? "Python Programming" : "Software Engineering");

        result.intentType = "learning_plan";
        result.headline = "90-Day Summer Skill Mastery: " + skillName;
        result.mathExplanation = "Dedicated 90-day learning roadmap with 4 structured monthly phases and practical project building.";

        result.actionSteps = {
            "Phase 1: Fundamentals and core syntax syntax breakdown.",
            "Phase 2: Build and deploy first production app project.",
            "Phase 3: Optimize performance and showcase portfolio."
        };

        result.hasPlan = true;
        result.plan = {
            "Master " + skillName + " - Summer Roadmap",
            "skill",
            "90-Day intensive skill mastery plan with project deliverables",
            90,
            { "Week 1-2: Core syntax & control flow", "Week 3-4: UI Widgets & state management", "Week 5-8: Build production mobile app", "Week 9-12: Deploy to App Store & GitHub" }
        };

        result.hasTask = true;
        result.task = {
            "Set Up " + skillName + " Dev Environment",
            "high",
            "in-progress",
            1,
            { "Install SDK and IDE tools", "Clone starter boilerplate", "Run first Hello World app" }
        };
    }
    // 4. ACADEMIC EXAMS (FINALS / MIDTERMS)
    else if (q.find("final") != std::string::npos || q.find("midterm") != std::string::npos || q.find("exam") != std::string::npos || q.find("test") != std::string::npos) {
        result.intentType = "academic_exam";
        result.headline = "Academic Exam Mastery System";
        result.mathExplanation = "High-priority exam preparation schedule with spaced repetition and practice sprints.";

        result.actionSteps = {
            "Step 1: Set up exam study sprint tasks in your active queue.",
            "Step 2: Conduct 25-minute Pomodoro revision blocks daily.",
            "Step 3: Complete timed past paper tests under exam conditions."
        };

        result.hasTask = true;
        result.task = {
            "Exam Revision Sprint - High Priority",
            "high",
            "in-progress",
            2,
            { "Review core syllabus chapters 1-4", "Solve past exam papers under timed conditions", "Create summary flashcards for key definitions" }
        };

        result.hasPlan = true;
        result.plan = {
            "Finals Exam Preparation Routine",
            "exam",
            "Daily 2-hour study block routine with spaced repetition",
            14,
            { "Morning: 45-min active recall", "Afternoon: 45-min practice problems", "Evening: 30-min formula summary" }
        };
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::micro> elapsed = end - start;
    result.executionTimeUs = elapsed.count();

    return result;
}

} // namespace neoflow
