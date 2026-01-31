import { describe, it, expect } from 'vitest';
import { parsePostgreSQLPlan } from './postgresql';

const SIMPLE_PLAN = JSON.stringify([
  {
    Plan: {
      'Node Type': 'Seq Scan',
      'Relation Name': 'users',
      'Plan Rows': 100,
      'Total Cost': 10.5,
    },
  },
]);

const NESTED_PLAN = JSON.stringify([
  {
    Plan: {
      'Node Type': 'Hash Join',
      'Join Type': 'Inner',
      'Plan Rows': 100,
      'Total Cost': 50.5,
      Plans: [
        {
          'Node Type': 'Seq Scan',
          'Relation Name': 'customers',
          'Plan Rows': 10,
          'Total Cost': 10.5,
        },
        {
          'Node Type': 'Hash',
          'Plan Rows': 100,
          'Total Cost': 30.0,
          Plans: [
            {
              'Node Type': 'Index Scan',
              'Relation Name': 'orders',
              'Index Name': 'orders_customer_idx',
              'Plan Rows': 100,
              'Total Cost': 25.0,
            },
          ],
        },
      ],
    },
  },
]);

const ANALYZE_PLAN = JSON.stringify([
  {
    Plan: {
      'Node Type': 'Seq Scan',
      'Relation Name': 'users',
      'Plan Rows': 10,
      'Actual Rows': 1000,
      'Total Cost': 10.5,
      'Actual Total Time': 5.5,
      'Actual Loops': 1,
    },
  },
]);

describe('PostgreSQL Parser', () => {
  it('parses a simple plan', () => {
    const result = parsePostgreSQLPlan(SIMPLE_PLAN);

    expect(result.database).toBe('postgresql');
    expect(result.rootNode.operation).toBe('Seq Scan');
    expect(result.rootNode.objectName).toBe('users');
    expect(result.rootNode.estimatedRows).toBe(100);
  });

  it('adds scan warning for sequential scans', () => {
    const result = parsePostgreSQLPlan(SIMPLE_PLAN);

    expect(result.rootNode.warnings).toHaveLength(1);
    expect(result.rootNode.warnings[0]?.type).toBe('scan');
  });

  it('parses nested plans', () => {
    const result = parsePostgreSQLPlan(NESTED_PLAN);

    expect(result.rootNode.operation).toBe('Hash Join');
    expect(result.rootNode.children).toHaveLength(2);
    expect(result.rootNode.children[0]?.operation).toBe('Seq Scan');
    expect(result.rootNode.children[1]?.operation).toBe('Hash');
    expect(result.rootNode.children[1]?.children[0]?.operation).toBe(
      'Index Scan'
    );
  });

  it('parses ANALYZE output with actual values', () => {
    const result = parsePostgreSQLPlan(ANALYZE_PLAN);

    expect(result.rootNode.actualRows).toBe(1000);
    expect(result.rootNode.elapsedTime).toBe(5.5);
    expect(result.rootNode.actualExecutions).toBe(1);
  });

  it('warns on row estimate mismatch', () => {
    const result = parsePostgreSQLPlan(ANALYZE_PLAN);

    const mismatchWarning = result.rootNode.warnings.find(
      (w) => w.type === 'other'
    );
    expect(mismatchWarning).toBeDefined();
    expect(mismatchWarning?.message).toContain('Row estimate mismatch');
  });

  it('throws on invalid JSON', () => {
    expect(() => parsePostgreSQLPlan('not json')).toThrow('Invalid JSON');
  });

  it('throws on non-array JSON', () => {
    expect(() => parsePostgreSQLPlan('{}')).toThrow('Not a valid PostgreSQL');
  });

  it('throws on empty array', () => {
    expect(() => parsePostgreSQLPlan('[]')).toThrow('Not a valid PostgreSQL');
  });

  it('records parse time', () => {
    const result = parsePostgreSQLPlan(SIMPLE_PLAN);
    expect(result.parseTime).toBeGreaterThan(0);
  });
});
