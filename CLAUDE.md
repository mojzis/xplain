# Query Plan Visualizer - Project Context

## Project Overview

A static, client-side web application that visualizes database query execution plans (SQL Server, PostgreSQL, Oracle) with a modern UI. All parsing and rendering happens in the browser — no server-side processing, ensuring sensitive query plan data never leaves the user's machine.

## Architecture Decisions

### Core Components
```
Query Plan Visualizer (TypeScript/React)
├── Parsers          → SQL Server XML, PostgreSQL JSON, Oracle text
├── Visualization    → Tree layout, node cards, SVG connectors
├── Panels           → Overview sidebar, detail panel
└── Input            → Database tabs, textarea, file drag-drop
```

### Key Design Choices
- **Pure client-side**: No backend, all processing in browser for privacy
- **Multi-database**: Unified PlanNode interface normalizes different formats
- **Vite build**: Produces static files deployable anywhere

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | React 18 | With TypeScript |
| Styling | Tailwind CSS | Utility-first |
| Build | Vite | Static output |
| Testing | Vitest | Fast, Vite-native |
| Utilities | clsx | Conditional classes |

## Code Style & Conventions

### TypeScript
- Strict mode enabled with `noUncheckedIndexedAccess`
- ESM modules (`"type": "module"` in package.json)
- Explicit return types on exported functions
- Interfaces for data shapes (PlanNode, Warning, etc.)

### File Organization
```
src/
├── components/        # React components
├── parsers/           # Database-specific parsers
├── types/             # TypeScript interfaces
├── utils/             # Layout, calculations
├── examples/          # Sample plans
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

### Naming
- Files: `kebab-case.ts` or `PascalCase.tsx` for components
- Types/Interfaces: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Error Handling
- Parsers throw descriptive errors on invalid input
- UI displays errors clearly to user
- No silent failures

### Testing
- Co-locate unit tests: `sqlserver.ts` → `sqlserver.test.ts`
- Test parsing with valid and invalid inputs
- Test layout algorithm edge cases

## Development Workflow

### Commands
```bash
bun dev            # Development server
bun run build      # Production build → dist/
bun run preview    # Preview production build
bun run typecheck  # TypeScript validation
bun test           # Run Vitest tests
```

### Each Implementation Step Must:
1. Write the code
2. Write tests
3. Run tests: `bun test`
4. Run type check: `bun run typecheck`
5. Manual verification in browser
6. Document findings in the guide

## Implementation Status

Track progress in `docs/IMPLEMENTATION_GUIDE.md`:

- [x] Step 0: Environment setup
- [x] Step 1: Project scaffolding
- [x] Step 2: Core types
- [x] Step 3: SQL Server parser
- [x] Step 4: PostgreSQL parser
- [x] Step 5: Oracle parser
- [x] Step 6: Parser index
- [ ] Step 7: Plan input component
- [ ] Step 8: Tree layout
- [ ] Step 9: Plan node component
- [ ] Step 10: SVG connectors
- [ ] Step 11: Plan tree component
- [ ] Step 12: Overview panel
- [ ] Step 13: Detail panel
- [ ] Step 14: App integration
- [ ] Step 15: Final build

## Key Files to Reference

- `docs/req.md` — Original requirements specification
- `docs/WORKFLOW.md` — Execution process for each step
- `docs/IMPLEMENTATION_GUIDE.md` — Step index and progress tracker
- `docs/guide/*.md` — Detailed implementation for each phase

## Important Notes

- **Privacy first**: All processing client-side, no data sent externally
- **SQL Server is primary**: Most complete parser, others can be basic
- **Static deployment**: Output is just HTML/JS/CSS, works anywhere
- Build output goes to `dist/` — deploy these files

## Database Support Priority

1. **SQL Server** (primary) — XML from `SET STATISTICS XML ON` or .sqlplan files
2. **PostgreSQL** — JSON from `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`
3. **Oracle** (basic) — Text from `DBMS_XPLAN.DISPLAY_CURSOR`
