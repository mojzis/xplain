# Step 2 Plan: Core Types & Interfaces

## Objective
Define TypeScript interfaces that normalize different database plan formats into a unified structure.

## Tasks
- [ ] Create `src/types/plan.ts` with PlanNode, Warning, and ParsedPlan interfaces
- [ ] Create `src/types/layout.ts` with Position, LayoutNode, and LayoutConfig types
- [ ] Update `src/types/index.ts` to export all types
- [ ] Run typecheck to verify

## Success Criteria
- [ ] All types compile without errors
- [ ] Types are exported correctly
- [ ] `bun run typecheck` passes

## Decisions
- Warning severity levels: info, warning, critical
- Warning types: missing-index, implicit-conversion, spill, scan, other
- Layout config has sensible defaults (200px node width, 80px height, 40px H-gap, 60px V-gap)
