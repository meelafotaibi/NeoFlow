# Contributing to NeoFlow

We welcome open-source contributions to NeoFlow!

## Guidelines

1. **Code Style & Formatting**: Follow standard TypeScript and C++17 conventions.
2. **No Emojis Policy**: Do not introduce emojis in code, commits, comments, UI text, or documentation.
3. **Security First**: Never commit API keys, service accounts, or secret tokens. Ensure `.env.local` remains ignored.
4. **C++ Performance**: Ensure any performance-critical analytics changes maintain sub-millisecond calculation speeds.

## Development Workflow

1. Fork the repository on GitHub.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Test Next.js build: `npm run build`.
4. Test C++ engine: `npm run cpp:benchmark`.
5. Open a Pull Request with a clear summary of your changes.
