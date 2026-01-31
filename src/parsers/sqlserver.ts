import type { PlanNode, ParsedPlan, Warning } from '../types/plan';

export function parseSqlServerPlan(xml: string): ParsedPlan {
  const startTime = performance.now();

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Invalid XML: ' + errorNode.textContent);
  }

  const showPlan = doc.querySelector('ShowPlanXML');
  if (!showPlan) {
    throw new Error('Not a valid SQL Server execution plan');
  }

  const stmtSimple = doc.querySelector('StmtSimple');
  const relOp = stmtSimple?.querySelector('RelOp');

  if (!relOp) {
    throw new Error('No execution plan found in XML');
  }

  const idCounter = { value: 0 };
  const rootNode = parseRelOp(relOp, idCounter);
  const statementText = stmtSimple?.getAttribute('StatementText') ?? undefined;

  return {
    database: 'sqlserver',
    rootNode,
    statementText,
    totalCost: rootNode.estimatedCost,
    parseTime: performance.now() - startTime,
  };
}

function parseRelOp(element: Element, idCounter: { value: number }): PlanNode {
  const id = `node-${idCounter.value++}`;
  const physicalOp = element.getAttribute('PhysicalOp') ?? 'Unknown';

  const estimatedRows = parseFloat(element.getAttribute('EstimateRows') ?? '0');
  const estimatedCost = parseFloat(
    element.getAttribute('EstimatedTotalSubtreeCost') ?? '0'
  );

  const objectName = extractObjectName(element);
  const warnings = extractWarnings(element);

  const children: PlanNode[] = [];

  // Direct child RelOps
  for (const child of element.children) {
    if (child.tagName === 'RelOp') {
      children.push(parseRelOp(child, idCounter));
    }
  }

  // RelOps nested in operation-specific elements
  const operationContainers = [
    'Hash',
    'Parallelism',
    'NestedLoops',
    'Merge',
    'Sort',
    'StreamAggregate',
    'Filter',
    'Top',
    'IndexScan',
    'TableScan',
    'ClusteredIndexScan',
    'ClusteredIndexSeek',
    'IndexSeek',
    'Spool',
    'Concatenation',
    'ComputeScalar',
  ];

  for (const containerName of operationContainers) {
    const container = element.querySelector(`:scope > ${containerName}`);
    if (container) {
      for (const child of container.children) {
        if (child.tagName === 'RelOp') {
          children.push(parseRelOp(child, idCounter));
        }
      }
    }
  }

  return {
    id,
    operation: physicalOp,
    objectName,
    estimatedRows,
    estimatedCost,
    warnings,
    children,
    properties: extractProperties(element),
  };
}

function extractObjectName(element: Element): string | undefined {
  const scanElements = [
    'IndexScan',
    'TableScan',
    'ClusteredIndexScan',
    'ClusteredIndexSeek',
    'IndexSeek',
  ];

  for (const scanType of scanElements) {
    const scan = element.querySelector(`:scope > ${scanType}`);
    if (scan) {
      const obj = scan.querySelector('Object');
      if (obj) {
        const table = obj.getAttribute('Table')?.replace(/[\[\]]/g, '');
        const index = obj.getAttribute('Index')?.replace(/[\[\]]/g, '');
        if (index && table) {
          return `${table}.${index}`;
        }
        return table ?? index;
      }
    }
  }

  return undefined;
}

function extractWarnings(element: Element): Warning[] {
  const warnings: Warning[] = [];

  const warningsElement = element.querySelector(':scope > Warnings');
  if (warningsElement) {
    if (warningsElement.querySelector('MissingIndex')) {
      warnings.push({
        type: 'missing-index',
        message: 'Missing index could improve performance',
        severity: 'warning',
      });
    }

    if (warningsElement.querySelector('PlanAffectingConvert')) {
      warnings.push({
        type: 'implicit-conversion',
        message: 'Implicit type conversion may affect performance',
        severity: 'warning',
      });
    }

    if (warningsElement.querySelector('SpillToTempDb')) {
      warnings.push({
        type: 'spill',
        message: 'Operation spilled to TempDb',
        severity: 'critical',
      });
    }
  }

  const physicalOp = element.getAttribute('PhysicalOp');
  if (physicalOp === 'Table Scan') {
    warnings.push({
      type: 'scan',
      message: 'Table scan - consider adding an index',
      severity: 'info',
    });
  }

  return warnings;
}

function extractProperties(element: Element): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const attr of element.attributes) {
    props[attr.name] = attr.value;
  }

  return props;
}
