import { describe, it, expect } from 'vitest';
import { parseOraclePlan } from './oracle';

const SIMPLE_PLAN = `
Plan hash value: 12345

--------------------------------------------------------------------
| Id  | Operation         | Name  | Rows  | Bytes | Cost (%CPU)|
--------------------------------------------------------------------
|   0 | SELECT STATEMENT  |       |   100 |       |   10   (0)|
|   1 |  TABLE ACCESS FULL| USERS |   100 |  5000 |   10   (0)|
--------------------------------------------------------------------
`;

const NESTED_PLAN = `
Plan hash value: 67890

---------------------------------------------------------------------------------
| Id  | Operation                     | Name       | Rows  | Bytes | Cost (%CPU)|
---------------------------------------------------------------------------------
|   0 | SELECT STATEMENT              |            |    50 |       |   25   (0)|
|   1 |  NESTED LOOPS                 |            |    50 |  2500 |   25   (0)|
|   2 |   TABLE ACCESS BY INDEX ROWID | CUSTOMERS  |    10 |   500 |    5   (0)|
|   3 |    INDEX UNIQUE SCAN          | PK_CUST    |    10 |       |    2   (0)|
|   4 |   INDEX RANGE SCAN            | IX_ORD_CUST|     5 |   250 |   20   (0)|
---------------------------------------------------------------------------------
`;

describe('Oracle Parser', () => {
  it('parses a simple plan', () => {
    const result = parseOraclePlan(SIMPLE_PLAN);

    expect(result.database).toBe('oracle');
    expect(result.rootNode.operation).toBe('SELECT STATEMENT');
    expect(result.rootNode.estimatedRows).toBe(100);
  });

  it('adds scan warning for full table scans', () => {
    const result = parseOraclePlan(SIMPLE_PLAN);

    // The child node (TABLE ACCESS FULL) should have the warning
    const fullScanNode = result.rootNode.children[0];
    expect(fullScanNode?.warnings.some((w) => w.type === 'scan')).toBe(true);
  });

  it('extracts object names', () => {
    const result = parseOraclePlan(SIMPLE_PLAN);

    const tableNode = result.rootNode.children[0];
    expect(tableNode?.objectName).toBe('USERS');
  });

  it('parses nested operations', () => {
    const result = parseOraclePlan(NESTED_PLAN);

    expect(result.rootNode.operation).toBe('SELECT STATEMENT');
    expect(result.rootNode.children).toHaveLength(1);

    const nestedLoops = result.rootNode.children[0];
    expect(nestedLoops?.operation).toBe('NESTED LOOPS');
  });

  it('throws on invalid plan', () => {
    expect(() => parseOraclePlan('random text without plan')).toThrow(
      'Not a valid Oracle'
    );
  });

  it('records parse time', () => {
    const result = parseOraclePlan(SIMPLE_PLAN);
    expect(result.parseTime).toBeGreaterThan(0);
  });
});
