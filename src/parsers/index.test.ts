import { describe, it, expect } from 'vitest';
import { detectPlanType, parsePlan } from './index';

describe('Plan Type Detection', () => {
  it('detects SQL Server XML by declaration', () => {
    expect(detectPlanType('<?xml version="1.0"?><ShowPlanXML>')).toBe(
      'sqlserver'
    );
  });

  it('detects SQL Server XML by root element', () => {
    expect(detectPlanType('<ShowPlanXML xmlns="...">')).toBe('sqlserver');
  });

  it('detects PostgreSQL JSON array', () => {
    expect(detectPlanType('[{"Plan": {"Node Type": "Seq Scan"}}]')).toBe(
      'postgresql'
    );
  });

  it('does not detect PostgreSQL for non-plan JSON', () => {
    expect(detectPlanType('[{"other": "data"}]')).toBeNull();
  });

  it('detects Oracle by Plan hash value', () => {
    expect(detectPlanType('Plan hash value: 123')).toBe('oracle');
  });

  it('detects Oracle by table header', () => {
    expect(detectPlanType('| Id  | Operation |')).toBe('oracle');
  });

  it('returns null for unknown format', () => {
    expect(detectPlanType('random text')).toBeNull();
  });

  it('handles whitespace', () => {
    expect(detectPlanType('  <?xml version="1.0"?><ShowPlanXML>  ')).toBe(
      'sqlserver'
    );
  });
});

describe('parsePlan', () => {
  it('parses SQL Server with detection', () => {
    const xml = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT 1">
          <QueryPlan>
            <RelOp PhysicalOp="Constant Scan" LogicalOp="Constant Scan" EstimateRows="1" EstimatedTotalSubtreeCost="0.0001"/>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

    const result = parsePlan(xml);
    expect(result.database).toBe('sqlserver');
  });

  it('parses PostgreSQL with detection', () => {
    const json = JSON.stringify([
      {
        Plan: {
          'Node Type': 'Result',
          'Plan Rows': 1,
          'Total Cost': 0.01,
        },
      },
    ]);

    const result = parsePlan(json);
    expect(result.database).toBe('postgresql');
  });

  it('parses Oracle with detection', () => {
    const text = `
Plan hash value: 1
| Id  | Operation        | Name |
|   0 | SELECT STATEMENT |      |
`;

    const result = parsePlan(text);
    expect(result.database).toBe('oracle');
  });

  it('uses provided type over detection', () => {
    // This could be detected as something else but we force sqlserver
    const xml = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT 1">
          <QueryPlan>
            <RelOp PhysicalOp="Test" LogicalOp="Test" EstimateRows="1" EstimatedTotalSubtreeCost="0"/>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

    const result = parsePlan(xml, 'sqlserver');
    expect(result.database).toBe('sqlserver');
  });

  it('throws on undetectable format', () => {
    expect(() => parsePlan('random text')).toThrow('Unable to detect');
  });
});
