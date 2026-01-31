# Steps 8-11: Visualization Components

## Overview
Build the tree visualization including layout algorithm, node cards, and SVG connectors.

---

## Step 8: Tree Layout Algorithm

### Goal
Calculate positions for nodes to create a hierarchical tree layout.

### 8.1 Create Layout Utility

Create `src/utils/layout.ts`:

```typescript
import type { PlanNode } from '../types/plan';
import type { LayoutNode, LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../types/layout';

export function calculateLayout(
  root: PlanNode,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutNode {
  // First pass: calculate subtree widths
  const widths = new Map<string, number>();
  calculateSubtreeWidths(root, widths, config);

  // Second pass: assign positions
  return assignPositions(root, 0, 0, widths, config);
}

function calculateSubtreeWidths(
  node: PlanNode,
  widths: Map<string, number>,
  config: LayoutConfig
): number {
  if (node.children.length === 0) {
    widths.set(node.id, config.nodeWidth);
    return config.nodeWidth;
  }

  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += calculateSubtreeWidths(child, widths, config);
    totalWidth += config.horizontalGap;
  }
  totalWidth -= config.horizontalGap; // Remove last gap

  const width = Math.max(totalWidth, config.nodeWidth);
  widths.set(node.id, width);
  return width;
}

function assignPositions(
  node: PlanNode,
  x: number,
  y: number,
  widths: Map<string, number>,
  config: LayoutConfig
): LayoutNode {
  const subtreeWidth = widths.get(node.id) ?? config.nodeWidth;

  // Center node in its subtree
  const nodeX = x + (subtreeWidth - config.nodeWidth) / 2;

  const layoutNode: LayoutNode = {
    node,
    position: { x: nodeX, y },
    width: config.nodeWidth,
    height: config.nodeHeight,
    children: [],
  };

  // Position children
  let childX = x;
  const childY = y + config.nodeHeight + config.verticalGap;

  for (const child of node.children) {
    const childWidth = widths.get(child.id) ?? config.nodeWidth;
    const childLayout = assignPositions(child, childX, childY, widths, config);
    layoutNode.children.push(childLayout);
    childX += childWidth + config.horizontalGap;
  }

  return layoutNode;
}

export function getTreeBounds(layout: LayoutNode): { width: number; height: number } {
  let maxX = layout.position.x + layout.width;
  let maxY = layout.position.y + layout.height;

  function traverse(node: LayoutNode) {
    maxX = Math.max(maxX, node.position.x + node.width);
    maxY = Math.max(maxY, node.position.y + node.height);
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(layout);

  return { width: maxX, height: maxY };
}
```

### 8.2 Create Tests

Create `src/utils/layout.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLayout, getTreeBounds } from './layout';
import type { PlanNode } from '../types/plan';

describe('Layout Algorithm', () => {
  it('lays out a single node', () => {
    const node: PlanNode = {
      id: '1',
      operation: 'Test',
      warnings: [],
      children: [],
      properties: {},
    };

    const layout = calculateLayout(node);

    expect(layout.position.x).toBe(0);
    expect(layout.position.y).toBe(0);
  });

  it('centers parent over children', () => {
    const node: PlanNode = {
      id: '1',
      operation: 'Parent',
      warnings: [],
      children: [
        { id: '2', operation: 'Child1', warnings: [], children: [], properties: {} },
        { id: '3', operation: 'Child2', warnings: [], children: [], properties: {} },
      ],
      properties: {},
    };

    const layout = calculateLayout(node);

    // Parent should be centered over children
    const childrenMidpoint = (layout.children[0]!.position.x + layout.children[1]!.position.x + 200) / 2;
    const parentMidpoint = layout.position.x + 100;

    expect(Math.abs(parentMidpoint - childrenMidpoint)).toBeLessThan(1);
  });
});
```

---

## Step 9: Plan Node Component

### Goal
Create the node card component that displays operation details.

### 9.1 Create Node Component

Create `src/components/PlanNode.tsx`:

```tsx
import { clsx } from 'clsx';
import type { PlanNode as PlanNodeType } from '../types/plan';

interface PlanNodeProps {
  node: PlanNodeType;
  isSelected: boolean;
  onClick: () => void;
}

export function PlanNode({ node, isSelected, onClick }: PlanNodeProps) {
  const hasWarnings = node.warnings.length > 0;
  const hasCriticalWarning = node.warnings.some(w => w.severity === 'critical');

  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-[200px] rounded-lg border-2 cursor-pointer transition-all shadow-sm hover:shadow-md',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        hasCriticalWarning
          ? 'border-red-400 bg-red-50'
          : hasWarnings
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-200 bg-white'
      )}
    >
      <div className="p-3">
        <div className="font-medium text-sm text-gray-800 truncate">
          {node.operation}
        </div>

        {node.objectName && (
          <div className="text-xs text-gray-500 truncate mt-1">
            {node.objectName}
          </div>
        )}

        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {node.estimatedRows !== undefined && (
            <span>Rows: {formatNumber(node.estimatedRows)}</span>
          )}
          {node.estimatedCost !== undefined && (
            <span>Cost: {node.estimatedCost.toFixed(2)}</span>
          )}
        </div>

        {hasWarnings && (
          <div className="mt-2 flex gap-1">
            {node.warnings.map((warning, i) => (
              <span
                key={i}
                className={clsx(
                  'text-xs px-1.5 py-0.5 rounded',
                  warning.severity === 'critical'
                    ? 'bg-red-200 text-red-800'
                    : warning.severity === 'warning'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-blue-200 text-blue-800'
                )}
              >
                {warning.type}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
```

---

## Step 10: SVG Connectors

### Goal
Draw lines connecting parent nodes to children.

### 10.1 Create Connectors Component

Create `src/components/Connectors.tsx`:

```tsx
import type { LayoutNode } from '../types/layout';

interface ConnectorsProps {
  layout: LayoutNode;
}

export function Connectors({ layout }: ConnectorsProps) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  function collectLines(node: LayoutNode) {
    const parentX = node.position.x + node.width / 2;
    const parentY = node.position.y + node.height;

    for (const child of node.children) {
      const childX = child.position.x + child.width / 2;
      const childY = child.position.y;

      lines.push({
        x1: parentX,
        y1: parentY,
        x2: childX,
        y2: childY,
      });

      collectLines(child);
    }
  }

  collectLines(layout);

  return (
    <svg className="absolute inset-0 pointer-events-none">
      {lines.map((line, i) => (
        <path
          key={i}
          d={`M ${line.x1} ${line.y1} C ${line.x1} ${(line.y1 + line.y2) / 2}, ${line.x2} ${(line.y1 + line.y2) / 2}, ${line.x2} ${line.y2}`}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
```

---

## Step 11: Plan Tree Component

### Goal
Combine layout, nodes, and connectors into a complete tree view.

### 11.1 Create Tree Component

Create `src/components/PlanTree.tsx`:

```tsx
import { useMemo, useState } from 'react';
import type { ParsedPlan, PlanNode as PlanNodeType } from '../types/plan';
import { calculateLayout, getTreeBounds } from '../utils/layout';
import { PlanNode } from './PlanNode';
import { Connectors } from './Connectors';
import type { LayoutNode } from '../types/layout';

interface PlanTreeProps {
  plan: ParsedPlan;
  onNodeSelect: (node: PlanNodeType | null) => void;
  selectedNodeId: string | null;
}

export function PlanTree({ plan, onNodeSelect, selectedNodeId }: PlanTreeProps) {
  const layout = useMemo(
    () => calculateLayout(plan.rootNode),
    [plan.rootNode]
  );

  const bounds = useMemo(() => getTreeBounds(layout), [layout]);

  function renderNode(layoutNode: LayoutNode) {
    return (
      <div key={layoutNode.node.id}>
        <div
          style={{
            position: 'absolute',
            left: layoutNode.position.x,
            top: layoutNode.position.y,
          }}
        >
          <PlanNode
            node={layoutNode.node}
            isSelected={selectedNodeId === layoutNode.node.id}
            onClick={() => onNodeSelect(layoutNode.node)}
          />
        </div>
        {layoutNode.children.map(renderNode)}
      </div>
    );
  }

  return (
    <div className="overflow-auto bg-gray-50 rounded-lg border border-gray-200">
      <div
        className="relative"
        style={{
          width: bounds.width + 40,
          height: bounds.height + 40,
          padding: 20,
        }}
      >
        <Connectors layout={layout} />
        {renderNode(layout)}
      </div>
    </div>
  );
}
```

## Verification

```bash
bun test            # All tests pass
bun run typecheck   # TypeScript passes
bun dev             # Visual verification in browser
```

## Checklist
- [ ] Layout algorithm positions nodes correctly
- [ ] Nodes display operation, object, rows, cost
- [ ] Warnings highlighted with appropriate colors
- [ ] Connectors draw smooth curves
- [ ] Tree is scrollable for large plans
- [ ] Node selection works
