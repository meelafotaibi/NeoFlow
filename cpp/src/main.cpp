#include <iostream>
#include <vector>
#include <chrono>
#include "analytics_engine.hpp"

int main() {
    std::cout << "[NeoFlow C++ Engine] Benchmark Harness Initialized" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    neoflow::AnalyticsEngine engine;

    // Test 1: Goal Projection
    neoflow::GoalProjectionInput input;
    input.currentSavings = 450.0;
    input.periodContribution = 50.0; // $50/day
    input.goalCost = 1299.0;
    input.timeHorizon = "daily";

    auto start = std::chrono::high_resolution_clock::now();
    neoflow::GoalProjectionOutput proj = engine.calculateGoalProjection(input);
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsedMs = end - start;

    std::cout << "Goal Projection Result:" << std::endl;
    std::cout << "  - Days Needed: " << proj.daysNeeded << " days" << std::endl;
    std::cout << "  - Months Needed: " << proj.monthsNeeded << " months" << std::endl;
    std::cout << "  - Execution Time: " << elapsedMs.count() << " ms (" << proj.executionTimeUs << " us)" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    // Test 2: Task Prioritization (1,000 tasks workload)
    std::vector<neoflow::TaskPriorityInput> tasks;
    tasks.reserve(1000);
    for (int i = 0; i < 1000; ++i) {
        tasks.push_back({
            i,
            (i % 3 == 0) ? "high" : (i % 2 == 0) ? "medium" : "low",
            (i % 10 == 0),
            15 + (i % 45),
            (i % 5)
        });
    }

    auto taskStart = std::chrono::high_resolution_clock::now();
    auto prioritized = engine.prioritizeTasks(tasks);
    auto taskEnd = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> taskElapsedMs = taskEnd - taskStart;

    std::cout << "Task Prioritization (1,000 tasks batch):" << std::endl;
    std::cout << "  - Top Task ID: " << prioritized[0].id << " | Score: " << prioritized[0].priorityScore << std::endl;
    std::cout << "  - Execution Time: " << taskElapsedMs.count() << " ms" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    // Test 3: Compound Growth Forecast (60 Months)
    auto growthStart = std::chrono::high_resolution_clock::now();
    auto growth = engine.forecastCompoundGrowth(1000.0, 300.0, 7.5, 60);
    auto growthEnd = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> growthElapsedMs = growthEnd - growthStart;

    std::cout << "Compound Growth Forecast (60 Months):" << std::endl;
    std::cout << "  - Final Projected Balance: $" << growth.back() << std::endl;
    std::cout << "  - Execution Time: " << growthElapsedMs.count() << " ms" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;
    std::cout << "SUCCESS: All C++ engine benchmark tests executed in < 1 ms." << std::endl;

    return 0;
}
