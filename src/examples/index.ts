export const SQLSERVER_SAMPLE = `<?xml version="1.0"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementText="SELECT o.OrderId, c.CustomerName FROM Orders o JOIN Customers c ON o.CustomerId = c.CustomerId WHERE o.OrderDate > '2024-01-01'">
          <QueryPlan>
            <RelOp PhysicalOp="Nested Loops" LogicalOp="Inner Join" EstimateRows="150" EstimatedTotalSubtreeCost="0.25">
              <NestedLoops>
                <RelOp PhysicalOp="Index Seek" LogicalOp="Index Seek" EstimateRows="50" EstimatedTotalSubtreeCost="0.05">
                  <IndexSeek>
                    <Object Table="[Orders]" Index="[IX_OrderDate]"/>
                  </IndexSeek>
                </RelOp>
                <RelOp PhysicalOp="Clustered Index Seek" LogicalOp="Clustered Index Seek" EstimateRows="1" EstimatedTotalSubtreeCost="0.003">
                  <IndexSeek>
                    <Object Table="[Customers]" Index="[PK_Customers]"/>
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

export const POSTGRESQL_SAMPLE = JSON.stringify(
  [
    {
      Plan: {
        'Node Type': 'Hash Join',
        'Join Type': 'Inner',
        'Hash Cond': '(orders.customer_id = customers.id)',
        'Plan Rows': 150,
        'Plan Width': 120,
        'Total Cost': 85.5,
        'Actual Rows': 142,
        'Actual Total Time': 12.5,
        Plans: [
          {
            'Node Type': 'Seq Scan',
            'Relation Name': 'orders',
            'Alias': 'orders',
            'Filter': "(order_date > '2024-01-01'::date)",
            'Plan Rows': 50,
            'Plan Width': 40,
            'Total Cost': 25.0,
            'Actual Rows': 48,
            'Actual Total Time': 3.2,
          },
          {
            'Node Type': 'Hash',
            'Plan Rows': 100,
            'Plan Width': 80,
            'Total Cost': 45.0,
            Plans: [
              {
                'Node Type': 'Index Scan',
                'Relation Name': 'customers',
                'Index Name': 'customers_pkey',
                'Plan Rows': 100,
                'Plan Width': 80,
                'Total Cost': 40.0,
                'Actual Rows': 100,
                'Actual Total Time': 2.1,
              },
            ],
          },
        ],
      },
      'Planning Time': 0.5,
      'Execution Time': 15.2,
    },
  ],
  null,
  2
);

export const ORACLE_SAMPLE = `
Plan hash value: 3456789012

-------------------------------------------------------------------------------------------------
| Id  | Operation                     | Name           | Rows  | Bytes | Cost (%CPU)| Time     |
-------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT              |                |   150 |  9000 |    25   (0)| 00:00:01 |
|   1 |  NESTED LOOPS                 |                |   150 |  9000 |    25   (0)| 00:00:01 |
|   2 |   TABLE ACCESS BY INDEX ROWID | ORDERS         |    50 |  2000 |    10   (0)| 00:00:01 |
|   3 |    INDEX RANGE SCAN           | IX_ORDER_DATE  |    50 |       |     3   (0)| 00:00:01 |
|   4 |   TABLE ACCESS BY INDEX ROWID | CUSTOMERS      |     3 |   120 |     1   (0)| 00:00:01 |
|   5 |    INDEX UNIQUE SCAN          | PK_CUSTOMERS   |     1 |       |     0   (0)| 00:00:01 |
-------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------
   3 - access("ORDER_DATE">TO_DATE('2024-01-01','YYYY-MM-DD'))
   5 - access("O"."CUSTOMER_ID"="C"."CUSTOMER_ID")
`;
