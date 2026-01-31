import type { PlanNode } from '../types/plan';
import type { LayoutNode, LayoutConfig } from '../types/layout';
import { DEFAULT_LAYOUT_CONFIG } from '../types/layout';

export function calculateLayout(
  root: PlanNode,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutNode {
  const widths = new Map<string, number>();
  calculateSubtreeWidths(root, widths, config);

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
  totalWidth -= config.horizontalGap;

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

  const nodeX = x + (subtreeWidth - config.nodeWidth) / 2;

  const layoutNode: LayoutNode = {
    node,
    position: { x: nodeX, y },
    width: config.nodeWidth,
    height: config.nodeHeight,
    children: [],
  };

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

  function traverse(node: LayoutNode): void {
    maxX = Math.max(maxX, node.position.x + node.width);
    maxY = Math.max(maxY, node.position.y + node.height);
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(layout);

  return { width: maxX, height: maxY };
}
