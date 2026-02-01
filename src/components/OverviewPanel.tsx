import { clsx } from 'clsx';
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Plan Overview</h2>

      <div className="space-y-4 flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Database badge */}
        <div>
          <Label>Database</Label>
          <div className="mt-1">
            <DatabaseBadge database={plan.database} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {plan.totalCost !== undefined && (
            <StatCard label="Total Cost" value={plan.totalCost.toFixed(4)} />
          )}
          <StatCard label="Parse Time" value={`${plan.parseTime.toFixed(2)} ms`} />
          <StatCard label="Operators" value={stats.nodeCount.toString()} />
          <StatCard label="Tree Depth" value={stats.maxDepth.toString()} />
        </div>

        {/* Warnings summary */}
        {stats.warningCount > 0 && (
          <div>
            <Label>Warnings</Label>
            <div className="mt-1.5 flex gap-2">
              {stats.criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {stats.criticalCount} critical
                </span>
              )}
              {stats.warningCount - stats.criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  {stats.warningCount - stats.criticalCount} warning
                </span>
              )}
            </div>
          </div>
        )}

        {/* SQL Statement */}
        {plan.statementText && (
          <div className="flex-1 flex flex-col min-h-0">
            <Label>Statement</Label>
            <div className="mt-1.5 flex-1 min-h-[180px] bg-gray-900 rounded-lg overflow-hidden">
              <pre className="h-full overflow-auto p-3 text-xs text-gray-100 font-mono whitespace-pre-wrap break-all">
                <code>{highlightSQL(plan.statementText)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
    </div>
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

// Simple SQL syntax highlighting
function highlightSQL(sql: string): React.ReactNode {
  // Using a capturing group in split() includes the matched keywords in the result array
  // Even indices (0, 2, 4, ...) are non-keyword text
  // Odd indices (1, 3, 5, ...) are the captured keywords
  const keywords =
    /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|SET|VALUES|INTO|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|NULL|IS|LIKE|BETWEEN|EXISTS|UNION|ALL|TOP|WITH|OVER|PARTITION|ROW_NUMBER|RANK|DENSE_RANK)\b/gi;

  const parts = sql.split(keywords);

  return parts.map((part, i) => {
    if (!part) return null;
    const isKeyword = i % 2 === 1;
    return (
      <span
        key={i}
        className={isKeyword ? 'text-blue-400 font-medium' : 'text-gray-100'}
      >
        {part}
      </span>
    );
  });
}
