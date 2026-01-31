import type { ParsedPlan, DatabaseType } from '../types/plan';
import { parseSqlServerPlan } from './sqlserver';
import { parsePostgreSQLPlan } from './postgresql';
import { parseOraclePlan } from './oracle';

export function detectPlanType(input: string): DatabaseType | null {
  const trimmed = input.trim();

  // SQL Server: XML with ShowPlanXML or standard XML declaration
  if (
    trimmed.startsWith('<?xml') ||
    trimmed.startsWith('<ShowPlanXML') ||
    trimmed.includes('<ShowPlanXML')
  ) {
    return 'sqlserver';
  }

  // PostgreSQL: JSON array with Plan property
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === 'object' &&
        parsed[0] !== null &&
        'Plan' in parsed[0]
      ) {
        return 'postgresql';
      }
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Oracle: Text with plan table markers
  if (
    trimmed.includes('Plan hash value') ||
    trimmed.includes('| Id  |') ||
    trimmed.includes('|  Id  |')
  ) {
    return 'oracle';
  }

  return null;
}

export function parsePlan(input: string, type?: DatabaseType): ParsedPlan {
  const detectedType = type ?? detectPlanType(input);

  if (!detectedType) {
    throw new Error(
      'Unable to detect plan format. Please select a database type.'
    );
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
