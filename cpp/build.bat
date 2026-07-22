@echo off
echo Building NeoFlow C++ Fast Computation Engine...
if not exist bin mkdir bin
g++ -O3 -std=c++17 -Iinclude src/analytics_engine.cpp src/main.cpp -o bin/analytics_engine.exe
if %ERRORLEVEL% EQU 0 (
    echo C++ Build Succeeded! Running Benchmark...
    bin\analytics_engine.exe
) else (
    echo Build failed or g++ not found on PATH.
)
