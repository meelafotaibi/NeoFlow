cmake_minimum_required(VERSION 3.14)
project(NeoFlowAnalyticsEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_library(analytics_engine_lib STATIC
    src/analytics_engine.cpp
    src/ai_copilot_engine.cpp
)

add_executable(analytics_engine
    src/main.cpp
)

target_link_libraries(analytics_engine PRIVATE analytics_engine_lib)
