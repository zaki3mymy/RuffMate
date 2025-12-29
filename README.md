# RuffMate - Ruff Configuration Manager

A web application for managing Ruff linter rule configurations with ease.

## Project Status

- ✅ **Phase 1 Complete** - Environment Setup & Foundation
- ⏳ **Phase 2 Pending** - MVP Implementation
- ⏳ **Phase 3 Pending** - Standard Features
- ⏳ **Phase 4 Pending** - Complete Version

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Type check with TypeScript |

## Tech Stack

### Core
- **React 18** - UI library
- **TypeScript 5.6** - Type safety (strict mode)
- **Vite 6** - Build tool and dev server

### State Management
- **Zustand** - Lightweight state management
- **Immer** - Immutable state updates

### UI/Styling
- **Material-UI v6** - Component library
- **Emotion** - CSS-in-JS

### Testing
- **Vitest** - Unit testing (100% coverage target)
- **Testing Library** - React component testing
- **Playwright** - E2E testing

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Maximum type safety

## Project Structure

```
RuffMate/
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic
│   ├── store/          # Zustand stores
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── styles/         # MUI themes and styles
│   └── assets/         # Static assets
├── tests/
│   ├── e2e/           # E2E tests
│   ├── fixtures/      # Test data
│   ├── helpers/       # Test utilities
│   └── __mocks__/     # Mocks
├── scripts/           # Build scripts (TypeScript)
└── docs/              # Documentation
```

## Phase 1 Achievements

### Environment & Configuration
- ✅ Vite + React + TypeScript setup with strict mode
- ✅ ESLint + Prettier configuration
- ✅ Vitest + Playwright test infrastructure
- ✅ 100% test coverage thresholds configured

### Type System
- ✅ Core type definitions (RuffRule, RuffCategory, FilterOptions)
- ✅ Configuration types (PyprojectTomlConfig, UserSettings)
- ✅ Complete type safety with strict TypeScript

### Testing Infrastructure
- ✅ Vitest configuration with 100% coverage target
- ✅ Testing Library setup for React components
- ✅ Playwright E2E test configuration
- ✅ Test helpers and mock data utilities
- ✅ Custom render functions with theme support

### UI Foundation
- ✅ Material-UI theme (light/dark mode)
- ✅ Responsive breakpoints configured
- ✅ Typography and spacing system

### Quality Assurance
- ✅ All tests passing (2/2)
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Production build: successful

## Documentation

- 📋 [Requirements](docs/REQUIREMENTS.md) - Complete project requirements
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design and architecture
- 📅 [Development Plan](docs/DEVELOPMENT_PLAN.md) - Phased development roadmap
- 🧪 [Testing Strategy](docs/TESTING_STRATEGY.md) - 100% coverage test plan

## Development Guidelines

### TypeScript
- Strict mode is **mandatory**
- No `any` types allowed
- All functions must have proper return types

### Testing
- **TDD approach**: Write tests first
- **100% coverage required**: All branches, functions, lines
- Tests must pass before committing

### Code Style
- Run `npm run format` before committing
- Run `npm run lint` to check for issues
- All ESLint rules must pass

### Git Workflow
- Create feature branches from `main`
- Use conventional commit messages
- All commits include Claude Code attribution

## License

MIT

## Credits

Built with [Claude Code](https://claude.com/claude-code)
