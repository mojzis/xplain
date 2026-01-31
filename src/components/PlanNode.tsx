import { clsx } from 'clsx';
import type { PlanNode as PlanNodeType } from '../types/plan';

interface PlanNodeProps {
  node: PlanNodeType;
  isSelected: boolean;
  onClick: () => void;
}

export function PlanNode({ node, isSelected, onClick }: PlanNodeProps) {
  const hasWarnings = node.warnings.length > 0;
  const hasCriticalWarning = node.warnings.some((w) => w.severity === 'critical');
  const hasWarning = node.warnings.some((w) => w.severity === 'warning');

  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-[200px] rounded-lg border-2 cursor-pointer transition-all shadow-sm hover:shadow-md',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        hasCriticalWarning
          ? 'border-red-400 bg-red-50'
          : hasWarning
          ? 'border-yellow-400 bg-yellow-50'
          : hasWarnings
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white'
      )}
    >
      <div className="p-3">
        <div className="font-medium text-sm text-gray-800 truncate" title={node.operation}>
          {node.operation}
        </div>

        {node.objectName && (
          <div className="text-xs text-gray-500 truncate mt-1" title={node.objectName}>
            {node.objectName}
          </div>
        )}

        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {node.estimatedRows !== undefined && (
            <span title={`Estimated rows: ${node.estimatedRows}`}>
              {formatNumber(node.estimatedRows)} rows
            </span>
          )}
          {node.estimatedCost !== undefined && (
            <span title={`Cost: ${node.estimatedCost}`}>
              {formatCost(node.estimatedCost)}
            </span>
          )}
        </div>

        {hasWarnings && (
          <div className="mt-2 flex flex-wrap gap-1">
            {node.warnings.slice(0, 2).map((warning, i) => (
              <span
                key={i}
                title={warning.message}
                className={clsx(
                  'text-xs px-1.5 py-0.5 rounded truncate max-w-full',
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
            {node.warnings.length > 2 && (
              <span className="text-xs text-gray-500">
                +{node.warnings.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toString();
}

function formatCost(n: number): string {
  if (n < 0.01) return '<0.01';
  if (n < 1) return n.toFixed(2);
  if (n < 100) return n.toFixed(1);
  return Math.round(n).toString();
}
