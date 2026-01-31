# Step 2: Core Types & Interfaces

## Goal
Define the TypeScript interfaces that normalize different database plan formats into a unified structure.

## 2.1 Plan Node Interface

Create `src/types/plan.ts`:

```typescript
export type DatabaseType = 'sqlserver' | 'postgresql' | 'oracle';

export interface Warning {
  type: 'missing-index' | 'implicit-conversion' | 'spill' | 'scan' | 'other';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface PlanNode {
  id: string;
  operation: string;           // e.g., "Index Seek", "Hash Match"
  objectName?: string;         // Table/index name
  estimatedRows?: number;
  actualRows?: number;
  estimatedCost?: number;      // Relative cost (0-100%)
  actualCost?: number;
  estimatedIO?: number;
  estimatedCPU?: number;
  actualExecutions?: number;

  // Timing (if available)
  elapsedTime?: number;        // milliseconds

  // Warnings
  warnings: Warning[];

  // Children in execution order
  children: PlanNode[];

  // Raw properties from source
  properties: Record<string, unknown>;
}

export interface ParsedPlan {
  database: DatabaseType;
  rootNode: PlanNode;
  statementText?: string;
  totalCost?: number;
  parseTime: number;           // ms to parse
}
```

## 2.2 Layout Types

Create `src/types/layout.ts`:

```typescript
export interface Position {
  x: number;
  y: number;
}

export interface LayoutNode {
  node: PlanNode;
  position: Position;
  width: number;
  height: number;
  children: LayoutNode[];
}

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalGap: number;
  verticalGap: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 200,
  nodeHeight: 80,
  horizontalGap: 40,
  verticalGap: 60,
};
```

## 2.3 Export Types

Create `src/types/index.ts`:

```typescript
export * from './plan';
export * from './layout';
```

## Verification

```bash
bun run typecheck    # Should pass
```

## Checklist
- [ ] PlanNode interface defined
- [ ] Warning types defined
- [ ] Layout types defined
- [ ] Types export cleanly
- [ ] TypeScript check passes
