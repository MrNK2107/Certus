import { CaseState, EntityType, SectorType } from './enums';

export interface BusinessProfile {
  businessName: string;
  pan: string;
  gstin?: string;
  udyam?: string;
  entityType: EntityType;
  sector: SectorType;
  vintage: number;
  turnoverBand?: string;
  location?: string;
  relationshipContext?: string;
}

export interface Case {
  caseId: string;
  applicantId: string;
  businessName: string;
  sector: SectorType;
  status: CaseState;
  createdAt: string;
  updatedAt: string;
  ownerTeam?: string;
  ownerUser?: string;
  modelVersion: string;
  policyVersion: string;
  businessProfile?: BusinessProfile;
}

export interface CaseSummary {
  caseId: string;
  businessName: string;
  sector: SectorType;
  status: CaseState;
  createdAt: string;
  overallHealth?: number;
  confidence?: number;
  completeness?: number;
}
