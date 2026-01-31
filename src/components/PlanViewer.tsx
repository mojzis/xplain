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
    <div className="flex h-screen bg-gray-100">
      <OverviewPanel plan={plan} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">
            Query Plan Visualization
          </h1>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
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

      {selectedNode && (
        <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
