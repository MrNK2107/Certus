import { DecisionType } from './enums';

export interface DecisionRecord {
  decisionId: string;
  caseId: string;
  decisionType: DecisionType;
  decisionBy: string;
  decisionReason: string;
  createdAt: string;
  overriddenFrom?: string;
  makerCheckerApprovedBy?: string;
  policyVersion: string;
  fhcVersion: number;
}

export interface DecisionRequest {
  decisionType: DecisionType;
  decisionReason: string;
  makerCheckerApprovedBy?: string;
}

export interface OverrideRequest {
  decisionType: DecisionType;
  overrideReason: string;
  policyReference: string;
}
