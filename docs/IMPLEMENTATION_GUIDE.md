# Query Plan Visualizer — Implementation Guide

This guide is split into focused modules. **Complete each step fully before moving to the next**, including testing and verification.

## Overview

Build a static, client-side web app that visualizes database query execution plans for SQL Server, PostgreSQL, and Oracle.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Vite

## Guide Structure

| File | Steps | Description |
|------|-------|-------------|
| [01-setup.md](./guide/01-setup.md) | 0-1 | Environment setup and project scaffolding |
| [02-types.md](./guide/02-types.md) | 2 | Core TypeScript interfaces |
| [03-parsers.md](./guide/03-parsers.md) | 3-6 | SQL Server, PostgreSQL, Oracle parsers |
| [04-input.md](./guide/04-input.md) | 7 | Plan input component with drag-drop |
| [05-visualization.md](./guide/05-visualization.md) | 8-11 | Tree layout, nodes, connectors |
| [06-panels.md](./guide/06-panels.md) | 12-13 | Overview and detail panels |
| [07-integration.md](./guide/07-integration.md) | 14-15 | Final assembly and build |

## Progress Tracker

- [x] Step 0: Environment setup
- [x] Step 1: Project scaffolding (Vite + React + Tailwind)
- [x] Step 2: Core types & interfaces
- [ ] Step 3: SQL Server XML parser
- [ ] Step 4: PostgreSQL JSON parser
- [ ] Step 5: Oracle text parser
- [ ] Step 6: Parser index & auto-detection
- [ ] Step 7: Plan input component
- [ ] Step 8: Tree layout algorithm
- [ ] Step 9: Plan node component
- [ ] Step 10: SVG connectors
- [ ] Step 11: Plan tree component
- [ ] Step 12: Overview panel
- [ ] Step 13: Detail panel
- [ ] Step 14: Main app integration
- [ ] Step 15: Final polish & build

## Quick Reference

### Project Structure
```
query-plan-visualizer/
├── src/
│   ├── components/
│   │   ├── PlanInput.tsx
│   │   ├── PlanViewer.tsx
│   │   ├── PlanTree.tsx
│   │   ├── PlanNode.tsx
│   │   ├── OverviewPanel.tsx
│   │   ├── DetailPanel.tsx
│   │   ├── Connectors.tsx
│   │   └── DatabaseTabs.tsx
│   ├── parsers/
│   │   ├── index.ts
│   │   ├── sqlserver.ts
│   │   ├── postgresql.ts
│   │   └── oracle.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── plan.ts
│   │   └── layout.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── layout.ts
│   ├── examples/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

### Commands
```bash
bun dev            # Development server
bun run build      # Production build → dist/
bun run preview    # Preview production build
bun run typecheck  # TypeScript validation
bun test           # Run tests
```

## Success Criteria

1. Paste SQL Server .sqlplan XML → see visualization
2. Paste PostgreSQL EXPLAIN JSON → see visualization
3. Paste Oracle DBMS_XPLAN text → see visualization
4. Warnings auto-detected and highlighted
5. Works offline (after initial load)
6. No data sent to any server
7. Builds to static files in dist/
