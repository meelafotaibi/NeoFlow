#ifndef AI_COPILOT_ENGINE_HPP
#define AI_COPILOT_ENGINE_HPP

#include <string>
#include <vector>

namespace neoflow {

struct CopilotGoalProposal {
    std::string name;
    double price;
    std::string currency; // "SAR", "USD"
    std::string imageUrl;
    std::string category; // "real_estate", "tech", "vehicle", "general"
};

struct CopilotPlanProposal {
    std::string title;
    std::string category; // "study", "skill", "life", "exam", "habit"
    std::string description;
    int durationDays;
    std::vector<std::string> subtasks;
};

struct CopilotTaskProposal {
    std::string title;
    std::string priority; // "high", "medium", "low"
    std::string status;   // "todo", "in-progress", "done"
    int dueDays;
    std::vector<std::string> subtasks;
};

struct CopilotAnalysisResult {
    std::string intentType; // "financial_goal", "learning_plan", "academic_exam", "general"
    std::string headline;
    std::string mathExplanation;
    std::vector<std::string> actionSteps;
    bool hasGoal;
    CopilotGoalProposal goal;
    bool hasPlan;
    CopilotPlanProposal plan;
    bool hasTask;
    CopilotTaskProposal task;
    double executionTimeUs;
};

class AiCopilotEngine {
public:
    AiCopilotEngine();
    ~AiCopilotEngine();

    // High-speed natural language intent and entity extraction engine
    CopilotAnalysisResult parseUserIntent(const std::string& query, double currentSavings, double monthlyRate);

private:
    double extractPrice(const std::string& query, std::string& currency);
    std::string resolveGoalImage(const std::string& query, const std::string& category);
};

} // namespace neoflow

#endif // AI_COPILOT_ENGINE_HPP
