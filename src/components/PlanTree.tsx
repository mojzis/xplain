import { useMemo } from 'react';
import type { ParsedPlan, PlanNode as PlanNodeType } from '../types/plan';
import type { LayoutNode } from '../types/layout';
import { calculateLayout, getTreeBounds } from '../utils/layout';
import { PlanNode } from './PlanNode';
import { Connectors } from './Connectors';

interface PlanTreeProps {
  plan: ParsedPlan;
  onNodeSelect: (node: PlanNodeType | null) => void;
  selectedNodeId: string | null;
}

export function PlanTree({ plan, onNodeSelect, selectedNodeId }: PlanTreeProps) {
  const layout = useMemo(() => calculateLayout(plan.rootNode), [plan.rootNode]);

  const bounds = useMemo(() => getTreeBounds(layout), [layout]);

  const totalCost = plan.totalCost ?? plan.rootNode.estimatedCost ?? 1;

  function renderNode(layoutNode: LayoutNode): React.ReactNode {
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
            totalCost={totalCost}
            onClick={() => {
              if (selectedNodeId === layoutNode.node.id) {
                onNodeSelect(null);
              } else {
                onNodeSelect(layoutNode.node);
              }
            }}
          />
        </div>
        {layoutNode.children.map(renderNode)}
      </div>
    );
  }

  const padding = 20;

  return (
    <div className="overflow-auto bg-gray-50 rounded-lg border border-gray-200 h-full">
      <div
        className="relative"
        style={{
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: padding,
            top: padding,
            width: bounds.width,
            height: bounds.height,
          }}
        >
          <Connectors layout={layout} />
          {renderNode(layout)}
        </div>
      </div>
    </div>
  );
}
