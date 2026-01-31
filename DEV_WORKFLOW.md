# Phase-by-Phase Development Workflow

This document describes a structured approach to implementation work, ensuring thorough testing and documentation at each step.

## Core Principles

1. **Complete each step fully before moving to the next** — including testing, verification, and findings documentation
2. **Document what you learn** — Findings from each step inform future work
3. **Test at multiple levels** — Unit tests, integration tests, and manual verification
4. **Keep steps small and verifiable** — Each step should have clear success criteria

---

## Workflow Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PLAN      │────▶│  IMPLEMENT  │────▶│   VERIFY    │────▶│  DOCUMENT   │
│             │     │             │     │             │     │             │
│ • Objective │     │ • Write code│     │ • Run tests │     │ • Findings  │
│ • Tasks     │     │ • Write     │     │ • Typecheck │     │ • What      │
│ • Success   │     │   tests     │     │ • Lint      │     │   worked    │
│   criteria  │     │             │     │ • Manual    │     │ • What      │
│             │     │             │     │   testing   │     │   didn't    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            Next Step
```

---

## Step Structure

Each implementation step follows this structure:

### 1. Plan Document (`docs/plans/step-N-plan.md`)

Before starting, create a plan with:
- **Objective** — What this step accomplishes
- **Tasks** — Numbered list of specific things to do
- **Success Criteria** — How to know the step is complete

### 2. Implementation

Write code following the plan. Include:
- Main implementation code
- Unit tests for new functionality
- Integration tests where applicable

### 3. Verification

Run all checks before considering the step complete:

```bash
# Type checking
bun run typecheck    # or: bunx tsc --noEmit

# Linting
bun run lint

# Tests
bun test

# Manual verification
bun run dev          # Actually run it and observe behavior
```

### 4. Findings Document (`docs/plans/step-N-findings.md`)

After completing the step, document:
- **Date** — When completed
- **What Worked** — Things that went smoothly
- **What Didn't Work** — Problems encountered and solutions
- **Notes for Next Time** — Lessons learned
- **Deviations from Plan** — Any changes from original plan

---

## Implementation Guide Structure

For larger projects, create an `IMPLEMENTATION_GUIDE.md` that outlines all steps. Each step should include:

```markdown
## Step N: [Name]

### Goal
Brief description of what this step accomplishes.

### N.1 First Task
Code examples and instructions...

### N.2 Second Task
Code examples and instructions...

### Testing & Verification
```bash
# Commands to verify the step works
```

### Checklist
- [ ] First requirement met
- [ ] Second requirement met
- [ ] Tests passing

### Findings
```
Date: ___________
What worked:

What didn't:

Notes for next time:
```
```

---

## Testing Guidelines

### For Each Step:

1. **Unit Tests**
   - Test pure functions in isolation
   - Mock external dependencies
   - Cover happy path + error cases

2. **Integration Tests**
   - Test component interactions
   - Use real dependencies where safe
   - Mark as skip in CI if needs external services

3. **Manual Testing**
   - Actually run the feature
   - Try edge cases manually
   - Document unexpected behavior

4. **Review & Document**
   - What worked well?
   - What was harder than expected?
   - What would you do differently?
   - What technical debt was incurred?

---

## Templates

See the `docs/plans/` directory for templates:
- `STEP_PLAN_TEMPLATE.md` — For planning each step
- `STEP_FINDINGS_TEMPLATE.md` — For documenting results

See `docs/IMPLEMENTATION_GUIDE_TEMPLATE.md` for a full project implementation guide structure.
