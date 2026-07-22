#ifndef ANALYTICS_ENGINE_HPP
#define ANALYTICS_ENGINE_HPP

#include <vector>
#include <string>
#include <chrono>

namespace neoflow {

struct GoalProjectionInput {
    double currentSavings;
    double periodContribution; // daily equivalent
    double goalCost;
    std::string timeHorizon; // "daily", "weekly", "monthly"
};

struct GoalProjectionOutput {
    int daysNeeded;
    int weeksNeeded;
    double monthsNeeded;
    bool isAffordable;
    double remainingGap;
    double executionTimeUs; // Microseconds execution time
};

struct TaskPriorityInput {
    int id;
    std::string priority; // "high", "medium", "low"
    bool isCompleted;
    int estimatedMinutes;
    int daysUntilDue;
};

struct TaskPriorityResult {
    int id;
    double priorityScore; // Higher score = execute first
};

struct FocusSessionStats {
    int completedSessions;
    int totalFocusMinutes;
    double focusEfficiencyScore;
    double recommendedRestMinutes;
};

class AnalyticsEngine {
public:
    AnalyticsEngine();
    ~AnalyticsEngine();

    // High-performance goal projection (sub-millisecond)
    GoalProjectionOutput calculateGoalProjection(const GoalProjectionInput& input);

    // High-speed queue optimization & priority scoring
    std::vector<TaskPriorityResult> prioritizeTasks(const std::vector<TaskPriorityInput>& tasks);

    // Productivity & Focus Analytics Engine
    FocusSessionStats computeFocusStats(int focusMinutes, int breakMinutes, int interruptions);

    // Compound interest & multi-period forecasting
    std::vector<double> forecastCompoundGrowth(double initialBalance, double monthlyDeposit, double annualInterestRate, int months);
};

} // namespace neoflow

#endif // ANALYTICS_ENGINE_HPP
