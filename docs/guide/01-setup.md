# Step 0-1: Environment Setup & Project Scaffolding

## Step 0: Environment Setup

### Prerequisites Check

```bash
bun --version     # Should be 1.0+
git --version
```

### IDE Configuration (Recommended)

VS Code extensions:
- ESLint
- Tailwind CSS IntelliSense
- TypeScript support

### Verification
- [ ] Bun 1.0+ installed
- [ ] Git configured
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
Set up Vite + React + TypeScript project with Tailwind CSS.

### 1.1 Create Vite Project

```bash
bun create vite query-plan-visualizer --template react-ts
cd query-plan-visualizer
```

### 1.2 Install Dependencies

```bash
bun install

# Tailwind CSS
bun add -D tailwindcss postcss autoprefixer
bunx tailwindcss init -p

# Utilities
bun add clsx

# Testing
bun add -D vitest
```

### 1.3 Configure Tailwind

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4 Configure TypeScript Strictly

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.5 Create Directory Structure

```bash
mkdir -p src/components
mkdir -p src/parsers
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/examples
```

### 1.6 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Testing & Verification

```bash
bun dev              # Should start dev server at localhost:5173
bun run typecheck    # Should pass with no errors
bun run build        # Should produce dist/ folder
```

### Checklist
- [ ] Vite project created
- [ ] Tailwind CSS configured and working
- [ ] TypeScript strict mode enabled
- [ ] Directory structure created
- [ ] Dev server runs successfully
- [ ] Build produces static files in dist/

### Findings
```
Date: ___________
What worked:

What didn't:

Notes for next time:
```
