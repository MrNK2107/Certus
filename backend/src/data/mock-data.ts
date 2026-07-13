import {
  Case, CaseState, CaseSummary, EntityType, SectorType,
  ConsentArtifact, ConsentStatus, SourceType,
  SourceConnection, SourceLinkStatus, SourceFetch, FetchStatus, SourceDocument, SourcePayload,
  FHCResult, PillarScore, HealthBand, PillarName, NormalizedObservation, FeatureSnapshot, Anomaly, ReasonCode,
  DecisionRecord, DecisionType,
  AuditEvent, AuditActionType, AccessLog,
  User, UserRole, Team, Branch,
  Policy, PolicyRule, ModelVersion, ReasonCodeEntry, RetentionPolicy, PurgeLog, PermissionMatrix, LimitConfig, FeatureFlag, IntegrationConfig, PlatformSettings,
  ConnectorHealth, Alert, AlertSeverity, AlertStatus, ReconciliationRecord, SLAMetric, PlatformHealth,
} from '@msme-credit/shared';
import { loadSeedData } from './seed-data';

const now = new Date().toISOString();

export class MockDataStore {
  cases: Map<string, Case> = new Map();
  consents: Map<string, ConsentArtifact> = new Map();
  sourceConnections: Map<string, SourceConnection> = new Map();
  sourceFetches: Map<string, SourceFetch> = new Map();
  sourceDocuments: Map<string, SourceDocument> = new Map();
  sourcePayloads: Map<string, SourcePayload> = new Map();
  fhcResults: Map<string, FHCResult> = new Map();
  pillarScores: Map<string, PillarScore[]> = new Map();
  observations: Map<string, NormalizedObservation[]> = new Map();
  featureSnapshots: Map<string, FeatureSnapshot> = new Map();
  decisions: Map<string, DecisionRecord> = new Map();
  auditEvents: Map<string, AuditEvent> = new Map();
  accessLogs: Map<string, AccessLog> = new Map();
  users: Map<string, User> = new Map();
  teams: Map<string, Team> = new Map();
  branches: Map<string, Branch> = new Map();
  policies: Map<string, Policy> = new Map();
  models: Map<string, ModelVersion> = new Map();
  reasonCodes: Map<string, ReasonCodeEntry> = new Map();
  retentionPolicies: Map<string, RetentionPolicy> = new Map();
  purgeLogs: Map<string, PurgeLog> = new Map();
  permissions: Map<string, PermissionMatrix> = new Map();
  limits: Map<string, LimitConfig> = new Map();
  featureFlags: Map<string, FeatureFlag> = new Map();
  integrations: Map<string, IntegrationConfig> = new Map();
  platformSettings: PlatformSettings = {};
  connectorHealth: Map<string, ConnectorHealth> = new Map();
  alerts: Map<string, Alert> = new Map();
  reconciliation: Map<string, ReconciliationRecord> = new Map();
  slaMetrics: Map<string, SLAMetric> = new Map();
  platformHealth: PlatformHealth = { status: 'HEALTHY', activeIncidents: 0, openAlerts: 0, queueLag: 0, uptime: 99.9 };

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.initCases();
    this.initConsents();
    this.initSources();
    this.initScoring();
    this.initDecisions();
    this.initAudit();
    this.initUsers();
    this.initBranches();
    this.initTeams();
    this.initPolicies();
    this.initModels();
    this.initReasonCodes();
    this.initRetentionPolicies();
    this.initPermissions();
    this.initLimits();
    this.initFeatureFlags();
    this.initIntegrations();
    this.initConnectors();
    this.initAlerts();
    this.initSLA();
    loadSeedData(this);
  }

  private initCases(): void {
    const cases: Case[] = [
      {
        caseId: 'CASE-FULL-001', applicantId: 'APP-001', businessName: 'ABC Retail Pvt Ltd',
        sector: SectorType.RETAIL, status: CaseState.SCORED, createdAt: '2026-07-10T10:00:00Z',
        updatedAt: '2026-07-10T10:30:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: 'Mumbai Underwriting', ownerUser: 'underwriter@bank.com',
        businessProfile: { businessName: 'ABC Retail Pvt Ltd', pan: 'AAACA1234A', gstin: '27AAACA1234A1Z5', entityType: EntityType.PRIVATE_LIMITED, sector: SectorType.RETAIL, vintage: 5, turnoverBand: '1-5 Cr', location: 'Mumbai' },
      },
      {
        caseId: 'CASE-THIN-001', applicantId: 'APP-002', businessName: 'Fresh Services',
        sector: SectorType.SERVICES, status: CaseState.SCORED, createdAt: '2026-07-11T09:00:00Z',
        updatedAt: '2026-07-11T09:20:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: 'Delhi Underwriting', ownerUser: 'underwriter@bank.com',
        businessProfile: { businessName: 'Fresh Services', pan: 'BBBBB5678B', entityType: EntityType.SOLE_PROPRIETORSHIP, sector: SectorType.SERVICES, vintage: 1, turnoverBand: '<25L', location: 'Delhi' },
      },
      {
        caseId: 'CASE-DRAFT-001', applicantId: 'APP-003', businessName: 'New Enterprise',
        sector: SectorType.MANUFACTURING, status: CaseState.DRAFT, createdAt: '2026-07-12T08:00:00Z',
        updatedAt: '2026-07-12T08:00:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: null as unknown as undefined, ownerUser: null as unknown as undefined,
        businessProfile: { businessName: 'New Enterprise', pan: 'CCCCC9012C', entityType: EntityType.PARTNERSHIP, sector: SectorType.MANUFACTURING, vintage: 2, turnoverBand: '25L-1Cr', location: 'Pune' },
      },
      {
        caseId: 'CASE-PENDING-001', applicantId: 'APP-004', businessName: 'Tech Solutions',
        sector: SectorType.IT, status: CaseState.CONSENT_PENDING, createdAt: '2026-07-12T11:00:00Z',
        updatedAt: '2026-07-12T11:00:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: 'Mumbai Underwriting', ownerUser: 'underwriter@bank.com',
        businessProfile: { businessName: 'Tech Solutions', pan: 'DDDDD3456D', entityType: EntityType.PRIVATE_LIMITED, sector: SectorType.IT, vintage: 3, turnoverBand: '1-5 Cr', location: 'Bangalore' },
      },
      {
        caseId: 'CASE-REVIEW-001', applicantId: 'APP-005', businessName: 'Green Foods',
        sector: SectorType.RESTAURANT, status: CaseState.UNDER_REVIEW, createdAt: '2026-07-13T07:30:00Z',
        updatedAt: '2026-07-13T08:45:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: 'Delhi Underwriting', ownerUser: 'risk-reviewer@bank.com',
        businessProfile: { businessName: 'Green Foods', pan: 'EEEEE7890E', gstin: '07EEEEE7890E1Z5', entityType: EntityType.LLP, sector: SectorType.RESTAURANT, vintage: 2, turnoverBand: '25L-1Cr', location: 'Delhi' },
      },
      {
        caseId: 'CASE-DECIDED-001', applicantId: 'APP-006', businessName: 'Metro Traders',
        sector: SectorType.WHOLESALE, status: CaseState.DECISIONED, createdAt: '2026-07-08T09:00:00Z',
        updatedAt: '2026-07-09T14:00:00Z', modelVersion: '1.0.0', policyVersion: '1.2',
        ownerTeam: 'Mumbai Underwriting', ownerUser: 'underwriter@bank.com',
        businessProfile: { businessName: 'Metro Traders', pan: 'FFFFF1234F', gstin: '27FFFFF1234F1Z5', entityType: EntityType.SOLE_PROPRIETORSHIP, sector: SectorType.WHOLESALE, vintage: 8, turnoverBand: '5-10 Cr', location: 'Mumbai' },
      },
    ];
    for (const c of cases) {
      this.cases.set(c.caseId, c);
    }
  }

  private initConsents(): void {
    const consents: ConsentArtifact[] = [
      { consentId: 'CON-FULL-AA-001', caseId: 'CASE-FULL-001', sourceType: SourceType.AA, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: '12 months transaction data', createdAt: '2026-07-10T10:05:00Z', expiresAt: '2026-10-10T10:05:00Z', version: 1 },
      { consentId: 'CON-FULL-GST-001', caseId: 'CASE-FULL-001', sourceType: SourceType.GST, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'GST returns for last 12 months', createdAt: '2026-07-10T10:05:00Z', expiresAt: '2026-10-10T10:05:00Z', version: 1 },
      { consentId: 'CON-FULL-BUR-001', caseId: 'CASE-FULL-001', sourceType: SourceType.BUREAU, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'Credit report', createdAt: '2026-07-10T10:06:00Z', expiresAt: '2026-10-10T10:06:00Z', version: 1 },
      { consentId: 'CON-FULL-UPI-001', caseId: 'CASE-FULL-001', sourceType: SourceType.UPI, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'UPI transaction data', createdAt: '2026-07-10T10:07:00Z', expiresAt: '2026-10-10T10:07:00Z', version: 1 },
      { consentId: 'CON-THIN-AA-001', caseId: 'CASE-THIN-001', sourceType: SourceType.AA, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: '6 months transaction data', createdAt: '2026-07-11T09:05:00Z', expiresAt: '2026-10-11T09:05:00Z', version: 1 },
      { consentId: 'CON-PEND-AA-001', caseId: 'CASE-PENDING-001', sourceType: SourceType.AA, status: ConsentStatus.PENDING, purposeCode: 'FHC_ASSESSMENT', scope: '12 months transaction data', createdAt: '2026-07-12T11:05:00Z', version: 1 },
      { consentId: 'CON-REV-AA-001', caseId: 'CASE-REVIEW-001', sourceType: SourceType.AA, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: '12 months transaction data', createdAt: '2026-07-13T07:35:00Z', expiresAt: '2026-10-13T07:35:00Z', version: 1 },
      { consentId: 'CON-REV-GST-001', caseId: 'CASE-REVIEW-001', sourceType: SourceType.GST, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'GST returns', createdAt: '2026-07-13T07:35:00Z', expiresAt: '2026-10-13T07:35:00Z', version: 1 },
      { consentId: 'CON-REV-BUR-001', caseId: 'CASE-REVIEW-001', sourceType: SourceType.BUREAU, status: ConsentStatus.REVOKED, purposeCode: 'FHC_ASSESSMENT', scope: 'Credit report', createdAt: '2026-07-13T07:36:00Z', revokedAt: '2026-07-13T08:00:00Z', version: 2, amendedFrom: 'CON-REV-BUR-001-v1' },
      { consentId: 'CON-DEC-AA-001', caseId: 'CASE-DECIDED-001', sourceType: SourceType.AA, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: '12 months transaction data', createdAt: '2026-07-08T09:05:00Z', expiresAt: '2026-10-08T09:05:00Z', version: 1 },
      { consentId: 'CON-DEC-GST-001', caseId: 'CASE-DECIDED-001', sourceType: SourceType.GST, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'GST returns', createdAt: '2026-07-08T09:05:00Z', expiresAt: '2026-10-08T09:05:00Z', version: 1 },
      { consentId: 'CON-DEC-BUR-001', caseId: 'CASE-DECIDED-001', sourceType: SourceType.BUREAU, status: ConsentStatus.ACTIVE, purposeCode: 'FHC_ASSESSMENT', scope: 'Credit report', createdAt: '2026-07-08T09:06:00Z', expiresAt: '2026-10-08T09:06:00Z', version: 1 },
    ];
    for (const c of consents) {
      this.consents.set(c.consentId, c);
    }
  }

  private initSources(): void {
    const connections: SourceConnection[] = [
      { sourceLinkId: 'SL-FULL-AA', caseId: 'CASE-FULL-001', sourceType: SourceType.AA, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-10T10:10:00Z', freshness: 95, quality: 90 },
      { sourceLinkId: 'SL-FULL-GST', caseId: 'CASE-FULL-001', sourceType: SourceType.GST, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-10T10:12:00Z', freshness: 92, quality: 88 },
      { sourceLinkId: 'SL-FULL-BUR', caseId: 'CASE-FULL-001', sourceType: SourceType.BUREAU, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-10T10:08:00Z', freshness: 98, quality: 95 },
      { sourceLinkId: 'SL-FULL-UPI', caseId: 'CASE-FULL-001', sourceType: SourceType.UPI, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-10T10:15:00Z', freshness: 80, quality: 75 },
      { sourceLinkId: 'SL-THIN-AA', caseId: 'CASE-THIN-001', sourceType: SourceType.AA, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-11T09:10:00Z', freshness: 70, quality: 65 },
      { sourceLinkId: 'SL-PEND-AA', caseId: 'CASE-PENDING-001', sourceType: SourceType.AA, status: SourceLinkStatus.PENDING },
      { sourceLinkId: 'SL-REV-AA', caseId: 'CASE-REVIEW-001', sourceType: SourceType.AA, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-13T07:40:00Z', freshness: 85, quality: 80 },
      { sourceLinkId: 'SL-REV-GST', caseId: 'CASE-REVIEW-001', sourceType: SourceType.GST, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-13T07:42:00Z', freshness: 82, quality: 78 },
      { sourceLinkId: 'SL-REV-BUR', caseId: 'CASE-REVIEW-001', sourceType: SourceType.BUREAU, status: SourceLinkStatus.REVOKED },
      { sourceLinkId: 'SL-DEC-AA', caseId: 'CASE-DECIDED-001', sourceType: SourceType.AA, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-08T09:10:00Z', freshness: 90, quality: 92 },
      { sourceLinkId: 'SL-DEC-GST', caseId: 'CASE-DECIDED-001', sourceType: SourceType.GST, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-08T09:12:00Z', freshness: 88, quality: 85 },
      { sourceLinkId: 'SL-DEC-BUR', caseId: 'CASE-DECIDED-001', sourceType: SourceType.BUREAU, status: SourceLinkStatus.CONNECTED, lastSyncedAt: '2026-07-08T09:08:00Z', freshness: 95, quality: 90 },
    ];
    for (const c of connections) {
      this.sourceConnections.set(c.sourceLinkId, c);
    }
    const fetches: SourceFetch[] = [
      { fetchId: 'FETCH-FULL-AA-1', caseId: 'CASE-FULL-001', sourceType: SourceType.AA, status: FetchStatus.COMPLETED, startedAt: '2026-07-10T10:10:00Z', completedAt: '2026-07-10T10:15:00Z', retryCount: 0, payloadVersion: '1.0' },
      { fetchId: 'FETCH-FULL-GST-1', caseId: 'CASE-FULL-001', sourceType: SourceType.GST, status: FetchStatus.COMPLETED, startedAt: '2026-07-10T10:12:00Z', completedAt: '2026-07-10T10:18:00Z', retryCount: 0, payloadVersion: '1.0' },
      { fetchId: 'FETCH-FULL-BUR-1', caseId: 'CASE-FULL-001', sourceType: SourceType.BUREAU, status: FetchStatus.COMPLETED, startedAt: '2026-07-10T10:08:00Z', completedAt: '2026-07-10T10:09:00Z', retryCount: 0, payloadVersion: '2.0' },
      { fetchId: 'FETCH-THIN-AA-1', caseId: 'CASE-THIN-001', sourceType: SourceType.AA, status: FetchStatus.COMPLETED, startedAt: '2026-07-11T09:10:00Z', completedAt: '2026-07-11T09:12:00Z', retryCount: 0, payloadVersion: '1.0' },
      { fetchId: 'FETCH-REV-AA-1', caseId: 'CASE-REVIEW-001', sourceType: SourceType.AA, status: FetchStatus.COMPLETED, startedAt: '2026-07-13T07:40:00Z', completedAt: '2026-07-13T07:45:00Z', retryCount: 0, payloadVersion: '1.0' },
      { fetchId: 'FETCH-REV-GST-1', caseId: 'CASE-REVIEW-001', sourceType: SourceType.GST, status: FetchStatus.IN_PROGRESS, startedAt: '2026-07-13T07:42:00Z', retryCount: 1, payloadVersion: '1.0' },
    ];
    for (const f of fetches) {
      this.sourceFetches.set(f.fetchId, f);
    }
  }

  private initScoring(): void {
    const fullPillars: PillarScore[] = [
      { pillarScoreId: 'PS-FULL-RS', caseId: 'CASE-FULL-001', pillarName: PillarName.REVENUE_STABILITY, score: 81, confidence: 85, evidenceSummary: 'Consistent GST turnover and bank inflows', reasonCodes: ['stable_monthly_inflows', 'gst_filings_regular'], sourceCoverage: [SourceType.AA, SourceType.GST], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-FULL-CF', caseId: 'CASE-FULL-001', pillarName: PillarName.CASH_FLOW_HEALTH, score: 74, confidence: 80, evidenceSummary: 'Healthy average balances, low overdraft usage', reasonCodes: ['low_overdraft_dependence', 'positive_inflow_outflow_ratio'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-FULL-CD', caseId: 'CASE-FULL-001', pillarName: PillarName.COMPLIANCE_DISCIPLINE, score: 70, confidence: 75, evidenceSummary: 'Regular GST filings with no gaps', reasonCodes: ['gst_filings_regular'], sourceCoverage: [SourceType.GST], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-FULL-OM', caseId: 'CASE-FULL-001', pillarName: PillarName.OPERATIONAL_MATURITY, score: 68, confidence: 70, evidenceSummary: '5 years in operation, consistent activity', reasonCodes: ['established_vintage'], sourceCoverage: [SourceType.REGISTRATION], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-FULL-CB', caseId: 'CASE-FULL-001', pillarName: PillarName.CREDIT_BEHAVIOR, score: 75, confidence: 78, evidenceSummary: 'Good repayment history, manageable leverage', reasonCodes: ['good_repayment_history'], sourceCoverage: [SourceType.BUREAU], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-FULL-DC', caseId: 'CASE-FULL-001', pillarName: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, score: 62, confidence: 65, evidenceSummary: 'Moderate UPI activity, some digital receipts', reasonCodes: ['moderate_upi_activity'], sourceCoverage: [SourceType.UPI], modelVersion: '1.0.0' },
    ];
    this.pillarScores.set('CASE-FULL-001', fullPillars);

    const thinPillars: PillarScore[] = [
      { pillarScoreId: 'PS-THIN-RS', caseId: 'CASE-THIN-001', pillarName: PillarName.REVENUE_STABILITY, score: 45, confidence: 35, evidenceSummary: 'Limited bank data, short track record', reasonCodes: ['short_track_record', 'limited_data'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-THIN-CF', caseId: 'CASE-THIN-001', pillarName: PillarName.CASH_FLOW_HEALTH, score: 50, confidence: 40, evidenceSummary: 'Some inflows visible, but limited history', reasonCodes: ['limited_data'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-THIN-CD', caseId: 'CASE-THIN-001', pillarName: PillarName.COMPLIANCE_DISCIPLINE, score: 30, confidence: 20, evidenceSummary: 'No GST data available', reasonCodes: ['missing_gst'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-THIN-OM', caseId: 'CASE-THIN-001', pillarName: PillarName.OPERATIONAL_MATURITY, score: 35, confidence: 30, evidenceSummary: 'Business only 1 year old', reasonCodes: ['short_vintage'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-THIN-CB', caseId: 'CASE-THIN-001', pillarName: PillarName.CREDIT_BEHAVIOR, score: 40, confidence: 25, evidenceSummary: 'No bureau data available', reasonCodes: ['missing_bureau'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-THIN-DC', caseId: 'CASE-THIN-001', pillarName: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, score: 35, confidence: 20, evidenceSummary: 'Minimal digital footprint', reasonCodes: ['low_digital_footprint'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
    ];
    this.pillarScores.set('CASE-THIN-001', thinPillars);

    const reviewPillars: PillarScore[] = [
      { pillarScoreId: 'PS-REV-RS', caseId: 'CASE-REVIEW-001', pillarName: PillarName.REVENUE_STABILITY, score: 55, confidence: 60, evidenceSummary: 'Moderate bank inflows, GST data partial', reasonCodes: ['inconsistent_inflows', 'gst_gap_detected'], sourceCoverage: [SourceType.AA, SourceType.GST], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-REV-CF', caseId: 'CASE-REVIEW-001', pillarName: PillarName.CASH_FLOW_HEALTH, score: 45, confidence: 55, evidenceSummary: 'High overdraft utilization observed', reasonCodes: ['high_overdraft_usage'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-REV-CD', caseId: 'CASE-REVIEW-001', pillarName: PillarName.COMPLIANCE_DISCIPLINE, score: 40, confidence: 50, evidenceSummary: 'GST filing gaps detected', reasonCodes: ['gst_gap_detected'], sourceCoverage: [SourceType.GST], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-REV-OM', caseId: 'CASE-REVIEW-001', pillarName: PillarName.OPERATIONAL_MATURITY, score: 50, confidence: 55, evidenceSummary: 'Limited operational history', reasonCodes: ['short_vintage'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-REV-CB', caseId: 'CASE-REVIEW-001', pillarName: PillarName.CREDIT_BEHAVIOR, score: 35, confidence: 40, evidenceSummary: 'Bureau consent revoked, no credit data', reasonCodes: ['source_revoked', 'missing_bureau'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
      { pillarScoreId: 'PS-REV-DC', caseId: 'CASE-REVIEW-001', pillarName: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, score: 42, confidence: 45, evidenceSummary: 'Moderate digital activity', reasonCodes: ['moderate_upi_activity'], sourceCoverage: [SourceType.AA], modelVersion: '1.0.0' },
    ];
    this.pillarScores.set('CASE-REVIEW-001', reviewPillars);

    const fullResult: FHCResult = {
      fhcResultId: 'FHC-FULL-001', caseId: 'CASE-FULL-001',
      overallHealth: 75, healthBand: HealthBand.STRONG, confidence: 82, completeness: 85,
      pillarScores: fullPillars,
      strengths: ['Steady monthly inflows', 'Good filing discipline', 'Manageable leverage', 'Established business vintage'],
      risks: ['Moderate cash concentration', 'Incomplete workforce evidence'],
      missingSources: [SourceType.EPFO],
      anomalies: [],
      recommendation: 'Manual review with streamlined priority',
      modelVersion: '1.0.0', policyVersion: '1.2', createdAt: '2026-07-10T10:25:00Z', version: 1,
    };
    this.fhcResults.set('CASE-FULL-001', fullResult);

    const thinResult: FHCResult = {
      fhcResultId: 'FHC-THIN-001', caseId: 'CASE-THIN-001',
      overallHealth: 40, healthBand: HealthBand.PROMISING_BUT_THIN, confidence: 28, completeness: 35,
      pillarScores: thinPillars,
      strengths: ['New business with initial revenues'],
      risks: ['Very thin data coverage', 'No bureau history', 'No GST filing evidence', 'Short vintage'],
      missingSources: [SourceType.GST, SourceType.BUREAU, SourceType.UPI, SourceType.EPFO, SourceType.REGISTRATION],
      anomalies: [],
      recommendation: 'Consider alternative data or low-ticket product',
      modelVersion: '1.0.0', policyVersion: '1.2', createdAt: '2026-07-11T09:20:00Z', version: 1,
    };
    this.fhcResults.set('CASE-THIN-001', thinResult);

    const reviewResult: FHCResult = {
      fhcResultId: 'FHC-REV-001', caseId: 'CASE-REVIEW-001',
      overallHealth: 45, healthBand: HealthBand.NEEDS_REVIEW, confidence: 50, completeness: 65,
      pillarScores: reviewPillars,
      strengths: ['Some bank data available'],
      risks: ['Bureau consent revoked', 'GST filing gaps', 'High overdraft usage', 'Short operational history'],
      missingSources: [SourceType.BUREAU, SourceType.UPI, SourceType.EPFO],
      anomalies: [
        { anomalyId: 'ANOM-REV-001', type: 'CONSENT_REVOKED', severity: 'HIGH', description: 'Bureau consent was revoked mid-process', sourcesInvolved: [SourceType.BUREAU], reasonCode: 'source_revoked' },
        { anomalyId: 'ANOM-REV-002', type: 'GST_GAP', severity: 'MEDIUM', description: 'GST filing gap of 2 months detected', sourcesInvolved: [SourceType.GST], reasonCode: 'gst_gap_detected' },
      ],
      recommendation: 'Required manual review - missing critical data sources',
      modelVersion: '1.0.0', policyVersion: '1.2', createdAt: '2026-07-13T08:45:00Z', version: 1,
    };
    this.fhcResults.set('CASE-REVIEW-001', reviewResult);
  }

  private initDecisions(): void {
    const decisions: DecisionRecord[] = [
      { decisionId: 'DEC-001', caseId: 'CASE-DECIDED-001', decisionType: DecisionType.APPROVE, decisionBy: 'underwriter@bank.com', decisionReason: 'Strong financial health, good track record, all sources verified', createdAt: '2026-07-09T14:00:00Z', policyVersion: '1.2', fhcVersion: 1 },
    ];
    for (const d of decisions) {
      this.decisions.set(d.decisionId, d);
    }
  }

  private initAudit(): void {
    const events: AuditEvent[] = [
      { auditEventId: 'AUD-FULL-001', caseId: 'CASE-FULL-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-FULL-001', timestamp: '2026-07-10T10:00:00Z', requestId: 'req-init-001', versionContext: {} },
      { auditEventId: 'AUD-FULL-002', caseId: 'CASE-FULL-001', actor: 'Applicant', action: AuditActionType.CONSENT_GRANTED, objectType: 'ConsentArtifact', objectId: 'CON-FULL-AA-001', timestamp: '2026-07-10T10:05:00Z', requestId: 'req-init-002', beforeState: { status: ConsentStatus.PENDING }, afterState: { status: ConsentStatus.ACTIVE }, versionContext: { consentVersion: 1 } },
      { auditEventId: 'AUD-FULL-003', caseId: 'CASE-FULL-001', actor: 'System', action: AuditActionType.SCORING_COMPLETED, objectType: 'FHCResult', objectId: 'FHC-FULL-001', timestamp: '2026-07-10T10:25:00Z', requestId: 'req-init-003', versionContext: { modelVersion: '1.0.0', policyVersion: '1.2' } },
      { auditEventId: 'AUD-FULL-004', caseId: 'CASE-FULL-001', actor: 'System', action: AuditActionType.CASE_STATE_CHANGED, objectType: 'Case', objectId: 'CASE-FULL-001', timestamp: '2026-07-10T10:10:00Z', requestId: 'req-init-004', beforeState: { status: CaseState.DRAFT }, afterState: { status: CaseState.CONSENT_PENDING }, versionContext: {} },
      { auditEventId: 'AUD-FULL-005', caseId: 'CASE-FULL-001', actor: 'System', action: AuditActionType.CASE_STATE_CHANGED, objectType: 'Case', objectId: 'CASE-FULL-001', timestamp: '2026-07-10T10:20:00Z', requestId: 'req-init-005', beforeState: { status: CaseState.DATA_FETCHING }, afterState: { status: CaseState.DATA_READY }, versionContext: {} },
      { auditEventId: 'AUD-THIN-001', caseId: 'CASE-THIN-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-THIN-001', timestamp: '2026-07-11T09:00:00Z', requestId: 'req-init-006', versionContext: {} },
      { auditEventId: 'AUD-THIN-002', caseId: 'CASE-THIN-001', actor: 'System', action: AuditActionType.SCORING_COMPLETED, objectType: 'FHCResult', objectId: 'FHC-THIN-001', timestamp: '2026-07-11T09:20:00Z', requestId: 'req-init-007', versionContext: { modelVersion: '1.0.0', policyVersion: '1.2' } },
      { auditEventId: 'AUD-REV-001', caseId: 'CASE-REVIEW-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-REVIEW-001', timestamp: '2026-07-13T07:30:00Z', requestId: 'req-init-008', versionContext: {} },
      { auditEventId: 'AUD-REV-002', caseId: 'CASE-REVIEW-001', actor: 'Applicant', action: AuditActionType.CONSENT_GRANTED, objectType: 'ConsentArtifact', objectId: 'CON-REV-AA-001', timestamp: '2026-07-13T07:35:00Z', requestId: 'req-init-009', versionContext: { consentVersion: 1 } },
      { auditEventId: 'AUD-REV-003', caseId: 'CASE-REVIEW-001', actor: 'Applicant', action: AuditActionType.CONSENT_REVOKED, objectType: 'ConsentArtifact', objectId: 'CON-REV-BUR-001', timestamp: '2026-07-13T08:00:00Z', requestId: 'req-init-010', versionContext: { consentVersion: 2 } },
      { auditEventId: 'AUD-DEC-001', caseId: 'CASE-DECIDED-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-DECIDED-001', timestamp: '2026-07-08T09:00:00Z', requestId: 'req-init-011', versionContext: {} },
      { auditEventId: 'AUD-DEC-002', caseId: 'CASE-DECIDED-001', actor: 'underwriter@bank.com', action: AuditActionType.DECISION_MADE, objectType: 'DecisionRecord', objectId: 'DEC-001', timestamp: '2026-07-09T14:00:00Z', requestId: 'req-init-012', versionContext: { policyVersion: '1.2' }, afterState: { decisionType: DecisionType.APPROVE } },
      { auditEventId: 'AUD-DRAFT-001', caseId: 'CASE-DRAFT-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-DRAFT-001', timestamp: '2026-07-12T08:00:00Z', requestId: 'req-init-013', versionContext: {} },
      { auditEventId: 'AUD-PEND-001', caseId: 'CASE-PENDING-001', actor: 'System', action: AuditActionType.CASE_CREATED, objectType: 'Case', objectId: 'CASE-PENDING-001', timestamp: '2026-07-12T11:00:00Z', requestId: 'req-init-014', versionContext: {} },
    ];
    for (const e of events) {
      this.auditEvents.set(e.auditEventId, e);
    }
  }

  private initUsers(): void {
    const users: User[] = [
      { userId: 'USR-001', name: 'Admin User', email: 'admin@bank.com', role: UserRole.SUPER_ADMIN, team: 'Management', branch: 'BR-MUM-001', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
      { userId: 'USR-002', name: 'Underwriter One', email: 'underwriter@bank.com', role: UserRole.UNDERWRITER, team: 'Mumbai Underwriting', branch: 'BR-MUM-001', status: 'ACTIVE', createdAt: '2026-01-15T00:00:00Z' },
      { userId: 'USR-003', name: 'Risk Reviewer', email: 'risk-reviewer@bank.com', role: UserRole.RISK_REVIEWER, team: 'Delhi Underwriting', branch: 'BR-DEL-001', status: 'ACTIVE', createdAt: '2026-02-01T00:00:00Z' },
      { userId: 'USR-004', name: 'Relationship Manager', email: 'rm@bank.com', role: UserRole.RELATIONSHIP_MANAGER, team: 'Mumbai Underwriting', branch: 'BR-MUM-001', status: 'ACTIVE', createdAt: '2026-01-20T00:00:00Z' },
      { userId: 'USR-005', name: 'Compliance Officer', email: 'compliance@bank.com', role: UserRole.COMPLIANCE_REVIEWER, team: 'Compliance', branch: 'BR-MUM-001', status: 'ACTIVE', createdAt: '2026-01-10T00:00:00Z' },
      { userId: 'USR-006', name: 'Operations User', email: 'ops@bank.com', role: UserRole.OPERATIONS, team: 'Operations', branch: 'BR-DEL-001', status: 'ACTIVE', createdAt: '2026-03-01T00:00:00Z' },
      { userId: 'USR-007', name: 'Viewer User', email: 'viewer@bank.com', role: UserRole.VIEWER, team: 'Management', branch: 'BR-MUM-001', status: 'ACTIVE', createdAt: '2026-04-01T00:00:00Z' },
      { userId: 'USR-008', name: 'Inactive User', email: 'inactive@bank.com', role: UserRole.UNDERWRITER, team: 'Mumbai Underwriting', branch: 'BR-MUM-001', status: 'INACTIVE', createdAt: '2026-01-15T00:00:00Z' },
    ];
    for (const u of users) {
      this.users.set(u.userId, u);
    }
  }

  private initBranches(): void {
    const branches: Branch[] = [
      { branchId: 'BR-MUM-001', name: 'Mumbai Main Branch', code: 'MUM001', region: 'West', portfolioOwners: ['underwriter@bank.com', 'rm@bank.com'] },
      { branchId: 'BR-DEL-001', name: 'Delhi North Branch', code: 'DEL001', region: 'North', portfolioOwners: ['risk-reviewer@bank.com'] },
    ];
    for (const b of branches) {
      this.branches.set(b.branchId, b);
    }
  }

  private initTeams(): void {
    const teams: Team[] = [
      { teamId: 'TEAM-MUM-UW', name: 'Mumbai Underwriting', branchId: 'BR-MUM-001', members: ['underwriter@bank.com', 'rm@bank.com'], reviewerRouting: 'risk-reviewer@bank.com' },
      { teamId: 'TEAM-DEL-UW', name: 'Delhi Underwriting', branchId: 'BR-DEL-001', members: ['risk-reviewer@bank.com'], reviewerRouting: 'compliance@bank.com' },
      { teamId: 'TEAM-COMP', name: 'Compliance', branchId: 'BR-MUM-001', members: ['compliance@bank.com'] },
      { teamId: 'TEAM-OPS', name: 'Operations', branchId: 'BR-DEL-001', members: ['ops@bank.com'] },
      { teamId: 'TEAM-MGMT', name: 'Management', branchId: 'BR-MUM-001', members: ['admin@bank.com', 'viewer@bank.com'] },
    ];
    for (const t of teams) {
      this.teams.set(t.teamId, t);
    }
  }

  private initPolicies(): void {
    const policies: Policy[] = [
      {
        policyId: 'POL-001', name: 'Standard Underwriting Policy', description: 'Default policy for MSME credit assessment',
        version: 1, active: true, rules: [
          { ruleId: 'RULE-001', condition: 'overallHealth >= 70 AND confidence >= 60', action: 'APPROVE', priority: 1 },
          { ruleId: 'RULE-002', condition: 'overallHealth >= 50 AND confidence >= 40', action: 'REFER_FOR_REVIEW', priority: 2 },
          { ruleId: 'RULE-003', condition: 'overallHealth < 50 OR confidence < 40', action: 'DECLINE', priority: 3 },
        ],
        createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z', createdBy: 'admin@bank.com',
      },
      {
        policyId: 'POL-002', name: 'Thin-File Relaxed Policy', description: 'Relaxed criteria for thin-file / new-to-credit cases',
        version: 1, active: false, rules: [
          { ruleId: 'RULE-004', condition: 'overallHealth >= 50', action: 'REFER_FOR_MANUAL_REVIEW', priority: 1 },
        ],
        createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z', createdBy: 'risk-reviewer@bank.com',
      },
    ];
    for (const p of policies) {
      this.policies.set(p.policyId, p);
    }
  }

  private initModels(): void {
    const models: ModelVersion[] = [
      { versionId: 'MOD-001', version: '1.0.0', description: 'Initial production model', active: true, promotedAt: '2026-06-01T00:00:00Z', promotedBy: 'admin@bank.com', createdAt: '2026-05-20T00:00:00Z', pillarVersions: { REVENUE_STABILITY: '1.0', CASH_FLOW_HEALTH: '1.0', COMPLIANCE_DISCIPLINE: '1.0', OPERATIONAL_MATURITY: '1.0', CREDIT_BEHAVIOR: '1.0', DIGITAL_COMMERCIAL_ACTIVITY: '1.0' } },
      { versionId: 'MOD-002', version: '1.1.0-beta', description: 'Beta with enhanced cash flow model', active: false, createdAt: '2026-07-01T00:00:00Z', pillarVersions: { REVENUE_STABILITY: '1.0', CASH_FLOW_HEALTH: '1.1', COMPLIANCE_DISCIPLINE: '1.0', OPERATIONAL_MATURITY: '1.0', CREDIT_BEHAVIOR: '1.0', DIGITAL_COMMERCIAL_ACTIVITY: '1.0' } },
    ];
    for (const m of models) {
      this.models.set(m.versionId, m);
    }
  }

  private initReasonCodes(): void {
    const codes: ReasonCodeEntry[] = [
      { codeId: 'RC-001', code: 'stable_monthly_inflows', category: 'POSITIVE', pillar: PillarName.REVENUE_STABILITY, description: 'Business shows stable monthly revenue inflows', active: true },
      { codeId: 'RC-002', code: 'gst_filings_regular', category: 'POSITIVE', pillar: PillarName.COMPLIANCE_DISCIPLINE, description: 'GST filings are regular without gaps', active: true },
      { codeId: 'RC-003', code: 'low_overdraft_dependence', category: 'POSITIVE', pillar: PillarName.CASH_FLOW_HEALTH, description: 'Low dependence on overdraft facilities', active: true },
      { codeId: 'RC-004', code: 'positive_inflow_outflow_ratio', category: 'POSITIVE', pillar: PillarName.CASH_FLOW_HEALTH, description: 'Positive ratio of inflows to outflows', active: true },
      { codeId: 'RC-005', code: 'established_vintage', category: 'POSITIVE', pillar: PillarName.OPERATIONAL_MATURITY, description: 'Business has been operating for several years', active: true },
      { codeId: 'RC-006', code: 'good_repayment_history', category: 'POSITIVE', pillar: PillarName.CREDIT_BEHAVIOR, description: 'History shows timely repayments', active: true },
      { codeId: 'RC-007', code: 'moderate_upi_activity', category: 'NEUTRAL', pillar: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, description: 'Moderate level of UPI transaction activity', active: true },
      { codeId: 'RC-008', code: 'missing_gst', category: 'NEGATIVE', pillar: PillarName.COMPLIANCE_DISCIPLINE, description: 'No GST data available for assessment', active: true },
      { codeId: 'RC-009', code: 'missing_bureau', category: 'NEGATIVE', pillar: PillarName.CREDIT_BEHAVIOR, description: 'No credit bureau data available', active: true },
      { codeId: 'RC-010', code: 'short_track_record', category: 'NEGATIVE', pillar: PillarName.REVENUE_STABILITY, description: 'Limited historical data to assess stability', active: true },
      { codeId: 'RC-011', code: 'short_vintage', category: 'NEGATIVE', pillar: PillarName.OPERATIONAL_MATURITY, description: 'Business has short operational history', active: true },
      { codeId: 'RC-012', code: 'limited_data', category: 'NEGATIVE', description: 'Insufficient data points for reliable assessment', active: true },
      { codeId: 'RC-013', code: 'low_digital_footprint', category: 'NEGATIVE', pillar: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, description: 'Very low digital transaction footprint', active: true },
      { codeId: 'RC-014', code: 'inconsistent_inflows', category: 'NEGATIVE', pillar: PillarName.REVENUE_STABILITY, description: 'Revenue inflows show inconsistency', active: true },
      { codeId: 'RC-015', code: 'gst_gap_detected', category: 'NEGATIVE', pillar: PillarName.COMPLIANCE_DISCIPLINE, description: 'Gap detected in GST filing history', active: true },
      { codeId: 'RC-016', code: 'high_overdraft_usage', category: 'NEGATIVE', pillar: PillarName.CASH_FLOW_HEALTH, description: 'High utilization of overdraft facilities', active: true },
      { codeId: 'RC-017', code: 'source_revoked', category: 'NEGATIVE', pillar: PillarName.CREDIT_BEHAVIOR, description: 'Data source consent was revoked', active: true },
    ];
    for (const c of codes) {
      this.reasonCodes.set(c.codeId, c);
    }
  }

  private initRetentionPolicies(): void {
    const policies: RetentionPolicy[] = [
      { ruleId: 'RET-001', sourceType: SourceType.AA, retentionDays: 365, purgeAfterDays: 730 },
      { ruleId: 'RET-002', sourceType: SourceType.GST, retentionDays: 365, purgeAfterDays: 730 },
      { ruleId: 'RET-003', sourceType: SourceType.BUREAU, retentionDays: 180, purgeAfterDays: 365 },
      { ruleId: 'RET-004', sourceType: SourceType.UPI, retentionDays: 180, purgeAfterDays: 365 },
      { ruleId: 'RET-005', sourceType: SourceType.EPFO, retentionDays: 365, purgeAfterDays: 730 },
      { ruleId: 'RET-006', sourceType: SourceType.REGISTRATION, retentionDays: 730, purgeAfterDays: 1095 },
    ];
    for (const p of policies) {
      this.retentionPolicies.set(p.ruleId, p);
    }
  }

  private initPermissions(): void {
    const perms: PermissionMatrix[] = [
      { roleId: 'ROLE-SA', roleName: 'SUPER_ADMIN', permissions: ['cases:*', 'consents:*', 'scoring:*', 'decisions:*', 'audit:*', 'governance:*', 'ops:*', 'admin:*', 'users:*'] },
      { roleId: 'ROLE-ADMIN', roleName: 'ADMIN', permissions: ['cases:*', 'consents:*', 'scoring:*', 'decisions:*', 'audit:*', 'governance:*', 'ops:*', 'admin:read'] },
      { roleId: 'ROLE-UW', roleName: 'UNDERWRITER', permissions: ['cases:read', 'cases:write', 'consents:read', 'scoring:read', 'decisions:write'] },
      { roleId: 'ROLE-RM', roleName: 'RELATIONSHIP_MANAGER', permissions: ['cases:read', 'cases:create', 'consents:read'] },
      { roleId: 'ROLE-RISK', roleName: 'RISK_REVIEWER', permissions: ['cases:read', 'scoring:read', 'decisions:read', 'decisions:override'] },
      { roleId: 'ROLE-COMP', roleName: 'COMPLIANCE_REVIEWER', permissions: ['cases:read', 'audit:read', 'governance:read'] },
      { roleId: 'ROLE-OPS', roleName: 'OPERATIONS', permissions: ['cases:read', 'ops:*', 'audit:read'] },
      { roleId: 'ROLE-VIEW', roleName: 'VIEWER', permissions: ['cases:read'] },
    ];
    for (const p of perms) {
      this.permissions.set(p.roleId, p);
    }
  }

  private initLimits(): void {
    const limits: LimitConfig[] = [
      { limitId: 'LIM-001', name: 'Max Loan Amount', minValue: 100000, maxValue: 10000000, unit: 'INR', applicableRoles: ['UNDERWRITER', 'RISK_REVIEWER'] },
      { limitId: 'LIM-002', name: 'Max Decision Amount', minValue: 0, maxValue: 5000000, unit: 'INR', applicableRoles: ['UNDERWRITER'] },
      { limitId: 'LIM-003', name: 'Max Override Amount', minValue: 0, maxValue: 10000000, unit: 'INR', applicableRoles: ['RISK_REVIEWER'] },
    ];
    for (const l of limits) {
      this.limits.set(l.limitId, l);
    }
  }

  private initFeatureFlags(): void {
    const flags: FeatureFlag[] = [
      { flagId: 'FF-001', name: 'enable_new_scoring_model', description: 'Use the new v1.1 scoring model', enabled: false, createdBy: 'admin@bank.com', updatedAt: '2026-07-01T00:00:00Z' },
      { flagId: 'FF-002', name: 'enable_auto_decision', description: 'Allow automatic decisions for low-risk cases', enabled: false, createdBy: 'admin@bank.com', updatedAt: '2026-07-01T00:00:00Z' },
      { flagId: 'FF-003', name: 'enable_maker_checker', description: 'Enforce maker-checker for all decisions', enabled: true, createdBy: 'admin@bank.com', updatedAt: '2026-06-15T00:00:00Z' },
      { flagId: 'FF-004', name: 'enable_gst_validation', description: 'Validate GST numbers against GST portal', enabled: true, createdBy: 'admin@bank.com', updatedAt: '2026-06-01T00:00:00Z' },
    ];
    for (const f of flags) {
      this.featureFlags.set(f.flagId, f);
    }
  }

  private initIntegrations(): void {
    const integrations: IntegrationConfig[] = [
      { integrationId: 'INT-AA-001', name: 'Account Aggregator Gateway', type: 'AA', config: { endpoint: 'https://aa-gateway.example.com/api', timeout: 30000 }, enabled: true, environment: 'production' },
      { integrationId: 'INT-GST-001', name: 'GST Portal Integration', type: 'GST', config: { endpoint: 'https://gst.example.com/api', timeout: 15000 }, enabled: true, environment: 'production' },
      { integrationId: 'INT-BUR-001', name: 'Credit Bureau API', type: 'BUREAU', config: { endpoint: 'https://bureau.example.com/api', timeout: 10000 }, enabled: true, environment: 'production' },
    ];
    for (const i of integrations) {
      this.integrations.set(i.integrationId, i);
    }
  }

  private initConnectors(): void {
    const connectors: ConnectorHealth[] = [
      { sourceType: SourceType.AA, status: 'UP', lastCheckedAt: now, successRate: 98.5, failureRate: 1.5, averageLatency: 1200, retryCount: 0 },
      { sourceType: SourceType.GST, status: 'UP', lastCheckedAt: now, successRate: 96.2, failureRate: 3.8, averageLatency: 2500, retryCount: 1 },
      { sourceType: SourceType.BUREAU, status: 'UP', lastCheckedAt: now, successRate: 99.1, failureRate: 0.9, averageLatency: 800, retryCount: 0 },
      { sourceType: SourceType.UPI, status: 'DEGRADED', lastCheckedAt: now, successRate: 88.5, failureRate: 11.5, averageLatency: 3500, retryCount: 3 },
      { sourceType: SourceType.EPFO, status: 'DOWN', lastCheckedAt: now, successRate: 45.0, failureRate: 55.0, averageLatency: 15000, retryCount: 8 },
      { sourceType: SourceType.REGISTRATION, status: 'UP', lastCheckedAt: now, successRate: 97.0, failureRate: 3.0, averageLatency: 1500, retryCount: 0 },
    ];
    for (const c of connectors) {
      this.connectorHealth.set(c.sourceType, c);
    }
  }

  private initAlerts(): void {
    const alerts: Alert[] = [
      { alertId: 'ALERT-001', severity: AlertSeverity.CRITICAL, source: SourceType.EPFO, title: 'EPFO Connector Down', description: 'EPFO data source has been unresponsive for 30 minutes', caseImpact: 'Cases requiring EPFO data cannot proceed', timestamp: '2026-07-13T07:00:00Z', status: AlertStatus.OPEN },
      { alertId: 'ALERT-002', severity: AlertSeverity.HIGH, source: SourceType.UPI, title: 'UPI Connector Degraded', description: 'UPI connector latency above threshold (3.5s avg)', timestamp: '2026-07-13T06:30:00Z', status: AlertStatus.ACKNOWLEDGED, acknowledgedBy: 'ops@bank.com', acknowledgedAt: '2026-07-13T07:00:00Z' },
      { alertId: 'ALERT-003', severity: AlertSeverity.MEDIUM, source: SourceType.GST, title: 'GST Fetch Retry', description: 'One GST fetch is on retry for case CASE-REVIEW-001', timestamp: '2026-07-13T08:00:00Z', status: AlertStatus.OPEN },
    ];
    for (const a of alerts) {
      this.alerts.set(a.alertId, a);
    }
  }

  private initSLA(): void {
    const metrics: SLAMetric[] = [
      { metricName: 'Case Processing Time', target: 24, current: 18.5, unit: 'hours', period: '2026-07', status: 'WITHIN' },
      { metricName: 'Scoring Latency', target: 5, current: 3.2, unit: 'seconds', period: '2026-07', status: 'WITHIN' },
      { metricName: 'Data Fetch Completeness', target: 95, current: 88.3, unit: 'percent', period: '2026-07', status: 'WARNING' },
      { metricName: 'API Uptime', target: 99.9, current: 99.87, unit: 'percent', period: '2026-07', status: 'WARNING' },
      { metricName: 'Consent Turnaround', target: 48, current: 12.5, unit: 'hours', period: '2026-07', status: 'WITHIN' },
    ];
    for (const m of metrics) {
      this.slaMetrics.set(m.metricName, m);
    }
  }

  reset(): void {
    this.cases.clear();
    this.consents.clear();
    this.sourceConnections.clear();
    this.sourceFetches.clear();
    this.sourceDocuments.clear();
    this.sourcePayloads.clear();
    this.fhcResults.clear();
    this.pillarScores.clear();
    this.observations.clear();
    this.featureSnapshots.clear();
    this.decisions.clear();
    this.auditEvents.clear();
    this.accessLogs.clear();
    this.users.clear();
    this.teams.clear();
    this.branches.clear();
    this.policies.clear();
    this.models.clear();
    this.reasonCodes.clear();
    this.retentionPolicies.clear();
    this.purgeLogs.clear();
    this.permissions.clear();
    this.limits.clear();
    this.featureFlags.clear();
    this.integrations.clear();
    this.connectorHealth.clear();
    this.alerts.clear();
    this.reconciliation.clear();
    this.slaMetrics.clear();
    this.initialize();
  }
}

export const mockDataStore = new MockDataStore();
