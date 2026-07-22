CXX ?= g++
CXXFLAGS ?= -O3 -Wall -std=c++17 -Iinclude
BUILD_DIR ?= bin

all: $(BUILD_DIR)/analytics_engine

$(BUILD_DIR)/analytics_engine: src/analytics_engine.cpp src/main.cpp | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) $^ -o $@

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

benchmark: all
	./$(BUILD_DIR)/analytics_engine

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all benchmark clean
