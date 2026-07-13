import { SourceType, AlertSeverity, AlertStatus } from './enums';

export interface ConnectorHealth {
  sourceType: SourceType;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  lastCheckedAt: string;
  successRate: number;
  failureRate: number;
  averageLatency: number;
  retryCount: number;
}

export interface Alert {
  alertId: string;
  severity: AlertSeverity;
  source: SourceType;
  title: string;
  description: string;
  caseImpact?: string;
  timestamp: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ReconciliationRecord {
  recordId: string;
  caseId: string;
  sourceType: SourceType;
  expectedCount: number;
  actualCount: number;
  discrepancy: number;
  status: 'MATCHED' | 'MISMATCHED' | 'PENDING';
  checkedAt: string;
}

export interface SLAMetric {
  metricName: string;
  target: number;
  current: number;
  unit: string;
  period: string;
  status: 'WITHIN' | 'WARNING' | 'BREACHED';
}

export interface PlatformHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  activeIncidents: number;
  openAlerts: number;
  queueLag: number;
  uptime: number;
}
