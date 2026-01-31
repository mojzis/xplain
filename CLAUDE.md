# [Project Name] - Project Context

## Project Overview

[2-3 sentences describing what this project does]

## Architecture Decisions

### Core Components
```
[Project] (TypeScript)
├── Component A      → Description
├── Component B      → Description
└── Component C      → Description
```

### Key Design Choices
- [Decision and rationale]
- [Decision and rationale]

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Runtime | Bun | Native TS execution |
| Validation | Zod | Runtime validation |
| Testing | bun:test | Built-in |
| ... | ... | ... |

## Code Style & Conventions

### TypeScript
- Strict mode enabled with `noUncheckedIndexedAccess`
- ESM modules (`"type": "module"` in package.json)
- Explicit return types on exported functions
- Discriminated unions for state (not optional properties)
- Zod for external data validation

### File Organization
```
src/
├── index.ts           # Entry point
├── feature-a/         # Feature module
├── feature-b/         # Feature module
└── types.ts           # Shared types
```

### Naming
- Files: `kebab-case.ts`
- Types/Interfaces: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### No Barrel Files
- Import directly from source files, not index.ts re-exports

### Error Handling
- Use `Result<T, E>` pattern where appropriate
- All promises must be awaited, returned, or explicitly voided
- Wrap external calls in try-catch with typed errors

### Testing
- Co-locate unit tests: `feature.ts` → `feature.test.ts`
- Test both happy path and error cases

## Development Workflow

### Each Implementation Step Must:
1. Write the code
2. Write tests (unit + integration where applicable)
3. Run tests: `bun test`
4. Run type check: `bun run typecheck`
5. Run linting: `bun run lint`
6. **Manual verification**: Actually run it, observe behavior
7. **Document findings**: What worked, what didn't, what to improve

### Git Workflow
- Feature branches: `feat/step-N-description`
- Commit after each working step
- Keep commits atomic and well-described

## Implementation Status

Track progress here as steps are completed:

- [ ] Step 0: Environment setup
- [ ] Step 1: Project scaffolding
- [ ] Step 2: [First feature]
- [ ] Step 3: [Second feature]
- [ ] Step 4: [Third feature]
- [ ] ...

## Key Files to Reference

- `docs/WORKFLOW.md` — Step-by-step build workflow
- `docs/IMPLEMENTATION_GUIDE.md` — Detailed build instructions
- `docs/TYPESCRIPT_PRACTICES.md` — Coding standards

## Important Notes

- **Bun transpiles but doesn't type-check** — Always run `bunx tsc --noEmit` separately
- [Other project-specific notes]

## Questions / Decisions to Revisit

- [Open question 1]
- [Open question 2]
