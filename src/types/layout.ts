import type { PlanNode } from './plan';

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
  nodeWidth: 220,
  nodeHeight: 100,
  horizontalGap: 40,
  verticalGap: 48,
};
