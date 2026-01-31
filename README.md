# Claude Code Project Template

A structured template for building projects with Claude Code using a phase-by-phase development workflow. Each step is planned, implemented, verified, and documented before moving to the next.

## Quick Start

### 1. Create a new repo from this template

**Via GitHub:**
Click "Use this template" → "Create a new repository"

**Via CLI:**
```bash
gh repo create my-project --template mojzis/claude-template --clone
cd my-project
```

### 2. Set up your project

```bash
# Rename the CLAUDE.md template
mv CLAUDE.md.template CLAUDE.md

# Edit CLAUDE.md with your project details:
# - Project overview
# - Architecture decisions
# - Implementation steps (the checklist)
```

### 3. Create your implementation guide

Edit `docs/IMPLEMENTATION_GUIDE_TEMPLATE.md` (or rename it) with the detailed steps for your project. Each step should have:
- Goal
- Tasks with code examples
- Testing & verification commands
- Checklist
- Findings template

### 4. Start building

Run this prompt to kick off unattended execution:

```
Read CLAUDE.md, docs/WORKFLOW.md, docs/IMPLEMENTATION_GUIDE.md,
and all files in docs/plans/. Then continue with the next
incomplete step. Do not ask for input.
```

Claude will work through each step automatically, documenting findings and committing after each one.

## What's Included

```
├── CLAUDE.md.template              # Project context template
├── DEV_WORKFLOW.md                 # Overview of the approach
└── docs/
    ├── IMPLEMENTATION_GUIDE_TEMPLATE.md   # Step-by-step build guide template
    ├── TYPESCRIPT_PRACTICES.md            # TypeScript/Bun coding standards
    ├── WORKFLOW.md                        # The continuation prompts
    └── plans/
        ├── STEP_PLAN_TEMPLATE.md          # Template for each step's plan
        └── STEP_FINDINGS_TEMPLATE.md      # Template for documenting results
```

## How It Works

For each implementation step, Claude will:

1. Create a plan in `docs/plans/step-N-plan.md`
2. Implement the code and tests
3. Run verification (`bun test`, `bun run typecheck`, `bun run lint`)
4. Document findings in `docs/plans/step-N-findings.md`
5. Update the checkbox in `CLAUDE.md`
6. Commit the changes
7. Run `/clear` and continue to the next step

The `/clear` between steps keeps context fresh while the continuation prompt maintains the loop.

## Resuming

If a session ends mid-way, just run the same starting prompt. Claude will read the status from `CLAUDE.md` and continue from where it left off.
