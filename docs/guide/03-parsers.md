# Steps 3-6: Database Parsers

## Overview
Implement parsers for each supported database format. All parsers convert native plan formats to the unified `PlanNode` interface.

---

## Step 3: SQL Server XML Parser

### Goal
Parse SQL Server execution plan XML (from `SET STATISTICS XML ON` or .sqlplan files).

### 3.1 Create Parser

Create `src/parsers/sqlserver.ts`:

```typescript
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

  const rootNode = parseRelOp(relOp);
  const statementText = stmtSimple?.getAttribute('StatementText') ?? undefined;

  return {
    database: 'sqlserver',
    rootNode,
    statementText,
    totalCost: rootNode.estimatedCost,
    parseTime: performance.now() - startTime,
  };
}

function parseRelOp(element: Element, idCounter = { value: 0 }): PlanNode {
  const id = `node-${idCounter.value++}`;
  const physicalOp = element.getAttribute('PhysicalOp') ?? 'Unknown';
  const logicalOp = element.getAttribute('LogicalOp') ?? physicalOp;

  const estimatedRows = parseFloat(element.getAttribute('EstimateRows') ?? '0');
  const estimatedCost = parseFloat(element.getAttribute('EstimatedTotalSubtreeCost') ?? '0');

  // Extract object name from various child elements
  const objectName = extractObjectName(element);

  // Extract warnings
  const warnings = extractWarnings(element);

  // Parse children
  const children: PlanNode[] = [];
  const childRelOps = element.querySelectorAll(':scope > RelOp');
  for (const child of childRelOps) {
    children.push(parseRelOp(child, idCounter));
  }

  // Also check nested elements that might contain RelOp
  const nestedContainers = ['Hash', 'Parallelism', 'NestedLoops', 'Merge', 'Sort'];
  for (const container of nestedContainers) {
    const nested = element.querySelector(`:scope > ${container}`);
    if (nested) {
      const nestedRelOps = nested.querySelectorAll(':scope > RelOp');
      for (const child of nestedRelOps) {
        children.push(parseRelOp(child, idCounter));
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
  const indexScan = element.querySelector('IndexScan, TableScan, ClusteredIndexScan');
  if (indexScan) {
    const obj = indexScan.querySelector('Object');
    if (obj) {
      const table = obj.getAttribute('Table')?.replace(/[\[\]]/g, '');
      const index = obj.getAttribute('Index')?.replace(/[\[\]]/g, '');
      return index ? `${table}.${index}` : table;
    }
  }
  return undefined;
}

function extractWarnings(element: Element): Warning[] {
  const warnings: Warning[] = [];

  const warningsElement = element.querySelector('Warnings');
  if (warningsElement) {
    // Missing indexes
    const missingIndex = warningsElement.querySelector('MissingIndex');
    if (missingIndex) {
      warnings.push({
        type: 'missing-index',
        message: 'Missing index could improve performance',
        severity: 'warning',
      });
    }

    // Implicit conversions
    const planAffecting = warningsElement.querySelector('PlanAffectingConvert');
    if (planAffecting) {
      warnings.push({
        type: 'implicit-conversion',
        message: 'Implicit type conversion may affect performance',
        severity: 'warning',
      });
    }

    // Spills
    const spill = warningsElement.querySelector('SpillToTempDb');
    if (spill) {
      warnings.push({
        type: 'spill',
        message: 'Operation spilled to TempDb',
        severity: 'critical',
      });
    }
  }

  // Check for table scans (potential warning)
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

  // Extract all attributes
  for (const attr of element.attributes) {
    props[attr.name] = attr.value;
  }

  return props;
}
```

### 3.2 Create Tests

Create `src/parsers/sqlserver.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseSqlServerPlan } from './sqlserver';

const SIMPLE_PLAN = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT * FROM Users">
          <QueryPlan>
            <RelOp PhysicalOp="Table Scan" LogicalOp="Table Scan" EstimateRows="100" EstimatedTotalSubtreeCost="0.1">
              <TableScan>
                <Object Table="Users"/>
              </TableScan>
            </RelOp>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

describe('SQL Server Parser', () => {
  it('parses a simple plan', () => {
    const result = parseSqlServerPlan(SIMPLE_PLAN);

    expect(result.database).toBe('sqlserver');
    expect(result.rootNode.operation).toBe('Table Scan');
    expect(result.rootNode.estimatedRows).toBe(100);
  });

  it('throws on invalid XML', () => {
    expect(() => parseSqlServerPlan('not xml')).toThrow('Invalid XML');
  });

  it('throws on non-plan XML', () => {
    expect(() => parseSqlServerPlan('<?xml version="1.0"?><root/>')).toThrow('Not a valid SQL Server');
  });
});
```

---

## Step 4: PostgreSQL JSON Parser

### Goal
Parse PostgreSQL JSON execution plans from `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`.

### 4.1 Create Parser

Create `src/parsers/postgresql.ts`:

```typescript
import type { PlanNode, ParsedPlan, Warning } from '../types/plan';

interface PgPlanNode {
  'Node Type': string;
  'Relation Name'?: string;
  'Index Name'?: string;
  'Plan Rows'?: number;
  'Actual Rows'?: number;
  'Total Cost'?: number;
  'Actual Total Time'?: number;
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

  // PostgreSQL EXPLAIN JSON is always an array
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Not a valid PostgreSQL execution plan');
  }

  const explain = parsed[0] as PgExplainResult;
  if (!explain.Plan) {
    throw new Error('No Plan found in PostgreSQL explain output');
  }

  const rootNode = parsePgNode(explain.Plan);

  return {
    database: 'postgresql',
    rootNode,
    totalCost: explain.Plan['Total Cost'],
    parseTime: performance.now() - startTime,
  };
}

function parsePgNode(node: PgPlanNode, idCounter = { value: 0 }): PlanNode {
  const id = `node-${idCounter.value++}`;

  const objectName = node['Relation Name'] || node['Index Name'];
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
    warnings,
    children,
    properties: { ...node },
  };
}

function extractPgWarnings(node: PgPlanNode): Warning[] {
  const warnings: Warning[] = [];

  if (node['Node Type'] === 'Seq Scan') {
    warnings.push({
      type: 'scan',
      message: 'Sequential scan - consider adding an index',
      severity: 'info',
    });
  }

  return warnings;
}
```

### 4.2 Create Tests

Create `src/parsers/postgresql.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parsePostgreSQLPlan } from './postgresql';

const SIMPLE_PLAN = JSON.stringify([{
  Plan: {
    'Node Type': 'Seq Scan',
    'Relation Name': 'users',
    'Plan Rows': 100,
    'Total Cost': 10.5
  }
}]);

describe('PostgreSQL Parser', () => {
  it('parses a simple plan', () => {
    const result = parsePostgreSQLPlan(SIMPLE_PLAN);

    expect(result.database).toBe('postgresql');
    expect(result.rootNode.operation).toBe('Seq Scan');
    expect(result.rootNode.objectName).toBe('users');
  });

  it('throws on invalid JSON', () => {
    expect(() => parsePostgreSQLPlan('not json')).toThrow('Invalid JSON');
  });
});
```

---

## Step 5: Oracle Text Parser

### Goal
Parse Oracle text execution plans from `DBMS_XPLAN.DISPLAY_CURSOR`.

### 5.1 Create Parser

Create `src/parsers/oracle.ts`:

```typescript
import type { PlanNode, ParsedPlan } from '../types/plan';

export function parseOraclePlan(text: string): ParsedPlan {
  const startTime = performance.now();

  const lines = text.split('\n').filter(line => line.trim());

  // Find the plan table
  const planStartIndex = lines.findIndex(line =>
    line.includes('Plan hash value') || line.includes('| Id  |')
  );

  if (planStartIndex === -1) {
    throw new Error('Not a valid Oracle execution plan');
  }

  // Parse the tabular data
  const dataLines = lines.slice(planStartIndex).filter(line =>
    line.startsWith('|') && !line.includes('---')
  );

  if (dataLines.length < 2) {
    throw new Error('No plan data found');
  }

  // Skip header row
  const rows = dataLines.slice(1);
  const nodes = rows.map((line, index) => parseOracleLine(line, index));

  // Build tree from flat list (based on indentation in Operation column)
  const rootNode = buildOracleTree(nodes);

  return {
    database: 'oracle',
    rootNode,
    parseTime: performance.now() - startTime,
  };
}

interface OracleRow {
  id: number;
  operation: string;
  objectName?: string;
  cost?: number;
  rows?: number;
  depth: number;
}

function parseOracleLine(line: string, index: number): OracleRow {
  const parts = line.split('|').map(p => p.trim()).filter(Boolean);

  const idStr = parts[0] ?? '';
  const operation = parts[1] ?? 'Unknown';
  const objectName = parts[2] || undefined;
  const rows = parts[3] ? parseInt(parts[3], 10) : undefined;
  const cost = parts[5] ? parseInt(parts[5], 10) : undefined;

  // Calculate depth from leading spaces in operation
  const opMatch = parts[1]?.match(/^(\s*)/);
  const depth = opMatch ? Math.floor((opMatch[1]?.length ?? 0) / 2) : 0;

  return {
    id: parseInt(idStr, 10) || index,
    operation: operation.trim(),
    objectName,
    cost,
    rows,
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

  return {
    id: `node-${first.id}`,
    operation: first.operation,
    objectName: first.objectName,
    estimatedRows: first.rows,
    estimatedCost: first.cost,
    warnings: [],
    children: [],
    properties: {},
  };
}
```

### 5.2 Create Tests

Create `src/parsers/oracle.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseOraclePlan } from './oracle';

const SIMPLE_PLAN = `
Plan hash value: 12345

| Id  | Operation         | Name  | Rows | Bytes | Cost |
|   0 | SELECT STATEMENT  |       |  100 |       |   10 |
|   1 |  TABLE ACCESS FULL| USERS |  100 |       |   10 |
`;

describe('Oracle Parser', () => {
  it('parses a simple plan', () => {
    const result = parseOraclePlan(SIMPLE_PLAN);

    expect(result.database).toBe('oracle');
    expect(result.rootNode.operation).toBe('SELECT STATEMENT');
  });

  it('throws on invalid plan', () => {
    expect(() => parseOraclePlan('not a plan')).toThrow();
  });
});
```

---

## Step 6: Parser Index & Auto-Detection

### Goal
Create a unified parser interface that auto-detects the plan format.

### 6.1 Create Parser Index

Create `src/parsers/index.ts`:

```typescript
import type { ParsedPlan, DatabaseType } from '../types/plan';
import { parseSqlServerPlan } from './sqlserver';
import { parsePostgreSQLPlan } from './postgresql';
import { parseOraclePlan } from './oracle';

export function detectPlanType(input: string): DatabaseType | null {
  const trimmed = input.trim();

  // SQL Server: XML with ShowPlanXML
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<ShowPlanXML')) {
    return 'sqlserver';
  }

  // PostgreSQL: JSON array
  if (trimmed.startsWith('[') && trimmed.includes('"Plan"')) {
    return 'postgresql';
  }

  // Oracle: Text with plan table markers
  if (trimmed.includes('Plan hash value') || trimmed.includes('| Id  |')) {
    return 'oracle';
  }

  return null;
}

export function parsePlan(input: string, type?: DatabaseType): ParsedPlan {
  const detectedType = type ?? detectPlanType(input);

  if (!detectedType) {
    throw new Error('Unable to detect plan format. Please select a database type.');
  }

  switch (detectedType) {
    case 'sqlserver':
      return parseSqlServerPlan(input);
    case 'postgresql':
      return parsePostgreSQLPlan(input);
    case 'oracle':
      return parseOraclePlan(input);
  }
}

export { parseSqlServerPlan } from './sqlserver';
export { parsePostgreSQLPlan } from './postgresql';
export { parseOraclePlan } from './oracle';
```

### 6.2 Create Tests

Create `src/parsers/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { detectPlanType, parsePlan } from './index';

describe('Plan Detection', () => {
  it('detects SQL Server XML', () => {
    expect(detectPlanType('<?xml version="1.0"?><ShowPlanXML>')).toBe('sqlserver');
  });

  it('detects PostgreSQL JSON', () => {
    expect(detectPlanType('[{"Plan": {}}]')).toBe('postgresql');
  });

  it('detects Oracle text', () => {
    expect(detectPlanType('Plan hash value: 123')).toBe('oracle');
  });

  it('returns null for unknown', () => {
    expect(detectPlanType('random text')).toBeNull();
  });
});
```

## Verification

```bash
bun test            # All parser tests pass
bun run typecheck   # TypeScript passes
```

## Checklist
- [ ] SQL Server parser implemented and tested
- [ ] PostgreSQL parser implemented and tested
- [ ] Oracle parser implemented and tested
- [ ] Auto-detection works
- [ ] All tests pass
