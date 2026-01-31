import type { PlanNode, ParsedPlan, Warning } from '../types/plan';

interface PgPlanNode {
  'Node Type': string;
  'Relation Name'?: string;
  'Index Name'?: string;
  'Alias'?: string;
  'Plan Rows'?: number;
  'Actual Rows'?: number;
  'Plan Width'?: number;
  'Startup Cost'?: number;
  'Total Cost'?: number;
  'Actual Startup Time'?: number;
  'Actual Total Time'?: number;
  'Actual Loops'?: number;
  'Shared Hit Blocks'?: number;
  'Shared Read Blocks'?: number;
  'Plans'?: PgPlanNode[];
  [key: string]: unknown;
}

interface PgExplainResult {
  Plan: PgPlanNode;
  'Planning Time'?: number;
  'Execution Time'?: number;
}

export function parsePostgreSQLPlan(json: string): ParsedPlan {
  const startTime = performance.now();

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Not a valid PostgreSQL execution plan');
  }

  const explain = parsed[0] as PgExplainResult;
  if (!explain || !explain.Plan) {
    throw new Error('No Plan found in PostgreSQL explain output');
  }

  const idCounter = { value: 0 };
  const rootNode = parsePgNode(explain.Plan, idCounter);

  return {
    database: 'postgresql',
    rootNode,
    totalCost: explain.Plan['Total Cost'],
    parseTime: performance.now() - startTime,
  };
}

function parsePgNode(node: PgPlanNode, idCounter: { value: number }): PlanNode {
  const id = `node-${idCounter.value++}`;

  const objectName = node['Relation Name'] ?? node['Index Name'];
  const warnings = extractPgWarnings(node);

  const children: PlanNode[] = [];
  if (node.Plans) {
    for (const child of node.Plans) {
      children.push(parsePgNode(child, idCounter));
    }
  }

  return {
    id,
    operation: node['Node Type'],
    objectName,
    estimatedRows: node['Plan Rows'],
    actualRows: node['Actual Rows'],
    estimatedCost: node['Total Cost'],
    elapsedTime: node['Actual Total Time'],
    actualExecutions: node['Actual Loops'],
    warnings,
    children,
    properties: { ...node },
  };
}

function extractPgWarnings(node: PgPlanNode): Warning[] {
  const warnings: Warning[] = [];

  const nodeType = node['Node Type'];

  if (nodeType === 'Seq Scan') {
    warnings.push({
      type: 'scan',
      message: 'Sequential scan - consider adding an index',
      severity: 'info',
    });
  }

  // Check for large row estimate mismatches
  const planRows = node['Plan Rows'];
  const actualRows = node['Actual Rows'];
  if (
    planRows !== undefined &&
    actualRows !== undefined &&
    planRows > 0 &&
    actualRows > 0
  ) {
    const ratio = actualRows / planRows;
    if (ratio > 10 || ratio < 0.1) {
      warnings.push({
        type: 'other',
        message: `Row estimate mismatch: estimated ${planRows}, actual ${actualRows}`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}
