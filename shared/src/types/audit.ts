import { AuditActionType } from './enums';

export interface AuditEvent {
  auditEventId: string;
  caseId?: string;
  actor: string;
  action: AuditActionType;
  objectType: string;
  objectId: string;
  timestamp: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  requestId: string;
  versionContext: {
    modelVersion?: string;
    policyVersion?: string;
    consentVersion?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface AccessLog {
  accessLogId: string;
  caseId: string;
  accessedBy: string;
  accessedAt: string;
  action: string;
  reason?: string;
  ipAddress?: string;
}
