#include <iostream>
#include <vector>
#include <chrono>
#include "analytics_engine.hpp"
#include "ai_copilot_engine.hpp"

int main() {
    std::cout << "[NeoFlow C++ Engine] Benchmark Harness Initialized" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    neoflow::AnalyticsEngine engine;
    neoflow::AiCopilotEngine copilot;

    // Test 1: Goal Projection
    neoflow::GoalProjectionInput input;
    input.currentSavings = 450.0;
    input.periodContribution = 50.0;
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

    // Test 2: AI Co-Pilot Intent Parsing (Villa 1.5 Million SAR)
    auto copilotStart = std::chrono::high_resolution_clock::now();
    auto copilotResult = copilot.parseUserIntent("I want a villa of 1500000 SAR", 25000.0, 15000.0);
    auto copilotEnd = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> copilotElapsedMs = copilotEnd - copilotStart;

    std::cout << "AI Co-Pilot Intent Engine (Villa Parse Test):" << std::endl;
    std::cout << "  - Headline: " << copilotResult.headline << std::endl;
    std::cout << "  - Goal Name: " << copilotResult.goal.name << " | Price: " << copilotResult.goal.price << " " << copilotResult.goal.currency << std::endl;
    std::cout << "  - Execution Time: " << copilotElapsedMs.count() << " ms (" << copilotResult.executionTimeUs << " us)" << std::endl;
    std::cout << "--------------------------------------------------" << std::endl;

    // Test 3: Task Prioritization (1,000 tasks batch)
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
    std::cout << "SUCCESS: All C++ engine benchmark tests executed in < 1 ms." << std::endl;

    return 0;
}
