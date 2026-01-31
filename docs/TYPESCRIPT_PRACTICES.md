# TypeScript + Bun Development Practices

Reference document for coding standards in TypeScript/Bun projects.

## Quick Reference

### tsconfig.json (Bun + Application)

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

### package.json Essentials

```json
{
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "typecheck": "bunx tsc --noEmit",
    "lint": "eslint src/",
    "test": "bun test"
  }
}
```

### ESLint Flat Config

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  eslintConfigPrettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true }
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  }
];
```

## Key Principles

### 1. Bun Transpiles, Doesn't Type-Check
Always run `bunx tsc --noEmit` separately. Bun executes TypeScript directly but won't catch type errors.

### 2. No Barrel Files
Import directly from source files:
```typescript
// Bad
import { Thing } from './utils';

// Good
import { Thing } from './utils/thing.js';
```

### 3. Discriminated Unions for State
```typescript
// Bad - allows impossible states
type State = {
  loading?: boolean;
  data?: User;
  error?: Error;
};

// Good - each state is explicit
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

### 4. Zod for External Data
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// At boundaries (API responses, file reads)
const result = UserSchema.safeParse(json);
if (!result.success) {
  console.error('Invalid user:', result.error);
}
```

### 5. Handle All Promises
```typescript
// Bad - floating promise
doSomethingAsync();

// Good
await doSomethingAsync();
// or
void doSomethingAsync(); // explicit fire-and-forget
// or
doSomethingAsync().catch(handleError);
```

### 6. Explicit Return Types on Exports
```typescript
// Implicit (avoid for exports)
export function processData(input: string) {
  return { result: input.toUpperCase() };
}

// Explicit (preferred for exports)
export function processData(input: string): { result: string } {
  return { result: input.toUpperCase() };
}
```

## Testing with bun:test

```typescript
import { describe, test, expect, mock, beforeEach } from 'bun:test';

describe('feature', () => {
  beforeEach(() => {
    // setup
  });

  test('does something', () => {
    expect(result).toBe(expected);
  });

  test('handles errors', () => {
    expect(() => badCall()).toThrow();
  });
});
```

### Mocking
```typescript
const mockFn = mock((x: number) => x * 2);
mockFn(5);
expect(mockFn).toHaveBeenCalledWith(5);
```

## File Organization

```
src/
├── index.ts              # Entry point
├── types.ts              # Shared types (or co-locate)
├── feature-a/
│   ├── feature-a.ts      # Implementation
│   └── feature-a.test.ts # Co-located tests
├── feature-b/
│   ├── feature-b.ts
│   └── feature-b.test.ts
└── utils/
    ├── specific-util.ts  # Named for what it does
    └── specific-util.test.ts
```

## Error Handling Pattern

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return { ok: false, error: new Error(`HTTP ${response.status}`) };
    }
    const data = await response.json();
    const parsed = UserSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: new Error('Invalid response') };
    }
    return { ok: true, value: parsed.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `session-manager.ts` |
| Types/Interfaces | PascalCase | `SessionConfig` |
| Functions/Variables | camelCase | `createSession` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Event types | colon-separated | `slot:event-name` |

## VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Recommended Extensions

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Pretty TypeScript Errors (`yoavbls.pretty-ts-errors`)
- Error Lens (`usernamehw.errorlens`)
- Bun (`oven.bun-vscode`)
