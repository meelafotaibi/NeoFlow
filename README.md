# NeoFlow Personal Productivity & Financial Dashboard

NeoFlow is a high-performance, open-source personal dashboard designed for tracking active plans, task priority queues, financial goals, savings forecasts, and daily productivity habits.

Built with Next.js 16, React 19, Tailwind CSS, Firebase, and a native C++ calculation engine for sub-millisecond data processing.

---

## Features

- **Personalized Executive Dashboard**: Real-time Overview of active goals, daily check-ins, tasks due, and wallet metrics.
- **Sub-Millisecond C++ Analytics Engine**: Native C++ algorithms compiled for high-speed financial goal forecasting, compound interest projections, and task queue scheduling.
- **Savings Simulator & Forecast**: Dynamic projection charts linked to real wallet balances and daily contribution rates.
- **Smart Focus Co-Pilot**: AI-powered strategy engine generating structured plans and task conversions based on your schedule.
- **Firebase Auth & Firestore Integration**: Optional cloud sync with local storage fallback for offline resilience.
- **Open-Source & Security First**: Zero hardcoded secrets, isolated environment variables, and strict security compliance.

---

## System Architecture

```
                      +-----------------------------+
                      |     Next.js / React 19 UI   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   lib/cpp-engine-adapter    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Native C++ Analytics Engine|
                      |   (cpp/src/analytics_engine)|
                      +-----------------------------+
```

---

## C++ Engine & Benchmark Execution

The C++ calculation engine handles microsecond financial forecasts and queue sorting.

### Build & Run C++ Benchmarks Locally

```bash
# Compile and run C++ engine benchmarks
npm run cpp:benchmark
```

Or run via CMake:

```bash
cd cpp
mkdir build && cd build
cmake ..
make
./analytics_engine
```

### Windows PowerShell

```powershell
.\cpp\build.bat
```

### Benchmark Results Example

```
[NeoFlow C++ Engine] Benchmark Harness Initialized
--------------------------------------------------
Goal Projection Result:
  - Days Needed: 17 days
  - Months Needed: 0.6 months
  - Execution Time: 0.0025 ms (2.3 us)
--------------------------------------------------
Task Prioritization (1,000 tasks batch):
  - Top Task ID: 405 | Score: 142.5
  - Execution Time: 0.0406 ms
--------------------------------------------------
Compound Growth Forecast (60 Months):
  - Final Projected Balance: $23347.4
  - Execution Time: 0.0005 ms
--------------------------------------------------
SUCCESS: All C++ engine benchmark tests executed in < 1 ms.
```

---

## Environment Setup & Installation

### Prerequisites

- Node.js 18+ or Node.js 20+
- npm or pnpm
- GCC / G++ 9+ (optional for C++ native binary builds)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/meelafotaibi/NeoFlow.git
   cd neo-flow-dashboard
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to provide your Firebase and Gemini API keys.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Security

NeoFlow enforces strict environment variable separation. All secret credentials are ignored by `.gitignore`.
For more details, see [SECURITY.md](SECURITY.md).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
