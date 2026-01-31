import { useState, useCallback, useRef, useEffect } from 'react';
import type { ParsedPlan, PlanNode } from '../types/plan';
import { PlanTree } from './PlanTree';
import { OverviewPanel } from './OverviewPanel';
import { DetailPanel } from './DetailPanel';

interface PlanViewerProps {
  plan: ParsedPlan;
  onReset: () => void;
}

const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 500;

export function PlanViewer({ plan, onReset }: PlanViewerProps) {
  const [selectedNode, setSelectedNode] = useState<PlanNode | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(256);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizingLeft) {
        const newWidth = e.clientX - containerRect.left;
        setLeftPanelWidth(Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth)));
      }

      if (isResizingRight) {
        const newWidth = containerRect.right - e.clientX;
        setRightPanelWidth(Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth)));
      }
    },
    [isResizingLeft, isResizingRight]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-100">
      <div
        className="bg-white border-r border-gray-200 p-4 flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: leftPanelWidth }}
      >
        <OverviewPanel plan={plan} />
      </div>

      <ResizeHandle onMouseDown={() => setIsResizingLeft(true)} />

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
        <>
          <ResizeHandle onMouseDown={() => setIsResizingRight(true)} />
          <div
            className="bg-white border-l border-gray-200 p-4 flex flex-col flex-shrink-0 overflow-hidden"
            style={{ width: rightPanelWidth }}
          >
            <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        </>
      )}
    </div>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: () => void }) {
  return (
    <div
      className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
      onMouseDown={onMouseDown}
    />
  );
}
