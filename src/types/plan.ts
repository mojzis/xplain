export type DatabaseType = 'sqlserver' | 'postgresql' | 'oracle';

export type WarningSeverity = 'info' | 'warning' | 'critical';

export type WarningType =
  | 'missing-index'
  | 'implicit-conversion'
  | 'spill'
  | 'scan'
  | 'other';

export interface Warning {
  type: WarningType;
  message: string;
  severity: WarningSeverity;
}

export interface PlanNode {
  id: string;
  operation: string;
  objectName?: string;
  estimatedRows?: number;
  actualRows?: number;
  estimatedCost?: number;
  actualCost?: number;
  estimatedIO?: number;
  estimatedCPU?: number;
  actualExecutions?: number;
  elapsedTime?: number;
  warnings: Warning[];
  children: PlanNode[];
  properties: Record<string, unknown>;
}

export interface ParsedPlan {
  database: DatabaseType;
  rootNode: PlanNode;
  statementText?: string;
  totalCost?: number;
  parseTime: number;
}
