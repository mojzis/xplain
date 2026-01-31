import { useState, useCallback, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
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
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Query Plan Visualization
            </h1>
            <DatabaseBadge database={plan.database} />
          </div>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            New Plan
          </button>
        </div>

        <div className="flex-1 p-4 overflow-hidden bg-gray-50">
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

function DatabaseBadge({ database }: { database: string }) {
  const config = getDatabaseConfig(database);
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
        config.className
      )}
    >
      <span className={clsx('w-2 h-2 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}

function getDatabaseConfig(db: string): {
  label: string;
  className: string;
  dotClassName: string;
} {
  switch (db) {
    case 'sqlserver':
      return {
        label: 'SQL Server',
        className: 'bg-blue-100 text-blue-800',
        dotClassName: 'bg-blue-500',
      };
    case 'postgresql':
      return {
        label: 'PostgreSQL',
        className: 'bg-indigo-100 text-indigo-800',
        dotClassName: 'bg-indigo-500',
      };
    case 'oracle':
      return {
        label: 'Oracle',
        className: 'bg-red-100 text-red-800',
        dotClassName: 'bg-red-500',
      };
    default:
      return {
        label: db,
        className: 'bg-gray-100 text-gray-800',
        dotClassName: 'bg-gray-500',
      };
  }
}
