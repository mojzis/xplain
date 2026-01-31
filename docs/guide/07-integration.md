# Steps 14-15: Final Integration & Build

## Overview
Assemble all components into the main App and prepare for production.

---

## Step 14: Main App Integration

### Goal
Wire up all components into a cohesive application.

### 14.1 Create Plan Viewer Component

Create `src/components/PlanViewer.tsx`:

```tsx
import { useState } from 'react';
import type { ParsedPlan, PlanNode } from '../types/plan';
import { PlanTree } from './PlanTree';
import { OverviewPanel } from './OverviewPanel';
import { DetailPanel } from './DetailPanel';

interface PlanViewerProps {
  plan: ParsedPlan;
  onReset: () => void;
}

export function PlanViewer({ plan, onReset }: PlanViewerProps) {
  const [selectedNode, setSelectedNode] = useState<PlanNode | null>(null);

  return (
    <div className="flex h-screen">
      <OverviewPanel plan={plan} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            Query Plan Visualization
          </h1>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            New Plan
          </button>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <PlanTree
            plan={plan}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id ?? null}
          />
        </div>
      </div>

      <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
```

### 14.2 Update App Component

Update `src/App.tsx`:

```tsx
import { useState } from 'react';
import type { ParsedPlan } from './types/plan';
import { PlanInput } from './components/PlanInput';
import { PlanViewer } from './components/PlanViewer';

function App() {
  const [plan, setPlan] = useState<ParsedPlan | null>(null);

  if (plan) {
    return <PlanViewer plan={plan} onReset={() => setPlan(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Query Plan Visualizer
          </h1>
          <p className="mt-2 text-gray-600">
            Paste a SQL Server, PostgreSQL, or Oracle execution plan to visualize it.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            All processing happens in your browser — your data never leaves your machine.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <PlanInput onPlanParsed={setPlan} />
        </div>
      </div>
    </div>
  );
}

export default App;
```

### 14.3 Component Index

Create `src/components/index.ts`:

```typescript
export { PlanInput } from './PlanInput';
export { PlanViewer } from './PlanViewer';
export { PlanTree } from './PlanTree';
export { PlanNode } from './PlanNode';
export { OverviewPanel } from './OverviewPanel';
export { DetailPanel } from './DetailPanel';
export { DatabaseTabs } from './DatabaseTabs';
export { Connectors } from './Connectors';
```

---

## Step 15: Final Polish & Build

### Goal
Final testing, polish, and production build.

### 15.1 Update Page Title

Update `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Query Plan Visualizer</title>
    <meta name="description" content="Visualize SQL Server, PostgreSQL, and Oracle execution plans. All processing happens in your browser.">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 15.2 Add Sample Plans

Create `src/examples/index.ts`:

```typescript
export const SQLSERVER_SAMPLE = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT * FROM Orders WHERE CustomerId = 1">
          <QueryPlan>
            <RelOp PhysicalOp="Nested Loops" LogicalOp="Inner Join" EstimateRows="10" EstimatedTotalSubtreeCost="0.05">
              <NestedLoops>
                <RelOp PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="1" EstimatedTotalSubtreeCost="0.01">
                  <IndexScan>
                    <Object Table="Customers" Index="IX_CustomerId"/>
                  </IndexScan>
                </RelOp>
                <RelOp PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="10" EstimatedTotalSubtreeCost="0.03">
                  <IndexScan>
                    <Object Table="Orders" Index="IX_CustomerId"/>
                  </IndexScan>
                </RelOp>
              </NestedLoops>
            </RelOp>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

export const POSTGRESQL_SAMPLE = JSON.stringify([{
  Plan: {
    'Node Type': 'Hash Join',
    'Join Type': 'Inner',
    'Plan Rows': 100,
    'Total Cost': 50.5,
    Plans: [
      {
        'Node Type': 'Seq Scan',
        'Relation Name': 'customers',
        'Plan Rows': 10,
        'Total Cost': 10.5
      },
      {
        'Node Type': 'Hash',
        'Plan Rows': 100,
        'Total Cost': 30.0,
        Plans: [
          {
            'Node Type': 'Index Scan',
            'Relation Name': 'orders',
            'Index Name': 'orders_customer_idx',
            'Plan Rows': 100,
            'Total Cost': 25.0
          }
        ]
      }
    ]
  }
}], null, 2);
```

### 15.3 Final Verification

```bash
# Run all tests
bun test

# Type check
bun run typecheck

# Build for production
bun run build

# Preview production build
bun run preview
```

### 15.4 Test Checklist

Manual testing:
- [ ] Paste SQL Server XML plan → visualization displays
- [ ] Paste PostgreSQL JSON plan → visualization displays
- [ ] Paste Oracle text plan → visualization displays
- [ ] Drag and drop .sqlplan file works
- [ ] Auto-detection correctly identifies format
- [ ] Invalid input shows clear error message
- [ ] Click node → detail panel opens
- [ ] Overview panel shows correct stats
- [ ] Warning nodes highlighted correctly
- [ ] "New Plan" button resets to input
- [ ] Works with JavaScript disabled (graceful degradation message)

### 15.5 Build Output

Verify `dist/` contains:
- `index.html`
- `assets/` with JS and CSS bundles

Total bundle size should be reasonable (< 500KB uncompressed).

## Deployment

The `dist/` folder can be deployed to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Any web server

No server-side code required — it's a pure static site.

## Success Criteria

1. All three database formats parse and visualize correctly
2. Warnings are detected and highlighted
3. Tree layout handles complex plans
4. Detail panel shows all relevant info
5. Works offline after initial load
6. No data sent to any external server
7. Production build is < 500KB
8. Works in modern browsers (Chrome, Firefox, Safari, Edge)
