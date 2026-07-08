import { ConsentStatus, SourceType } from './enums';

export interface ConsentArtifact {
  consentId: string;
  caseId: string;
  sourceType: SourceType;
  status: ConsentStatus;
  purposeCode: string;
  scope: string;
  timeWindow?: string;
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
  amendedFrom?: string;
  version: number;
}
