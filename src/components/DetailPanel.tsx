import { useState } from 'react';
import { clsx } from 'clsx';
import type { PlanNode } from '../types/plan';

interface DetailPanelProps {
  node: PlanNode | null;
  onClose: () => void;
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(node.properties, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(node.properties, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const groupedProps = groupProperties(node.properties);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{node.operation}</h2>
          {node.objectName && (
            <p className="text-sm text-gray-500 mt-0.5">{node.objectName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 -mr-1 -mt-1 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Metrics section */}
        <Section title="Metrics">
          <div className="grid grid-cols-2 gap-2">
            {node.estimatedRows !== undefined && (
              <MetricCard
                label="Est. Rows"
                value={node.estimatedRows.toLocaleString()}
              />
            )}
            {node.actualRows !== undefined && (
              <MetricCard
                label="Actual Rows"
                value={node.actualRows.toLocaleString()}
                highlight
              />
            )}
            {node.estimatedCost !== undefined && (
              <MetricCard
                label="Est. Cost"
                value={node.estimatedCost.toFixed(6)}
              />
            )}
            {node.actualCost !== undefined && (
              <MetricCard
                label="Actual Cost"
                value={node.actualCost.toFixed(6)}
                highlight
              />
            )}
            {node.elapsedTime !== undefined && (
              <MetricCard
                label="Elapsed Time"
                value={`${node.elapsedTime.toFixed(3)} ms`}
                highlight
              />
            )}
            {node.actualExecutions !== undefined && (
              <MetricCard
                label="Executions"
                value={node.actualExecutions.toLocaleString()}
              />
            )}
          </div>
        </Section>

        {/* Warnings section */}
        {node.warnings.length > 0 && (
          <Section title="Warnings">
            <div className="space-y-2">
              {node.warnings.map((warning, i) => (
                <div
                  key={i}
                  className={clsx(
                    'p-3 rounded-lg text-sm border-l-4',
                    warning.severity === 'critical'
                      ? 'bg-red-50 border-red-500 text-red-800'
                      : warning.severity === 'warning'
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                      : 'bg-blue-50 border-blue-500 text-blue-800'
                  )}
                >
                  <div className="font-medium">{warning.type}</div>
                  <div className="text-xs mt-1 opacity-80">{warning.message}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Grouped Properties */}
        {groupedProps.cost.length > 0 && (
          <Section title="Cost Properties">
            <PropertyTable properties={groupedProps.cost} />
          </Section>
        )}

        {groupedProps.io.length > 0 && (
          <Section title="I/O Properties">
            <PropertyTable properties={groupedProps.io} />
          </Section>
        )}

        {groupedProps.other.length > 0 && (
          <Section title="Other Properties">
            <PropertyTable properties={groupedProps.other} />
          </Section>
        )}

        {/* Raw JSON */}
        <Section
          title="Raw Properties"
          action={
            <button
              onClick={handleCopyJSON}
              className={clsx(
                'text-xs px-2 py-1 rounded transition-colors',
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          }
        >
          <div className="bg-gray-900 rounded-lg p-3 overflow-auto max-h-[200px]">
            <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap">
              {JSON.stringify(node.properties, null, 2)}
            </pre>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={clsx('rounded-lg p-2.5', highlight ? 'bg-blue-50' : 'bg-gray-50')}>
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={clsx(
          'text-sm font-semibold mt-0.5',
          highlight ? 'text-blue-700' : 'text-gray-900'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function PropertyTable({ properties }: { properties: [string, string][] }) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          {properties.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-3 py-2 text-gray-500 font-medium whitespace-nowrap">
                {formatPropertyKey(key)}
              </td>
              <td className="px-3 py-2 text-gray-900 break-all">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface GroupedProperties {
  cost: [string, string][];
  io: [string, string][];
  other: [string, string][];
}

function groupProperties(props: Record<string, unknown>): GroupedProperties {
  const costKeys = [
    'EstimatedTotalSubtreeCost',
    'EstimatedOperatorCost',
    'EstimatedCPUCost',
    'EstimatedIOCost',
    'EstimateRows',
    'EstimateRebinds',
    'EstimateRewinds',
    'AvgRowSize',
    'EstimatedRowsRead',
  ];

  const ioKeys = [
    'LogicalOp',
    'PhysicalOp',
    'Parallel',
    'EstimatedExecutionMode',
    'Storage',
    'TableCardinality',
  ];

  const result: GroupedProperties = {
    cost: [],
    io: [],
    other: [],
  };

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (costKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      result.cost.push([key, stringValue]);
    } else if (ioKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      result.io.push([key, stringValue]);
    } else {
      result.other.push([key, stringValue]);
    }
  }

  return result;
}

function formatPropertyKey(key: string): string {
  // Convert camelCase/PascalCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
