import { CaseState, EntityType, SectorType, SourceType, ConsentStatus, HealthBand } from '../src';

export const fullEvidenceCase = {
  caseId: 'CASE-FULL-001',
  applicantId: 'APP-001',
  businessName: 'ABC Retail Pvt Ltd',
  sector: SectorType.RETAIL,
  status: CaseState.SCORED,
  createdAt: '2026-07-10T10:00:00Z',
  updatedAt: '2026-07-10T10:30:00Z',
  modelVersion: '1.0.0',
  policyVersion: '1.2',
  businessProfile: {
    businessName: 'ABC Retail Pvt Ltd',
    pan: 'AAACA1234A',
    gstin: '27AAACA1234A1Z5',
    entityType: EntityType.PRIVATE_LIMITED,
    sector: SectorType.RETAIL,
    vintage: 5,
    turnoverBand: '1-5 Cr',
    location: 'Mumbai',
  },
};

export const thinFileCase = {
  caseId: 'CASE-THIN-001',
  applicantId: 'APP-002',
  businessName: 'Fresh Services',
  sector: SectorType.SERVICES,
  status: CaseState.SCORED,
  createdAt: '2026-07-11T09:00:00Z',
  updatedAt: '2026-07-11T09:20:00Z',
  modelVersion: '1.0.0',
  policyVersion: '1.2',
  businessProfile: {
    businessName: 'Fresh Services',
    pan: 'BBBBB5678B',
    entityType: EntityType.SOLE_PROPRIETORSHIP,
    sector: SectorType.SERVICES,
    vintage: 1,
    turnoverBand: '<25L',
    location: 'Delhi',
  },
};

export const consentArtifacts = [
  {
    consentId: 'CON-001',
    caseId: 'CASE-FULL-001',
    sourceType: SourceType.AA,
    status: ConsentStatus.ACTIVE,
    purposeCode: 'FHC_ASSESSMENT',
    scope: '12 months transaction data',
    createdAt: '2026-07-10T10:05:00Z',
    expiresAt: '2026-10-10T10:05:00Z',
    version: 1,
  },
  {
    consentId: 'CON-002',
    caseId: 'CASE-FULL-001',
    sourceType: SourceType.GST,
    status: ConsentStatus.ACTIVE,
    purposeCode: 'FHC_ASSESSMENT',
    scope: 'GST returns for last 12 months',
    createdAt: '2026-07-10T10:05:00Z',
    expiresAt: '2026-10-10T10:05:00Z',
    version: 1,
  },
];

export const fhcResult = {
  fhcResultId: 'FHC-001',
  caseId: 'CASE-FULL-001',
  overallHealth: 75,
  healthBand: HealthBand.STRONG,
  confidence: 82,
  completeness: 85,
  pillarScores: [
    { pillarScoreId: 'PS-001', caseId: 'CASE-FULL-001', pillarName: 'REVENUE_STABILITY', score: 81, confidence: 85, evidenceSummary: 'Consistent GST turnover and bank inflows', reasonCodes: ['stable_monthly_inflows', 'gst_filings_regular'], sourceCoverage: ['AA', 'GST'], modelVersion: '1.0.0' },
    { pillarScoreId: 'PS-002', caseId: 'CASE-FULL-001', pillarName: 'CASH_FLOW_HEALTH', score: 74, confidence: 80, evidenceSummary: 'Healthy average balances, low overdraft usage', reasonCodes: ['low_overdraft_dependence', 'positive_inflow_outflow_ratio'], sourceCoverage: ['AA'], modelVersion: '1.0.0' },
    { pillarScoreId: 'PS-003', caseId: 'CASE-FULL-001', pillarName: 'COMPLIANCE_DISCIPLINE', score: 70, confidence: 75, evidenceSummary: 'Regular GST filings with no gaps', reasonCodes: ['gst_filings_regular'], sourceCoverage: ['GST'], modelVersion: '1.0.0' },
    { pillarScoreId: 'PS-004', caseId: 'CASE-FULL-001', pillarName: 'OPERATIONAL_MATURITY', score: 68, confidence: 70, evidenceSummary: '5 years in operation, consistent activity', reasonCodes: ['established_vintage'], sourceCoverage: ['REGISTRATION'], modelVersion: '1.0.0' },
    { pillarScoreId: 'PS-005', caseId: 'CASE-FULL-001', pillarName: 'CREDIT_BEHAVIOR', score: 75, confidence: 78, evidenceSummary: 'Good repayment history, manageable leverage', reasonCodes: ['good_repayment_history'], sourceCoverage: ['BUREAU'], modelVersion: '1.0.0' },
    { pillarScoreId: 'PS-006', caseId: 'CASE-FULL-001', pillarName: 'DIGITAL_COMMERCIAL_ACTIVITY', score: 62, confidence: 65, evidenceSummary: 'Moderate UPI activity, some digital receipts', reasonCodes: ['moderate_upi_activity'], sourceCoverage: ['UPI'], modelVersion: '1.0.0' },
  ],
  strengths: ['Steady monthly inflows', 'Good filing discipline', 'Manageable leverage', 'Established business vintage'],
  risks: ['Moderate cash concentration', 'Incomplete workforce evidence'],
  missingSources: [SourceType.EPFO],
  anomalies: [],
  recommendation: 'Manual review with streamlined priority',
  modelVersion: '1.0.0',
  policyVersion: '1.2',
  createdAt: '2026-07-10T10:25:00Z',
  version: 1,
};

export const auditEvents = [
  { auditEventId: 'AUD-001', caseId: 'CASE-FULL-001', actor: 'System', action: 'CASE_CREATED', objectType: 'Case', objectId: 'CASE-FULL-001', timestamp: '2026-07-10T10:00:00Z', requestId: 'req-001' },
  { auditEventId: 'AUD-002', caseId: 'CASE-FULL-001', actor: 'Applicant', action: 'CONSENT_GRANTED', objectType: 'ConsentArtifact', objectId: 'CON-001', timestamp: '2026-07-10T10:05:00Z', requestId: 'req-002' },
  { auditEventId: 'AUD-003', caseId: 'CASE-FULL-001', actor: 'System', action: 'SCORING_COMPLETED', objectType: 'FHCResult', objectId: 'FHC-001', timestamp: '2026-07-10T10:25:00Z', requestId: 'req-003', versionContext: { modelVersion: '1.0.0', policyVersion: '1.2' } },
];
