import { clsx } from 'clsx';
import type { PlanNode as PlanNodeType } from '../types/plan';

interface PlanNodeProps {
  node: PlanNodeType;
  isSelected: boolean;
  onClick: () => void;
  totalCost?: number;
}

export function PlanNode({ node, isSelected, onClick, totalCost = 1 }: PlanNodeProps) {
  const hasWarnings = node.warnings.length > 0;
  const hasCriticalWarning = node.warnings.some((w) => w.severity === 'critical');
  const hasWarning = node.warnings.some((w) => w.severity === 'warning');

  // Calculate cost percentage for the progress bar and border color
  const costPercentage = totalCost > 0 ? Math.min((node.estimatedCost ?? 0) / totalCost * 100, 100) : 0;
  const costCategory = getCostCategory(costPercentage);

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative w-[220px] bg-white rounded-lg cursor-pointer transition-all duration-150',
        'shadow-sm hover:shadow-md hover:scale-[1.02]',
        'border border-gray-200 overflow-hidden',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 shadow-md',
        hasCriticalWarning && 'bg-red-50/50',
        hasWarning && !hasCriticalWarning && 'bg-yellow-50/50'
      )}
    >
      {/* Cost indicator left border */}
      <div
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          costCategory === 'high' && 'bg-red-500',
          costCategory === 'medium' && 'bg-orange-400',
          costCategory === 'low' && 'bg-blue-400',
          costCategory === 'minimal' && 'bg-gray-300'
        )}
      />

      <div className="p-4 pl-5">
        {/* Operation name */}
        <div className="font-semibold text-sm text-gray-900 truncate" title={node.operation}>
          {node.operation}
        </div>

        {/* Object name (table/index) */}
        {node.objectName && (
          <div className="text-xs text-gray-500 truncate mt-1" title={node.objectName}>
            {node.objectName}
          </div>
        )}

        {/* Metrics row */}
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          {node.estimatedRows !== undefined && (
            <span title={`Estimated rows: ${node.estimatedRows.toLocaleString()}`}>
              {formatNumber(node.estimatedRows)} rows
            </span>
          )}
          {node.estimatedCost !== undefined && (
            <span
              className={clsx(
                'font-medium',
                costCategory === 'high' && 'text-red-600',
                costCategory === 'medium' && 'text-orange-600',
                costCategory === 'low' && 'text-blue-600',
                costCategory === 'minimal' && 'text-gray-500'
              )}
              title={`Cost: ${node.estimatedCost.toFixed(6)}`}
            >
              {formatCost(node.estimatedCost)}
            </span>
          )}
        </div>

        {/* Cost progress bar */}
        {node.estimatedCost !== undefined && totalCost > 0 && (
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                costCategory === 'high' && 'bg-red-500',
                costCategory === 'medium' && 'bg-orange-400',
                costCategory === 'low' && 'bg-blue-400',
                costCategory === 'minimal' && 'bg-gray-300'
              )}
              style={{ width: `${Math.max(costPercentage, 2)}%` }}
            />
          </div>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <div className="mt-3 flex flex-wrap gap-1">
            {node.warnings.slice(0, 2).map((warning, i) => (
              <span
                key={i}
                title={warning.message}
                className={clsx(
                  'text-xs px-2 py-0.5 rounded-full truncate max-w-full font-medium',
                  warning.severity === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : warning.severity === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                )}
              >
                {warning.type}
              </span>
            ))}
            {node.warnings.length > 2 && (
              <span className="text-xs text-gray-400 font-medium">
                +{node.warnings.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getCostCategory(percentage: number): 'high' | 'medium' | 'low' | 'minimal' {
  if (percentage >= 50) return 'high';
  if (percentage >= 20) return 'medium';
  if (percentage >= 5) return 'low';
  return 'minimal';
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
