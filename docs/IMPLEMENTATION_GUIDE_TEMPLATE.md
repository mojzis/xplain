# [Project Name] — Implementation Guide

This document provides step-by-step instructions for building [project name]. **Each step must be completed fully before moving to the next**, including testing, manual verification, and documentation of findings.

---

## Step 0: Environment Setup

### Prerequisites Check

```bash
# Verify required tools are installed
bun --version     # Should be 1.1.0+
git --version
# [Add other prerequisites]
```

### Install Global Tools

```bash
# [Add global tool installation commands]
bun add -g typescript
```

### IDE Configuration (Recommended)

[List recommended extensions and settings]

### Verification
- [ ] All version checks pass
- [ ] Global tools installed
- [ ] IDE configured

### Findings
```
Date: ___________
What worked:

What didn't:

Notes for next time:
```

---

## Step 1: Project Scaffolding

### Goal
Set up the project structure and initial configuration.

### 1.1 Initialize Project

```bash
mkdir project-name
cd project-name
git init

# Create package.json
cat > package.json << 'EOF'
{
  "name": "project-name",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test",
    "typecheck": "bunx tsc --noEmit",
    "lint": "eslint src/"
  }
}
EOF
```

### 1.2 Configure TypeScript

Create `tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["bun-types"],

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,

    "outDir": "dist",
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Install Dependencies

```bash
bun install
bun add [production-dependencies]
bun add -d @types/bun typescript eslint prettier
```

### 1.4 Create Entry Point

Create `src/index.ts`:

```typescript
console.log('[Project] starting...');

export async function main(): Promise<void> {
  console.log('Initialized');
}

main().catch(console.error);
```

### Testing & Verification

```bash
bun install
bun run typecheck   # Should pass with no errors
bun run lint        # Should pass
bun run test        # Should run (no tests yet, that's OK)
bun run dev         # Should run and print message
```

### Checklist
- [ ] Project structure created
- [ ] TypeScript compiles cleanly
- [ ] ESLint passes
- [ ] Entry point runs

### Findings
```
Date: ___________
What worked:

What didn't:

Dependency issues encountered:

Configuration adjustments needed:

Notes for next time:
```

---

## Step 2: [Core Feature Name]

### Goal
[What this step accomplishes]

### 2.1 Create Types

Create `src/types.ts`:

```typescript
// Define your core types here
```

### 2.2 Implement Feature

Create `src/feature/feature-name.ts`:

```typescript
// Implementation here
```

### 2.3 Write Tests

Create `src/feature/feature-name.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test';

describe('Feature', () => {
  test('does something', () => {
    expect(true).toBe(true);
  });
});
```

### Testing & Verification

```bash
bun run typecheck
bun test
bun run dev
# Manual observation: Does it work?
```

### Checklist
- [ ] Types defined
- [ ] Feature implemented
- [ ] Tests passing
- [ ] Manual verification complete

### Findings
```
Date: ___________
What worked:

What didn't:

Edge cases discovered:

Performance notes:

Changes needed for next step:
```

---

## Steps 3-N: Continue Pattern

Each subsequent step follows the same structure:
1. Goal statement
2. Numbered implementation tasks with code
3. Testing & verification commands
4. Checklist
5. Findings template

### Step 3: [Name]
- [Brief description of this step]

### Step 4: [Name]
- [Brief description of this step]

### Step 5: [Name]
- [Brief description of this step]

---

## General Testing Guidelines

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

### Test Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test src/feature/feature.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

---

## Troubleshooting

### Common Issues

**"Cannot find module" errors**
- Ensure `.js` extensions in imports (ESM requirement)
- Run `bun install` after adding dependencies

**TypeScript errors not showing**
- Bun doesn't type-check! Run `bun run typecheck` explicitly

**[Add project-specific troubleshooting]**

---

## Completion Checklist

Before considering the project "v1.0":

- [ ] All steps completed with tests passing
- [ ] Documentation updated with findings
- [ ] No critical TODOs remaining
- [ ] Manual end-to-end test successful
- [ ] Performance acceptable
