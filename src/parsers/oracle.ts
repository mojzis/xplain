import type { PlanNode, ParsedPlan, Warning } from '../types/plan';

interface OracleRow {
  id: number;
  operation: string;
  objectName?: string;
  rows?: number;
  bytes?: number;
  cost?: number;
  depth: number;
}

export function parseOraclePlan(text: string): ParsedPlan {
  const startTime = performance.now();

  const lines = text.split('\n');

  // Find the plan table by looking for the header row or plan hash
  const headerIndex = lines.findIndex(
    (line) =>
      line.includes('| Id') ||
      line.includes('|  Id') ||
      line.includes('Plan hash value')
  );

  if (headerIndex === -1) {
    throw new Error('Not a valid Oracle execution plan');
  }

  // Find data rows (lines starting with | and containing a number in first column)
  const dataLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) return false;
    if (trimmed.includes('---')) return false;
    // Check if it's a header row (contains "Id" as a word, not just the letters)
    if (/\|\s*Id\s*\|/.test(trimmed)) return false;
    // Must have a number after first |
    const match = trimmed.match(/^\|\s*(\d+)\s*\|/);
    return match !== null;
  });

  if (dataLines.length === 0) {
    throw new Error('No plan data found');
  }

  const rows = dataLines.map((line, index) => parseOracleLine(line, index));

  const rootNode = buildOracleTree(rows);

  return {
    database: 'oracle',
    rootNode,
    totalCost: rootNode.estimatedCost,
    parseTime: performance.now() - startTime,
  };
}

function parseOracleLine(line: string, index: number): OracleRow {
  // Split by | and filter empty parts
  const parts = line.split('|').slice(1); // Remove first empty element

  const idStr = parts[0]?.trim() ?? String(index);
  const operationRaw = parts[1] ?? 'Unknown';
  const objectNameRaw = parts[2]?.trim();
  const rowsStr = parts[3]?.trim();
  const bytesStr = parts[4]?.trim();
  const costStr = parts[5]?.trim();

  // Calculate depth from leading spaces in operation column
  // Oracle uses 1 space per level of indentation
  const leadingMatch = operationRaw.match(/^(\s*)/);
  const leadingSpaces = leadingMatch?.[1]?.length ?? 0;
  const depth = leadingSpaces;

  const operation = operationRaw.trim();

  // Parse cost (may have (%CPU) suffix)
  let cost: number | undefined;
  if (costStr) {
    const costMatch = costStr.match(/^(\d+)/);
    if (costMatch?.[1]) {
      cost = parseInt(costMatch[1], 10);
    }
  }

  return {
    id: parseInt(idStr, 10) || index,
    operation,
    objectName: objectNameRaw && objectNameRaw !== '' ? objectNameRaw : undefined,
    rows: rowsStr && rowsStr !== '' ? parseInt(rowsStr, 10) : undefined,
    bytes: bytesStr && bytesStr !== '' ? parseInt(bytesStr, 10) : undefined,
    cost,
    depth,
  };
}

function buildOracleTree(rows: OracleRow[]): PlanNode {
  if (rows.length === 0) {
    throw new Error('No plan rows to build tree from');
  }

  const first = rows[0];
  if (!first) {
    throw new Error('No plan rows');
  }

  // Convert all rows to PlanNodes first
  const nodes: PlanNode[] = rows.map((row) => ({
    id: `node-${row.id}`,
    operation: row.operation,
    objectName: row.objectName,
    estimatedRows: row.rows,
    estimatedCost: row.cost,
    warnings: extractOracleWarnings(row),
    children: [],
    properties: {
      oracleId: row.id,
      bytes: row.bytes,
      depth: row.depth,
    },
  }));

  // Build tree based on depth - each node is a child of the nearest preceding node with smaller depth
  for (let i = 1; i < rows.length; i++) {
    const currentRow = rows[i];
    const currentNode = nodes[i];

    if (!currentRow || !currentNode) continue;

    // Find parent: walk backwards to find first node with smaller depth
    for (let j = i - 1; j >= 0; j--) {
      const candidateRow = rows[j];
      const candidateNode = nodes[j];

      if (!candidateRow || !candidateNode) continue;

      if (candidateRow.depth < currentRow.depth) {
        candidateNode.children.push(currentNode);
        break;
      }
    }
  }

  const rootNode = nodes[0];
  if (!rootNode) {
    throw new Error('Failed to build tree');
  }

  return rootNode;
}

function extractOracleWarnings(row: OracleRow): Warning[] {
  const warnings: Warning[] = [];

  const op = row.operation.toUpperCase();

  if (op.includes('TABLE ACCESS FULL') || op.includes('FULL TABLE SCAN')) {
    warnings.push({
      type: 'scan',
      message: 'Full table scan - consider adding an index',
      severity: 'info',
    });
  }

  return warnings;
}
