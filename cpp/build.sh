#!/bin/bash
set -e
echo "Building NeoFlow C++ Fast Computation Engine..."
mkdir -p bin
g++ -O3 -std=c++17 -Iinclude src/analytics_engine.cpp src/main.cpp -o bin/analytics_engine
echo "C++ Build Succeeded! Running Benchmark..."
./bin/analytics_engine
