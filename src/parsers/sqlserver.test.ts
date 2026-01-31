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
                <Object Table="[Users]"/>
              </TableScan>
            </RelOp>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

const NESTED_PLAN = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT * FROM Orders o JOIN Customers c ON o.CustomerId = c.Id">
          <QueryPlan>
            <RelOp PhysicalOp="Nested Loops" LogicalOp="Inner Join" EstimateRows="50" EstimatedTotalSubtreeCost="0.5">
              <NestedLoops>
                <RelOp PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="10" EstimatedTotalSubtreeCost="0.1">
                  <IndexSeek>
                    <Object Table="[Customers]" Index="[PK_Customers]"/>
                  </IndexSeek>
                </RelOp>
                <RelOp PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="5" EstimatedTotalSubtreeCost="0.2">
                  <IndexSeek>
                    <Object Table="[Orders]" Index="[IX_CustomerId]"/>
                  </IndexSeek>
                </RelOp>
              </NestedLoops>
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
    expect(result.rootNode.objectName).toBe('Users');
    expect(result.statementText).toBe('SELECT * FROM Users');
  });

  it('adds scan warning for table scans', () => {
    const result = parseSqlServerPlan(SIMPLE_PLAN);

    expect(result.rootNode.warnings).toHaveLength(1);
    expect(result.rootNode.warnings[0]?.type).toBe('scan');
  });

  it('parses nested operations', () => {
    const result = parseSqlServerPlan(NESTED_PLAN);

    expect(result.rootNode.operation).toBe('Nested Loops');
    expect(result.rootNode.children).toHaveLength(2);
    expect(result.rootNode.children[0]?.operation).toBe('Index Seek');
    expect(result.rootNode.children[1]?.operation).toBe('Index Seek');
  });

  it('extracts object names with index', () => {
    const result = parseSqlServerPlan(NESTED_PLAN);

    expect(result.rootNode.children[0]?.objectName).toBe(
      'Customers.PK_Customers'
    );
    expect(result.rootNode.children[1]?.objectName).toBe('Orders.IX_CustomerId');
  });

  it('throws on invalid XML', () => {
    expect(() => parseSqlServerPlan('not xml')).toThrow('Invalid XML');
  });

  it('throws on non-plan XML', () => {
    expect(() => parseSqlServerPlan('<?xml version="1.0"?><root/>')).toThrow(
      'Not a valid SQL Server'
    );
  });

  it('records parse time', () => {
    const result = parseSqlServerPlan(SIMPLE_PLAN);
    expect(result.parseTime).toBeGreaterThan(0);
  });
});
