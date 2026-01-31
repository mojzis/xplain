import { describe, it, expect } from 'vitest';
import { calculateLayout, getTreeBounds } from './layout';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layout';
import type { PlanNode } from '../types/plan';

const { nodeWidth, nodeHeight, horizontalGap, verticalGap } = DEFAULT_LAYOUT_CONFIG;

function createNode(id: string, children: PlanNode[] = []): PlanNode {
  return {
    id,
    operation: `Op-${id}`,
    warnings: [],
    children,
    properties: {},
  };
}

describe('Layout Algorithm', () => {
  it('lays out a single node at origin', () => {
    const node = createNode('1');
    const layout = calculateLayout(node);

    expect(layout.position.x).toBe(0);
    expect(layout.position.y).toBe(0);
    expect(layout.width).toBe(nodeWidth);
    expect(layout.height).toBe(nodeHeight);
  });

  it('positions children below parent', () => {
    const node = createNode('1', [createNode('2')]);
    const layout = calculateLayout(node);

    expect(layout.children.length).toBe(1);
    expect(layout.children[0]?.position.y).toBe(nodeHeight + verticalGap);
  });

  it('centers parent over children', () => {
    const node = createNode('1', [createNode('2'), createNode('3')]);
    const layout = calculateLayout(node);

    const leftChild = layout.children[0];
    const rightChild = layout.children[1];

    if (leftChild && rightChild) {
      const childrenMidX =
        (leftChild.position.x + rightChild.position.x + rightChild.width) / 2;
      const parentMidX = layout.position.x + layout.width / 2;

      expect(Math.abs(parentMidX - childrenMidX)).toBeLessThan(1);
    }
  });

  it('spaces children with horizontal gap', () => {
    const node = createNode('1', [createNode('2'), createNode('3')]);
    const layout = calculateLayout(node);

    const leftChild = layout.children[0];
    const rightChild = layout.children[1];

    if (leftChild && rightChild) {
      const gap = rightChild.position.x - (leftChild.position.x + leftChild.width);
      expect(gap).toBe(horizontalGap);
    }
  });

  it('handles deep trees', () => {
    const node = createNode('1', [
      createNode('2', [createNode('3', [createNode('4')])]),
    ]);
    const layout = calculateLayout(node);

    // Should have 4 levels
    let depth = 0;
    let current: typeof layout | undefined = layout;
    while (current) {
      depth++;
      current = current.children[0];
    }
    expect(depth).toBe(4);
  });
});

describe('getTreeBounds', () => {
  it('returns bounds for single node', () => {
    const node = createNode('1');
    const layout = calculateLayout(node);
    const bounds = getTreeBounds(layout);

    expect(bounds.width).toBe(nodeWidth);
    expect(bounds.height).toBe(nodeHeight);
  });

  it('returns bounds for wide tree', () => {
    const node = createNode('1', [
      createNode('2'),
      createNode('3'),
      createNode('4'),
    ]);
    const layout = calculateLayout(node);
    const bounds = getTreeBounds(layout);

    // 3 nodes * nodeWidth + 2 gaps * horizontalGap
    expect(bounds.width).toBe(3 * nodeWidth + 2 * horizontalGap);
    // 2 levels: nodeHeight + verticalGap + nodeHeight
    expect(bounds.height).toBe(2 * nodeHeight + verticalGap);
  });
});
