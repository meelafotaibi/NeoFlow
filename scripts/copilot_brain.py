#!/usr/bin/env python3
"""
NeoFlow AI Co-Pilot Python Intelligence Brain
Natural Language Entity & Intent Extraction Engine
"""

import sys
import json
import re

def extract_price(query):
    q = query.lower()
    currency = "USD"
    if "sar" in q or "riyal" in q:
        currency = "SAR"

    # Match million / mil / 1.5m / 1,500,000
    if "million" in q or "mil" in q or "1.5m" in q:
        if "1.5" in q or "million and half" in q or "milion and half" in q:
            return 1500000.0, currency
        if "1" in q: return 1000000.0, currency
        if "2" in q: return 2000000.0, currency
        return 1000000.0, currency

    # Match digits
    matches = re.findall(r'\d[\d,.]*', query)
    if matches:
        cleaned = [float(m.replace(',', '')) for m in matches if m.replace(',', '').replace('.', '').isdigit()]
        if cleaned:
            return max(cleaned), currency

    return 0.0, currency

def resolve_image(query, category):
    q = query.lower()
    if "villa" in q or "house" in q or "home" in q or category == "real_estate":
        return "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
    if "5090" in q or "gpu" in q or "rtx" in q:
        return "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80"
    if "mac" in q or "macbook" in q or "laptop" in q:
        return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
    if "porsche" in q or "car" in q:
        return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80"
    
    return "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80"

def analyze_intent(user_query, current_savings=0.0, monthly_rate=500.0):
    q = user_query.lower().strip()
    price, currency = extract_price(user_query)

    result = {
        "query": user_query,
        "intentType": "general",
        "headline": f"AI Strategy for '{user_query.capitalize()}'",
        "hasGoal": False,
        "goal": None,
        "hasPlan": False,
        "plan": None,
        "hasTask": False,
        "task": None
    }

    # Villa / Real Estate
    if "villa" in q or "house" in q or price >= 1000000.0:
        target_price = price if price > 0 else 1500000.0
        gap = max(0.0, target_price - current_savings)
        months_needed = int(gap / monthly_rate) if monthly_rate > 0 else 120

        result["intentType"] = "financial_goal"
        result["headline"] = f"Financial Target: Luxury Villa ({int(target_price):,} {currency})"
        result["hasGoal"] = True
        result["goal"] = {
            "name": f"Luxury Villa Dream Goal",
            "price": target_price,
            "currency": currency,
            "imageUrl": resolve_image(user_query, "real_estate")
        }
        result["hasPlan"] = True
        result["plan"] = {
            "title": f"Villa Acquisition Wealth Strategy",
            "category": "life",
            "description": f"Structured savings plan for {int(target_price):,} {currency} Villa target",
            "durationDays": months_needed * 30,
            "subtasks": [
                "Automate monthly investment deposit",
                "Review quarterly real estate portfolio",
                "Track milestone targets at 25%, 50%, 75%"
            ]
        }
        result["hasTask"] = True
        result["task"] = {
            "title": "Open High-Yield Villa Savings Account",
            "priority": "high",
            "status": "in-progress",
            "dueDays": 3,
            "subtasks": ["Research investment yields", "Set up auto-deposit"]
        }
        return result

    # Hardware / Tech (5090 GPU / Mac)
    if "5090" in q or "gpu" in q or "mac" in q or "laptop" in q:
        target_price = price if price > 0 else (2499.0 if "5090" in q else 3000.0)
        item_name = "NVIDIA RTX 5090 GPU" if "5090" in q else ("Apple MacBook Pro" if "mac" in q else "Tech Upgrade")

        result["intentType"] = "tech_hardware_goal"
        result["headline"] = f"Tech Hardware Target: {item_name} (${int(target_price):,})"
        result["hasGoal"] = True
        result["goal"] = {
            "name": item_name,
            "price": target_price,
            "currency": "USD",
            "imageUrl": resolve_image(user_query, "tech")
        }
        result["hasPlan"] = True
        result["plan"] = {
            "title": f"{item_name} Savings Plan",
            "category": "life",
            "description": f"Savings allocation plan for {item_name}",
            "durationDays": 60,
            "subtasks": ["Set aside monthly tech budget", "Monitor stock availability"]
        }
        return result

    # Flutter / Coding / Skill
    if "flutter" in q or "python" in q or "coding" in q or "summer" in q:
        skill_name = "Flutter & Dart App Development" if "flutter" in q else ("Python Programming" if "python" in q else "Programming Skill")
        result["intentType"] = "learning_plan"
        result["headline"] = f"90-Day Summer Skill Mastery: {skill_name}"
        result["hasPlan"] = True
        result["plan"] = {
            "title": f"Master {skill_name} - Summer Plan",
            "category": "skill",
            "description": f"90-Day skill roadmap with weekly deliverables for {skill_name}",
            "durationDays": 90,
            "subtasks": [
                "Week 1-2: Core syntax & fundamentals",
                "Week 3-4: UI Widgets & state management",
                "Week 5-8: Build production project",
                "Week 9-12: Deploy to App Store / GitHub"
            ]
        }
        result["hasTask"] = True
        result["task"] = {
            "title": f"Set Up {skill_name} Development Environment",
            "priority": "high",
            "status": "in-progress",
            "dueDays": 1,
            "subtasks": ["Install SDK & extensions", "Run Hello World application"]
        }
        return result

    # Academic Exams
    if "final" in q or "midterm" in q or "exam" in q or "test" in q:
        result["intentType"] = "academic_exam"
        result["headline"] = "Academic Exam Preparation Sprint"
        result["hasTask"] = True
        result["task"] = {
            "title": "Exam Revision Sprint",
            "priority": "high",
            "status": "in-progress",
            "dueDays": 2,
            "subtasks": [
                "Review syllabus chapters 1-4",
                "Solve past exam papers under timed conditions",
                "Create summary flashcards"
            ]
        }
        result["hasPlan"] = True
        result["plan"] = {
            "title": "Finals Study Block Routine",
            "category": "exam",
            "description": "Daily study routine with active recall and timed problem solving",
            "durationDays": 14,
            "subtasks": ["Morning study session", "Afternoon practice problems"]
        }
        return result

    return result

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "I want a villa of 1500000 SAR"
    savings = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
    rate = float(sys.argv[3]) if len(sys.argv) > 3 else 500.0

    analysis = analyze_intent(query, savings, rate)
    print(json.dumps(analysis, indent=2))
