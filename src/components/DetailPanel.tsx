import { clsx } from 'clsx';
import type { PlanNode } from '../types/plan';

interface DetailPanelProps {
  node: PlanNode | null;
  onClose: () => void;
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800 pr-2">{node.operation}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 -mr-1 -mt-1"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4 flex flex-col flex-1 min-h-0 overflow-hidden">
        {node.objectName && <DetailRow label="Object" value={node.objectName} />}

        {node.estimatedRows !== undefined && (
          <DetailRow
            label="Estimated Rows"
            value={node.estimatedRows.toLocaleString()}
          />
        )}

        {node.actualRows !== undefined && (
          <DetailRow label="Actual Rows" value={node.actualRows.toLocaleString()} />
        )}

        {node.estimatedCost !== undefined && (
          <DetailRow label="Estimated Cost" value={node.estimatedCost.toFixed(6)} />
        )}

        {node.actualCost !== undefined && (
          <DetailRow label="Actual Cost" value={node.actualCost.toFixed(6)} />
        )}

        {node.elapsedTime !== undefined && (
          <DetailRow label="Elapsed Time" value={`${node.elapsedTime.toFixed(3)} ms`} />
        )}

        {node.actualExecutions !== undefined && (
          <DetailRow label="Executions" value={node.actualExecutions.toLocaleString()} />
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

        <div className="flex-1 flex flex-col min-h-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex-shrink-0">
            Properties
          </div>
          <div className="bg-gray-50 rounded p-2 flex-1 overflow-y-auto min-h-[200px]">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
              {formatProperties(node.properties)}
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
      <div className="text-sm text-gray-800 mt-1 break-all">{value}</div>
    </div>
  );
}

function formatProperties(props: Record<string, unknown>): string {
  // Filter out undefined values and format nicely
  const filtered = Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== undefined)
  );
  return JSON.stringify(filtered, null, 2);
}
