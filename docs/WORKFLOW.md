# Build Workflow

## Current Status
Check CLAUDE.md for which steps are complete. Continue from the next incomplete step.

## For Each Step:

1. Read the step details in docs/IMPLEMENTATION_GUIDE.md
2. Create a brief plan in /docs/plans/step-N-plan.md
3. Execute the plan
4. Run all tests and verification checks
5. Document findings in /docs/plans/step-N-findings.md
6. Update implementation status in CLAUDE.md
7. Commit: `git add -A && git commit -m "feat: step N - description"`
8. Run `/clear` then start next step with this prompt:
```
Read CLAUDE.md, docs/WORKFLOW.md, docs/IMPLEMENTATION_GUIDE.md,
and all files in docs/plans/. Then continue with the next
incomplete step. Do not ask for input.
```

## Decision Making
- If blocked, document in /docs/plans/blockers.md and continue
- Make reasonable decisions and document them
- Do not ask for input

## Starting Prompt

Use this prompt to kick off execution:

```
Read CLAUDE.md, docs/WORKFLOW.md, docs/IMPLEMENTATION_GUIDE.md,
and all files in docs/plans/. Then continue with the next
incomplete step. Do not ask for input.
```

## Quick Reference

| Phase | What to Do |
|-------|-----------|
| **Plan** | Create docs/plans/step-N-plan.md with tasks and success criteria |
| **Implement** | Write code, write tests |
| **Verify** | `bun test`, `bun run typecheck`, `bun run lint`, manual testing |
| **Document** | Create docs/plans/step-N-findings.md |
| **Update** | Mark step complete in CLAUDE.md |
| **Commit** | `git add -A && git commit -m "feat: step N - description"` |
| **Continue** | Run `/clear` then the continuation prompt |
