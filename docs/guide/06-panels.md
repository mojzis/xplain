# Steps 12-13: Overview and Detail Panels

## Overview
Add sidebar panels for plan overview and node details.

---

## Step 12: Overview Panel

### Goal
Create a sidebar showing plan summary and statistics.

### 12.1 Create Overview Panel

Create `src/components/OverviewPanel.tsx`:

```tsx
import type { ParsedPlan } from '../types/plan';

interface OverviewPanelProps {
  plan: ParsedPlan;
}

export function OverviewPanel({ plan }: OverviewPanelProps) {
  const stats = calculateStats(plan);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Plan Overview</h2>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Database
          </div>
          <div className="text-sm text-gray-800 mt-1 capitalize">
            {plan.database}
          </div>
        </div>

        {plan.totalCost !== undefined && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Cost
            </div>
            <div className="text-sm text-gray-800 mt-1">
              {plan.totalCost.toFixed(4)}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Parse Time
          </div>
          <div className="text-sm text-gray-800 mt-1">
            {plan.parseTime.toFixed(2)} ms
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Operators
          </div>
          <div className="text-sm text-gray-800 mt-1">
            {stats.nodeCount}
          </div>
        </div>

        {stats.warningCount > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Warnings
            </div>
            <div className="text-sm text-orange-600 mt-1 font-medium">
              {stats.warningCount}
            </div>
          </div>
        )}

        {plan.statementText && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Statement
            </div>
            <div className="text-xs text-gray-600 mt-1 font-mono bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
              {plan.statementText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateStats(plan: ParsedPlan) {
  let nodeCount = 0;
  let warningCount = 0;

  function traverse(node: ParsedPlan['rootNode']) {
    nodeCount++;
    warningCount += node.warnings.length;
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(plan.rootNode);

  return { nodeCount, warningCount };
}
```

---

## Step 13: Detail Panel

### Goal
Create a panel showing detailed info for the selected node.

### 13.1 Create Detail Panel

Create `src/components/DetailPanel.tsx`:

```tsx
import type { PlanNode } from '../types/plan';
import { clsx } from 'clsx';

interface DetailPanelProps {
  node: PlanNode | null;
  onClose: () => void;
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {node.operation}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {node.objectName && (
          <DetailRow label="Object" value={node.objectName} />
        )}

        {node.estimatedRows !== undefined && (
          <DetailRow label="Estimated Rows" value={node.estimatedRows.toLocaleString()} />
        )}

        {node.actualRows !== undefined && (
          <DetailRow label="Actual Rows" value={node.actualRows.toLocaleString()} />
        )}

        {node.estimatedCost !== undefined && (
          <DetailRow label="Estimated Cost" value={node.estimatedCost.toFixed(6)} />
        )}

        {node.elapsedTime !== undefined && (
          <DetailRow label="Elapsed Time" value={`${node.elapsedTime.toFixed(3)} ms`} />
        )}

        {node.warnings.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Warnings
            </div>
            <div className="space-y-2">
              {node.warnings.map((warning, i) => (
                <div
                  key={i}
                  className={clsx(
                    'p-2 rounded text-sm',
                    warning.severity === 'critical'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : warning.severity === 'warning'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  )}
                >
                  <div className="font-medium">{warning.type}</div>
                  <div className="text-xs mt-1">{warning.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Properties
          </div>
          <div className="bg-gray-50 rounded p-2 max-h-48 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(node.properties, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-gray-800 mt-1">{value}</div>
    </div>
  );
}
```

## Verification

```bash
bun run typecheck   # TypeScript passes
bun dev             # Visual verification in browser
```

## Checklist
- [ ] Overview panel shows plan summary
- [ ] Overview panel shows warning count
- [ ] Detail panel opens on node selection
- [ ] Detail panel shows all node properties
- [ ] Detail panel displays warnings
- [ ] Close button works
