import { PillarName, SourceType } from './enums';

export interface Policy {
  policyId: string;
  name: string;
  description: string;
  version: number;
  active: boolean;
  rules: PolicyRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PolicyRule {
  ruleId: string;
  condition: string;
  action: string;
  priority: number;
}

export interface ModelVersion {
  versionId: string;
  version: string;
  description: string;
  active: boolean;
  promotedAt?: string;
  promotedBy?: string;
  rollbackReason?: string;
  createdAt: string;
  pillarVersions: Record<PillarName, string>;
}

export interface ReasonCodeEntry {
  codeId: string;
  code: string;
  category: string;
  pillar?: PillarName;
  description: string;
  active: boolean;
}

export interface RetentionPolicy {
  ruleId: string;
  sourceType?: SourceType;
  retentionDays: number;
  purgeAfterDays: number;
  exception?: string;
}

export interface PurgeLog {
  purgeId: string;
  purgedAt: string;
  purgedBy: string;
  caseIds: string[];
  sourceTypes: SourceType[];
  recordsRemoved: number;
}

export interface PermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface LimitConfig {
  limitId: string;
  name: string;
  minValue: number;
  maxValue: number;
  unit: string;
  applicableRoles: string[];
}

export interface FeatureFlag {
  flagId: string;
  name: string;
  description: string;
  enabled: boolean;
  targeting?: Record<string, unknown>;
  createdBy: string;
  updatedAt: string;
}

export interface IntegrationConfig {
  integrationId: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
  environment: string;
}

export interface PlatformSettings {
  branding?: Record<string, string>;
  notificationRules?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
}
