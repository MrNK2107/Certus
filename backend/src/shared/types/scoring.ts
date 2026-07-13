import { PillarName, HealthBand, SourceType } from './enums';

export interface NormalizedObservation {
  observationId: string;
  caseId: string;
  sourceType: SourceType;
  featureName: string;
  featureValue: number | string | boolean;
  confidence: number;
  observedAt: string;
}

export interface FeatureSnapshot {
  featureSnapshotId: string;
  caseId: string;
  featureSchemaVersion: string;
  derivedAt: string;
  sourceCoverage: Record<SourceType, number>;
  featureBlob: Record<string, unknown>;
  completenessScore: number;
}

export interface PillarScore {
  pillarScoreId: string;
  caseId: string;
  pillarName: PillarName;
  score: number;
  confidence: number;
  evidenceSummary: string;
  reasonCodes: string[];
  sourceCoverage: SourceType[];
  modelVersion: string;
}

export interface FHCResult {
  fhcResultId: string;
  caseId: string;
  overallHealth: number;
  healthBand: HealthBand;
  confidence: number;
  completeness: number;
  pillarScores: PillarScore[];
  strengths: string[];
  risks: string[];
  missingSources: SourceType[];
  anomalies: Anomaly[];
  recommendation: string;
  modelVersion: string;
  policyVersion: string;
  createdAt: string;
  version: number;
}

export interface Anomaly {
  anomalyId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  sourcesInvolved: SourceType[];
  reasonCode: string;
}

export interface ReasonCode {
  codeId: string;
  code: string;
  category: string;
  pillar?: PillarName;
  description: string;
  active: boolean;
}
