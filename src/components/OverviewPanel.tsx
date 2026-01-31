import type { ParsedPlan, PlanNode } from '../types/plan';

interface OverviewPanelProps {
  plan: ParsedPlan;
}

interface PlanStats {
  nodeCount: number;
  warningCount: number;
  criticalCount: number;
  maxDepth: number;
}

export function OverviewPanel({ plan }: OverviewPanelProps) {
  const stats = calculateStats(plan.rootNode);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">Plan Overview</h2>

      <div className="space-y-4 flex flex-col flex-1 min-h-0">
        <StatRow label="Database" value={formatDatabase(plan.database)} />

        {plan.totalCost !== undefined && (
          <StatRow label="Total Cost" value={plan.totalCost.toFixed(4)} />
        )}

        <StatRow label="Parse Time" value={`${plan.parseTime.toFixed(2)} ms`} />

        <StatRow label="Operators" value={stats.nodeCount.toString()} />

        <StatRow label="Tree Depth" value={stats.maxDepth.toString()} />

        {stats.warningCount > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Warnings
            </div>
            <div className="mt-1 flex gap-2">
              {stats.criticalCount > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  {stats.criticalCount} critical
                </span>
              )}
              {stats.warningCount - stats.criticalCount > 0 && (
                <span className="text-sm text-yellow-600 font-medium">
                  {stats.warningCount - stats.criticalCount} warning
                </span>
              )}
            </div>
          </div>
        )}

        {plan.statementText && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Statement
            </div>
            <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded flex-1 overflow-y-auto whitespace-pre-wrap break-all min-h-[200px]">
              {plan.statementText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-gray-800 mt-1">{value}</div>
    </div>
  );
}

function calculateStats(root: PlanNode): PlanStats {
  let nodeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  let maxDepth = 0;

  function traverse(node: PlanNode, depth: number): void {
    nodeCount++;
    warningCount += node.warnings.length;
    criticalCount += node.warnings.filter((w) => w.severity === 'critical').length;
    maxDepth = Math.max(maxDepth, depth);

    for (const child of node.children) {
      traverse(child, depth + 1);
    }
  }

  traverse(root, 1);

  return { nodeCount, warningCount, criticalCount, maxDepth };
}

function formatDatabase(db: string): string {
  switch (db) {
    case 'sqlserver':
      return 'SQL Server';
    case 'postgresql':
      return 'PostgreSQL';
    case 'oracle':
      return 'Oracle';
    default:
      return db;
  }
}
