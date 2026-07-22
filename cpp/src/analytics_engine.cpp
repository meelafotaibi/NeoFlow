#include "analytics_engine.hpp"
#include <cmath>
#include <algorithm>

namespace neoflow {

AnalyticsEngine::AnalyticsEngine() {}
AnalyticsEngine::~AnalyticsEngine() {}

GoalProjectionOutput AnalyticsEngine::calculateGoalProjection(const GoalProjectionInput& input) {
    auto start = std::chrono::high_resolution_clock::now();

    GoalProjectionOutput output;
    output.isAffordable = (input.currentSavings >= input.goalCost);
    output.remainingGap = std::max(0.0, input.goalCost - input.currentSavings);

    if (output.isAffordable) {
        output.daysNeeded = 0;
        output.weeksNeeded = 0;
        output.monthsNeeded = 0.0;
    } else if (input.periodContribution > 0.0) {
        output.daysNeeded = static_cast<int>(std::ceil(output.remainingGap / input.periodContribution));
        output.weeksNeeded = static_cast<int>(std::ceil(output.daysNeeded / 7.0));
        output.monthsNeeded = std::round((output.daysNeeded / 30.4375) * 10.0) / 10.0;
    } else {
        output.daysNeeded = 99999;
        output.weeksNeeded = 9999;
        output.monthsNeeded = 999.0;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::micro> elapsed = end - start;
    output.executionTimeUs = elapsed.count();

    return output;
}

std::vector<TaskPriorityResult> AnalyticsEngine::prioritizeTasks(const std::vector<TaskPriorityInput>& tasks) {
    std::vector<TaskPriorityResult> results;
    results.reserve(tasks.size());

    for (const auto& task : tasks) {
        if (task.isCompleted) {
            results.push_back({task.id, 0.0});
            continue;
        }

        double baseScore = 50.0;
        if (task.priority == "high") baseScore += 40.0;
        else if (task.priority == "medium") baseScore += 20.0;
        else baseScore += 5.0;

        // Urgency factor based on due days
        double urgencyFactor = 0.0;
        if (task.daysUntilDue <= 0) urgencyFactor = 30.0;
        else if (task.daysUntilDue == 1) urgencyFactor = 20.0;
        else if (task.daysUntilDue <= 3) urgencyFactor = 10.0;

        // Quick win bonus (shorter tasks completed faster)
        double quickWinBonus = std::max(0.0, (60.0 - task.estimatedMinutes) / 2.0);

        double totalScore = baseScore + urgencyFactor + quickWinBonus;
        results.push_back({task.id, totalScore});
    }

    std::sort(results.begin(), results.end(), [](const TaskPriorityResult& a, const TaskPriorityResult& b) {
        return a.priorityScore > b.priorityScore;
    });

    return results;
}

FocusSessionStats AnalyticsEngine::computeFocusStats(int focusMinutes, int breakMinutes, int interruptions) {
    FocusSessionStats stats;
    stats.totalFocusMinutes = focusMinutes;
    stats.completedSessions = focusMinutes / 25;

    double baseRatio = focusMinutes > 0 ? static_cast<double>(focusMinutes) / (focusMinutes + breakMinutes) : 0.0;
    double penalty = interruptions * 0.08;
    stats.focusEfficiencyScore = std::max(0.0, std::min(100.0, (baseRatio * 100.0) - (penalty * 100.0)));
    stats.recommendedRestMinutes = std::round((focusMinutes / 25.0) * 5.0);

    return stats;
}

std::vector<double> AnalyticsEngine::forecastCompoundGrowth(double initialBalance, double monthlyDeposit, double annualInterestRate, int months) {
    std::vector<double> forecast;
    forecast.reserve(months + 1);
    
    double monthlyRate = (annualInterestRate / 100.0) / 12.0;
    double current = initialBalance;
    forecast.push_back(current);

    for (int i = 1; i <= months; ++i) {
        current = (current + monthlyDeposit) * (1.0 + monthlyRate);
        forecast.push_back(std::round(current * 100.0) / 100.0);
    }

    return forecast;
}

} // namespace neoflow
