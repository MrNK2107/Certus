import {
  Case, CaseState, EntityType, SectorType,
  ConsentArtifact, ConsentStatus, SourceType,
  SourceConnection, SourceLinkStatus, SourceFetch, FetchStatus, SourceDocument, SourcePayload,
  FHCResult, PillarScore, HealthBand, PillarName, NormalizedObservation, Anomaly,
  DecisionRecord, DecisionType,
  AuditEvent, AuditActionType,
} from '../shared';
import { MockDataStore } from './mock-data';

const T = (daysOffset = 0) => {
  const date = new Date('2026-05-01T10:30:00Z');
  date.setDate(date.getDate() - daysOffset);
  return date.toISOString();
};

const hashStringToNumber = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export function loadSeedData(store: MockDataStore): void {
  // We do NOT clear the store here so that the default CASE-FULL-001 etc.
  // initialized in MockDataStore's constructor are preserved for tests.

  // 10 mockup cases
  interface SeedCaseConfig {
    caseId: string;
    businessName: string;
    sector: SectorType;
    entityType: EntityType;
    vintage: number;
    turnoverBand: string;
    location: string;
    status: CaseState;
    submittedOn: string;
    healthScore?: number;
    healthBand?: HealthBand;
    pan: string;
    gstin: string;
    udyam: string;
    decision?: DecisionType;
  }

  const caseConfigs: SeedCaseConfig[] = [
    {
      caseId: 'CUST000123',
      businessName: 'Savera Enterprises',
      sector: SectorType.SERVICES,
      entityType: EntityType.SOLE_PROPRIETORSHIP,
      vintage: 3.66, // 3 years 8 months
      turnoverBand: '1-5 Cr',
      location: 'Pune, Maharashtra',
      status: CaseState.UNDER_REVIEW, // "Pending Review"
      submittedOn: T(0),
      pan: 'AABCS1234K',
      gstin: '27AABCS1234K1ZP',
      udyam: 'UDYAM-MH-27-0001234',
    },
    {
      caseId: 'CUST000124',
      businessName: 'Shakti Electricals',
      sector: SectorType.MANUFACTURING,
      entityType: EntityType.PARTNERSHIP,
      vintage: 5.2,
      turnoverBand: '1-5 Cr',
      location: 'Mumbai, Maharashtra',
      status: CaseState.UNDER_REVIEW, // "Pending Review"
      submittedOn: T(0),
      pan: 'AABCS5678X',
      gstin: '27AABCS5678X1ZP',
      udyam: 'UDYAM-MH-27-0005678',
    },
    {
      caseId: 'CUST000125',
      businessName: 'Greenfield Traders',
      sector: SectorType.TRADER,
      entityType: EntityType.SOLE_PROPRIETORSHIP,
      vintage: 2.5,
      turnoverBand: '25L-1Cr',
      location: 'Nagpur, Maharashtra',
      status: CaseState.DATA_FETCHING, // "In Progress"
      submittedOn: T(0),
      pan: 'AABCS9012Y',
      gstin: '27AABCS9012Y1ZP',
      udyam: 'UDYAM-MH-27-0009012',
    },
    {
      caseId: 'CUST000126',
      businessName: 'Maha Construction',
      sector: SectorType.CONSTRUCTION,
      entityType: EntityType.PRIVATE_LIMITED,
      vintage: 8.5,
      turnoverBand: '5-10 Cr',
      location: 'Mumbai, Maharashtra',
      status: CaseState.DECISIONED, // "Completed"
      submittedOn: T(3),
      healthScore: 78,
      healthBand: HealthBand.STRONG,
      pan: 'AAACA1234A',
      gstin: '27AAACA1234A1Z5',
      udyam: 'UDYAM-MH-27-0001111',
      decision: DecisionType.APPROVE,
    },
    {
      caseId: 'CUST000127',
      businessName: 'Om Minerals',
      sector: SectorType.OTHER,
      entityType: EntityType.LLP,
      vintage: 6.0,
      turnoverBand: '1-5 Cr',
      location: 'Nashik, Maharashtra',
      status: CaseState.SCORED, // "Completed" (without final decision recorded yet)
      submittedOn: T(3),
      healthScore: 65,
      healthBand: HealthBand.NEEDS_REVIEW,
      pan: 'BBBBB5678B',
      gstin: '27BBBBB5678B1ZP',
      udyam: 'UDYAM-MH-27-0002222',
    },
    {
      caseId: 'CUST000128',
      businessName: 'Rudra Logistics',
      sector: SectorType.LOGISTICS,
      entityType: EntityType.PRIVATE_LIMITED,
      vintage: 4.8,
      turnoverBand: '5-10 Cr',
      location: 'Thane, Maharashtra',
      status: CaseState.DECISIONED, // "Completed"
      submittedOn: T(3),
      healthScore: 82,
      healthBand: HealthBand.STRONG,
      pan: 'CCCCC9012C',
      gstin: '27CCCCC9012C1ZP',
      udyam: 'UDYAM-MH-27-0003333',
      decision: DecisionType.APPROVE,
    },
    {
      caseId: 'CUST000129',
      businessName: 'Manorama Foods',
      sector: SectorType.RESTAURANT,
      entityType: EntityType.SOLE_PROPRIETORSHIP,
      vintage: 3.0,
      turnoverBand: '25L-1Cr',
      location: 'Kolhapur, Maharashtra',
      status: CaseState.CONSENT_PENDING, // "Requires Action"
      submittedOn: T(6),
      pan: 'DDDDD3456D',
      gstin: '27DDDDD3456D1ZP',
      udyam: 'UDYAM-MH-27-0004444',
    },
    {
      caseId: 'CUST000130',
      businessName: 'TechSolve India',
      sector: SectorType.IT,
      entityType: EntityType.PRIVATE_LIMITED,
      vintage: 2.1,
      turnoverBand: '1-5 Cr',
      location: 'Mumbai, Maharashtra',
      status: CaseState.UNDER_REVIEW, // "Pending Review"
      submittedOn: T(6),
      pan: 'EEEEE7890E',
      gstin: '27EEEEE7890E1ZP',
      udyam: 'UDYAM-MH-27-0005555',
    },
    {
      caseId: 'CUST000131',
      businessName: 'Sri Balaji Textiles',
      sector: SectorType.MANUFACTURING,
      entityType: EntityType.PARTNERSHIP,
      vintage: 7.2,
      turnoverBand: '5-10 Cr',
      location: 'Solapur, Maharashtra',
      status: CaseState.SCORED, // "Completed" (without final decision recorded yet)
      submittedOn: T(6),
      healthScore: 71,
      healthBand: HealthBand.STRONG,
      pan: 'FFFFF1234F',
      gstin: '27FFFFF1234F1ZP',
      udyam: 'UDYAM-MH-27-0006666',
    },
    {
      caseId: 'CUST000132',
      businessName: 'Oceanic Exports',
      sector: SectorType.OTHER,
      entityType: EntityType.LLP,
      vintage: 4.0,
      turnoverBand: '5-10 Cr',
      location: 'Mumbai, Maharashtra',
      status: CaseState.FAILED, // "Failed"
      submittedOn: T(11),
      pan: 'GGGGG5678G',
      gstin: '27GGGGG5678G1ZP',
      udyam: 'UDYAM-MH-27-0007777',
    },
    {
      caseId: 'CUST000133',
      businessName: 'Maha Supermart',
      sector: SectorType.RETAIL,
      entityType: EntityType.PRIVATE_LIMITED,
      vintage: 6.0,
      turnoverBand: '1-5 Cr',
      location: 'Pune, Maharashtra',
      status: CaseState.SCORED,
      submittedOn: T(4),
      healthScore: 82,
      healthBand: HealthBand.STRONG,
      pan: 'HHHHH1234H',
      gstin: '27HHHHH1234H1ZP',
      udyam: 'UDYAM-MH-27-0008888',
    },
    {
      caseId: 'CUST000134',
      businessName: 'Apex Logistics',
      sector: SectorType.LOGISTICS,
      entityType: EntityType.LLP,
      vintage: 4.5,
      turnoverBand: '25L-1Cr',
      location: 'Thane, Maharashtra',
      status: CaseState.UNDER_REVIEW,
      submittedOn: T(2),
      pan: 'IIIII5678I',
      gstin: '27IIIII5678I1ZP',
      udyam: 'UDYAM-MH-27-0009999',
    },
    {
      caseId: 'CUST000135',
      businessName: 'Sunshine Bakery',
      sector: SectorType.RESTAURANT,
      entityType: EntityType.SOLE_PROPRIETORSHIP,
      vintage: 2.1,
      turnoverBand: '<25L',
      location: 'Delhi',
      status: CaseState.CONSENT_PENDING,
      submittedOn: T(1),
      pan: 'JJJJJ9012J',
      gstin: '27JJJJJ9012J1ZP',
      udyam: 'UDYAM-MH-27-0000000',
    },
    {
      caseId: 'CUST000136',
      businessName: 'Vardhaman Steel',
      sector: SectorType.MANUFACTURING,
      entityType: EntityType.PRIVATE_LIMITED,
      vintage: 10.0,
      turnoverBand: '5-10 Cr',
      location: 'Nagpur, Maharashtra',
      status: CaseState.SCORED,
      submittedOn: T(5),
      healthScore: 88,
      healthBand: HealthBand.STRONG,
      pan: 'KKKKK1234K',
      gstin: '27KKKKK1234K1ZP',
      udyam: 'UDYAM-MH-27-0001212',
    },
    {
      caseId: 'CUST000137',
      businessName: 'Blue Ocean Tech',
      sector: SectorType.SERVICES,
      entityType: EntityType.LLP,
      vintage: 3.2,
      turnoverBand: '1-5 Cr',
      location: 'Mumbai, Maharashtra',
      status: CaseState.FAILED,
      submittedOn: T(8),
      pan: 'LLLLL5678L',
      gstin: '27LLLLL5678L1ZP',
      udyam: 'UDYAM-MH-27-0003434',
    },
  ];

  // Helper for generating audit timeline events
  const generateAuditEvents = (caseId: string, status: CaseState, submittedOn: string) => {
    const events: AuditEvent[] = [];
    const baseTime = new Date(submittedOn);
    
    events.push({
      auditEventId: `AUD-${caseId}-1`,
      caseId,
      actor: 'System',
      action: AuditActionType.CASE_CREATED,
      objectType: 'Case',
      objectId: caseId,
      timestamp: baseTime.toISOString(),
      requestId: `req-${caseId}-1`,
      versionContext: { modelVersion: '2.3.0', policyVersion: '1.2' }
    });

    if (status !== CaseState.CONSENT_PENDING) {
      baseTime.setMinutes(baseTime.getMinutes() + 10);
      events.push({
        auditEventId: `AUD-${caseId}-2`,
        caseId,
        actor: 'Applicant',
        action: AuditActionType.CONSENT_GRANTED,
        objectType: 'ConsentArtifact',
        objectId: `CON-${caseId}-AA`,
        timestamp: baseTime.toISOString(),
        requestId: `req-${caseId}-2`,
        beforeState: { status: ConsentStatus.PENDING },
        afterState: { status: ConsentStatus.ACTIVE },
        versionContext: {}
      });

      baseTime.setMinutes(baseTime.getMinutes() + 5);
      events.push({
        auditEventId: `AUD-${caseId}-3`,
        caseId,
        actor: 'System',
        action: AuditActionType.SOURCE_LINKED,
        objectType: 'SourceConnection',
        objectId: `SL-${caseId}-AA`,
        timestamp: baseTime.toISOString(),
        requestId: `req-${caseId}-3`,
        versionContext: {}
      });
    }

    if (status === CaseState.SCORED || status === CaseState.DECISIONED || status === CaseState.UNDER_REVIEW) {
      baseTime.setMinutes(baseTime.getMinutes() + 15);
      events.push({
        auditEventId: `AUD-${caseId}-4`,
        caseId,
        actor: 'System',
        action: AuditActionType.DATA_FETCHED,
        objectType: 'SourcePayload',
        objectId: `PL-${caseId}-AA`,
        timestamp: baseTime.toISOString(),
        requestId: `req-${caseId}-4`,
        versionContext: {}
      });
    }

    if (status === CaseState.SCORED || status === CaseState.DECISIONED) {
      baseTime.setMinutes(baseTime.getMinutes() + 10);
      events.push({
        auditEventId: `AUD-${caseId}-5`,
        caseId,
        actor: 'System',
        action: AuditActionType.SCORING_COMPLETED,
        objectType: 'FHCResult',
        objectId: `FH-${caseId}`,
        timestamp: baseTime.toISOString(),
        requestId: `req-${caseId}-5`,
        versionContext: { modelVersion: '2.3.0', policyVersion: '1.2' }
      });
    }

    return events;
  };

  // Seed cases
  for (const config of caseConfigs) {
    const caseObj: Case = {
      caseId: config.caseId,
      applicantId: `APP-${config.caseId.slice(4)}`,
      businessName: config.businessName,
      sector: config.sector,
      status: config.status,
      createdAt: config.submittedOn,
      updatedAt: T(0),
      ownerTeam: 'Mumbai Underwriting',
      ownerUser: 'risk-manager@idbi.com',
      modelVersion: '2.3.0',
      policyVersion: '1.2',
      businessProfile: {
        businessName: config.businessName,
        pan: config.pan,
        gstin: config.gstin,
        udyam: config.udyam,
        entityType: config.entityType,
        sector: config.sector,
        vintage: config.vintage,
        turnoverBand: config.turnoverBand,
        location: config.location,
        relationshipContext: 'New applicant seeking term loan for capital expansion.'
      }
    };
    store.cases.set(config.caseId, caseObj);

    // Consents
    const sourcesToSeed = [SourceType.AA, SourceType.GST, SourceType.BUREAU, SourceType.UPI, SourceType.UTILITY, SourceType.EPFO];
    for (const st of sourcesToSeed) {
      const consentId = `CON-${config.caseId}-${st}`;
      const hasEPFO = st === SourceType.EPFO;
      store.consents.set(consentId, {
        consentId,
        caseId: config.caseId,
        sourceType: st,
        status: config.status === CaseState.CONSENT_PENDING ? ConsentStatus.PENDING : (hasEPFO ? ConsentStatus.REVOKED : ConsentStatus.ACTIVE),
        purposeCode: 'FHC_ASSESSMENT',
        scope: `Read-only access to ${st} records`,
        createdAt: T(1),
        expiresAt: T(-90),
        version: 1
      });

      // Connections
      const linkId = `SL-${config.caseId}-${st}`;
      store.sourceConnections.set(linkId, {
        sourceLinkId: linkId,
        caseId: config.caseId,
        sourceType: st,
        status: config.status === CaseState.CONSENT_PENDING ? SourceLinkStatus.PENDING : (hasEPFO ? SourceLinkStatus.REVOKED : SourceLinkStatus.CONNECTED),
        lastSyncedAt: config.status === CaseState.CONSENT_PENDING ? undefined : T(0),
        freshness: 92,
        quality: 88
      });

      // Fetches
      const fetchId = `FT-${config.caseId}-${st}`;
      store.sourceFetches.set(fetchId, {
        fetchId,
        caseId: config.caseId,
        sourceType: st,
        status: config.status === CaseState.CONSENT_PENDING ? FetchStatus.PENDING : (config.status === CaseState.FAILED ? FetchStatus.FAILED : (hasEPFO ? FetchStatus.FAILED : FetchStatus.COMPLETED)),
        startedAt: T(0),
        completedAt: config.status === CaseState.CONSENT_PENDING || hasEPFO ? undefined : T(0),
        retryCount: hasEPFO ? 3 : 0,
        payloadVersion: '1.0'
      });
    }

    // Documents
    const documents = [
      { documentId: `DOC-${config.caseId}-1`, fileName: 'GST_Return_FY24Q4.pdf', sourceType: SourceType.GST, documentType: 'GST', uploadedAt: T(0), size: 1258291 },
      { documentId: `DOC-${config.caseId}-2`, fileName: 'GST_Return_FY24Q3.pdf', sourceType: SourceType.GST, documentType: 'GST', uploadedAt: T(0), size: 1153433 },
      { documentId: `DOC-${config.caseId}-3`, fileName: 'GST_Return_FY24Q2.pdf', sourceType: SourceType.GST, documentType: 'GST', uploadedAt: T(0), size: 1153433 },
      { documentId: `DOC-${config.caseId}-4`, fileName: 'Bank_Statement_Apr2025.pdf', sourceType: SourceType.AA, documentType: 'Bank Statement', uploadedAt: T(0), size: 2516582 },
      { documentId: `DOC-${config.caseId}-5`, fileName: 'Bank_Statement_Mar2025.pdf', sourceType: SourceType.AA, documentType: 'Bank Statement', uploadedAt: T(0), size: 2411724 },
    ];
    for (const doc of documents) {
      store.sourceDocuments.set(doc.documentId, {
        ...doc,
        caseId: config.caseId,
      });
    }

    // Source Payloads (Simulated structured data)
    store.sourcePayloads.set(`PL-${config.caseId}-GST`, {
      payloadId: `PL-${config.caseId}-GST`,
      caseId: config.caseId,
      sourceType: SourceType.GST,
      rawData: {
        gstStatus: 'ACTIVE',
        filingFrequency: 'MONTHLY',
        returnsFiled: 12,
        annualTurnover: 78600000,
        totalTaxPaid: 4860000,
        lateDaysAvg: 2,
        itcAvailment: 12400000
      },
      ingestedAt: T(0),
      payloadVersion: '1.0'
    });

    // Seed Pillar Scores and FHC Result if scored or decided
    if (config.healthScore || config.status === CaseState.UNDER_REVIEW || config.status === CaseState.SCORED || config.status === CaseState.DECISIONED) {
      const cHash = hashStringToNumber(config.caseId);
      const actualScore = config.healthScore || Math.round(60 + (cHash % 28));
      const computedBand = config.healthBand || (actualScore >= 75 ? HealthBand.STRONG : actualScore >= 60 ? HealthBand.NEEDS_REVIEW : HealthBand.RISKY);
      
      const pScores: PillarScore[] = [
        {
          pillarScoreId: `PS-${config.caseId}-ID`,
          caseId: config.caseId,
          pillarName: PillarName.REVENUE_STABILITY,
          score: Math.min(100, Math.round(actualScore + (cHash % 13) - 3)),
          confidence: Math.min(100, Math.round(88 + (cHash % 11))),
          evidenceSummary: 'All identity documents are valid and verified.',
          reasonCodes: ['established_vintage', 'gst_filings_regular'],
          sourceCoverage: [SourceType.REGISTRATION, SourceType.GST],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${config.caseId}-OP`,
          caseId: config.caseId,
          pillarName: PillarName.OPERATIONAL_MATURITY,
          score: Math.min(100, Math.round(actualScore + ((cHash >> 2) % 15) - 6)),
          confidence: Math.min(100, Math.round(85 + ((cHash >> 2) % 13))),
          evidenceSummary: 'Consistent business operations with stable delivery.',
          reasonCodes: ['established_vintage'],
          sourceCoverage: [SourceType.REGISTRATION],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${config.caseId}-CF`,
          caseId: config.caseId,
          pillarName: PillarName.CASH_FLOW_HEALTH,
          score: Math.min(100, Math.round(actualScore + ((cHash >> 4) % 11) - 5)),
          confidence: Math.min(100, Math.round(82 + ((cHash >> 4) % 15))),
          evidenceSummary: 'Positive monthly net cash flow with strong margins.',
          reasonCodes: ['low_overdraft_dependence', 'positive_inflow_outflow_ratio'],
          sourceCoverage: [SourceType.AA],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${config.caseId}-GP`,
          caseId: config.caseId,
          pillarName: PillarName.DIGITAL_COMMERCIAL_ACTIVITY,
          score: Math.min(100, Math.round(actualScore + ((cHash >> 6) % 15) - 8)),
          confidence: Math.min(100, Math.round(80 + ((cHash >> 6) % 17))),
          evidenceSummary: 'High customer growth rate and regional expansion.',
          reasonCodes: ['stable_monthly_inflows'],
          sourceCoverage: [SourceType.UPI],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${config.caseId}-CO`,
          caseId: config.caseId,
          pillarName: PillarName.COMPLIANCE_DISCIPLINE,
          score: Math.min(100, Math.round(actualScore + ((cHash >> 8) % 13) - 2)),
          confidence: Math.min(100, Math.round(90 + ((cHash >> 8) % 9))),
          evidenceSummary: 'Excellent compliance record with regular filing.',
          reasonCodes: ['gst_filings_regular'],
          sourceCoverage: [SourceType.GST],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${config.caseId}-RI`,
          caseId: config.caseId,
          pillarName: PillarName.CREDIT_BEHAVIOR,
          score: Math.min(100, Math.round(actualScore + ((cHash >> 10) % 17) - 9)),
          confidence: Math.min(100, Math.round(88 + ((cHash >> 10) % 11))),
          evidenceSummary: 'Moderate credit risk profile with minor delay in utility bills.',
          reasonCodes: ['good_repayment_history'],
          sourceCoverage: [SourceType.BUREAU],
          modelVersion: '2.3.0'
        }
      ];
      store.pillarScores.set(config.caseId, pScores);

      const fhcAnomalies: Anomaly[] = [];
      if (config.caseId === 'CUST000127') {
        fhcAnomalies.push({
          anomalyId: `ANOM-${config.caseId}-1`,
          type: 'GSTIN_MISMATCH',
          severity: 'MEDIUM',
          description: '2 invoices with mismatched GSTIN detected.',
          sourcesInvolved: [SourceType.GST],
          reasonCode: 'gst_gap_detected'
        });
      }

      store.fhcResults.set(config.caseId, {
        fhcResultId: `FHC-${config.caseId}`,
        caseId: config.caseId,
        overallHealth: actualScore,
        healthBand: computedBand,
        confidence: Math.min(100, Math.round(88 + (cHash % 9))),
        completeness: Math.min(100, Math.round(82 + (cHash % 13))),
        pillarScores: pScores,
        strengths: ['Steady monthly inflows', 'Excellent GST compliance', 'Moderate credit leverage'],
        risks: ['Workforce payroll data missing', 'Utility bills partial coverage'],
        missingSources: [SourceType.EPFO],
        anomalies: fhcAnomalies,
        recommendation: actualScore >= 75 ? 'Manual review with streamlined priority' : 'Refer for detailed manual inspection',
        modelVersion: '2.3.0',
        policyVersion: '1.2',
        createdAt: T(0),
        version: 1
      });
    }

    // Decisions
    if (config.decision) {
      store.decisions.set(`DEC-${config.caseId}`, {
        decisionId: `DEC-${config.caseId}`,
        caseId: config.caseId,
        decisionType: config.decision,
        decisionBy: 'risk-manager@idbi.com',
        decisionReason: 'Strong financial health across cash flow and GST compliance, with verified registrations.',
        createdAt: T(0),
        policyVersion: '1.2',
        fhcVersion: 1
      });
    }

    // Timeline audit events
    const timelineEvents = generateAuditEvents(config.caseId, config.status, config.submittedOn);
    for (const ev of timelineEvents) {
      store.auditEvents.set(ev.auditEventId, ev);
    }
  }

  // Seed additional diverse mock cases to generate enough audit events (>= 130) and show a rich, realistic queue
  const sectors = [SectorType.RETAIL, SectorType.MANUFACTURING, SectorType.SERVICES, SectorType.WHOLESALE];
  const statuses = [
    CaseState.UNDER_REVIEW, 
    CaseState.DATA_FETCHING, 
    CaseState.SCORED, 
    CaseState.DRAFT, 
    CaseState.FAILED,
    CaseState.DECISIONED
  ];
  const msmeNames = [
    'Vertex Manufacturing', 'Apna Bazaar', 'Krishna Textiles', 'Ganesh Traders',
    'Sai Logistics', 'Radhe Foods', 'Royal Electronics', 'Balaji Auto Parts',
    'Laxmi Garments', 'Maruti Metals', 'Om Sai Engineering', 'Shreeji Chemicals',
    'Balaji Agro', 'Jalaram Sweets', 'Star Enterprises', 'National Printers',
    'Pioneer Software', 'Nova Pharma', 'Prime Distributing', 'Shiva Ceramics',
    'Classic Footwear', 'Apex Diagnostics', 'Metropolitan Builders', 'Techno Instruments'
  ];

  for (let i = 133; i <= 155; i++) {
    const caseId = `CUST000${i}`;
    const idx = i - 133;
    const name = `${msmeNames[idx % msmeNames.length]} (${i})`;
    const sector = sectors[i % sectors.length];
    const status = statuses[i % statuses.length];
    const vintage = (i % 8) + 3;
    const actualScore = 45 + (i * 7) % 48; // varied score between 45 and 93
    const confidence = 82 + (i * 3) % 15; // varied confidence between 82 and 97

    const caseObj: Case = {
      caseId,
      applicantId: `APP-${i}`,
      businessName: name,
      sector,
      status,
      createdAt: T(10),
      updatedAt: T(0),
      ownerTeam: 'Mumbai Underwriting',
      ownerUser: 'underwriter@idbi.com',
      modelVersion: '2.3.0',
      policyVersion: '1.2',
      businessProfile: {
        businessName: name,
        pan: `AACPS${1000 + i}X`,
        entityType: EntityType.SOLE_PROPRIETORSHIP,
        sector,
        vintage,
      }
    };
    store.cases.set(caseId, caseObj);

    // Consents & Fetches
    for (const st of [SourceType.AA, SourceType.GST]) {
      const consentId = `CON-${caseId}-${st}`;
      store.consents.set(consentId, {
        consentId,
        caseId,
        sourceType: st,
        status: ConsentStatus.ACTIVE,
        purposeCode: 'FHC_ASSESSMENT',
        scope: `Read-only access`,
        createdAt: T(10),
        version: 1
      });
      const linkId = `SL-${caseId}-${st}`;
      store.sourceConnections.set(linkId, {
        sourceLinkId: linkId,
        caseId,
        sourceType: st,
        status: SourceLinkStatus.CONNECTED,
        lastSyncedAt: T(10)
      });
      const fetchId = `FT-${caseId}-${st}`;
      store.sourceFetches.set(fetchId, {
        fetchId,
        caseId,
        sourceType: st,
        status: FetchStatus.COMPLETED,
        startedAt: T(10),
        retryCount: 0,
        payloadVersion: '1.0'
      });
    }

    // Seed Pillar Scores and FHC Result if scored or decided
    if (status === CaseState.SCORED || status === CaseState.DECISIONED) {
      const pScores: PillarScore[] = [
        {
          pillarScoreId: `PS-${caseId}-RI`,
          caseId,
          pillarName: PillarName.CREDIT_BEHAVIOR, // Maps to Identity Strength
          score: Math.min(actualScore + 6, 100),
          confidence: Math.min(confidence + 2, 100),
          evidenceSummary: 'Clear bureau records and low default history.',
          reasonCodes: ['good_repayment_history'],
          sourceCoverage: [SourceType.BUREAU],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${caseId}-OP`,
          caseId,
          pillarName: PillarName.OPERATIONAL_MATURITY, // Maps to Operational Health
          score: Math.min(actualScore + 2, 100),
          confidence: confidence,
          evidenceSummary: `${vintage} years in active sector operation.`,
          reasonCodes: ['established_vintage'],
          sourceCoverage: [SourceType.REGISTRATION],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${caseId}-CF`,
          caseId,
          pillarName: PillarName.CASH_FLOW_HEALTH,
          score: Math.max(actualScore - 3, 0),
          confidence: Math.max(confidence - 2, 0),
          evidenceSummary: 'Average monthly inflow and low overdraft spikes.',
          reasonCodes: ['low_overdraft_dependence'],
          sourceCoverage: [SourceType.AA],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${caseId}-GP`,
          caseId,
          pillarName: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, // Maps to Growth Potential
          score: Math.max(actualScore - 6, 0),
          confidence: Math.max(confidence - 4, 0),
          evidenceSummary: 'Steady UPI transaction volumes verified.',
          reasonCodes: ['stable_monthly_inflows'],
          sourceCoverage: [SourceType.UPI],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${caseId}-CO`,
          caseId,
          pillarName: PillarName.COMPLIANCE_DISCIPLINE,
          score: Math.min(actualScore + 8, 100),
          confidence: Math.min(confidence + 1, 100),
          evidenceSummary: 'Regular tax payments and GST filings.',
          reasonCodes: ['gst_filings_regular'],
          sourceCoverage: [SourceType.GST],
          modelVersion: '2.3.0'
        },
        {
          pillarScoreId: `PS-${caseId}-ID`,
          caseId,
          pillarName: PillarName.REVENUE_STABILITY, // Maps to Risk Score
          score: Math.min(actualScore - 2, 100),
          confidence: Math.min(confidence - 1, 100),
          evidenceSummary: 'Revenue consistency with minor variance.',
          reasonCodes: ['stable_monthly_inflows'],
          sourceCoverage: [SourceType.GST],
          modelVersion: '2.3.0'
        }
      ];
      store.pillarScores.set(caseId, pScores);

      store.fhcResults.set(caseId, {
        fhcResultId: `FHC-${caseId}`,
        caseId,
        overallHealth: actualScore,
        healthBand: actualScore >= 70 ? HealthBand.STRONG : actualScore >= 50 ? HealthBand.PROMISING_BUT_THIN : HealthBand.NEEDS_REVIEW,
        confidence,
        completeness: 88,
        pillarScores: pScores,
        strengths: ['Consistent GST filing history', 'Steady digital transaction levels'],
        risks: ['Limited long-term credit history', 'EPFO records partially missing'],
        missingSources: [SourceType.EPFO],
        anomalies: [],
        recommendation: actualScore >= 70 ? 'Manual review with streamlined priority' : 'Refer for detailed manual inspection',
        modelVersion: '2.3.0',
        policyVersion: '1.2',
        createdAt: T(10),
        version: 1
      });

      if (status === CaseState.DECISIONED) {
        store.decisions.set(`DEC-${caseId}`, {
          decisionId: `DEC-${caseId}`,
          caseId,
          decisionType: actualScore >= 60 ? DecisionType.APPROVE : DecisionType.DECLINE,
          decisionBy: 'underwriter@idbi.com',
          decisionReason: actualScore >= 60 
            ? 'Meets core financial health guidelines with verified digital footprint.' 
            : 'Unsatisfactory overall health score combined with lack of credit depth.',
          createdAt: T(10),
          policyVersion: '1.2',
          fhcVersion: 1
        });
      }
    }

    const timelineEvents = generateAuditEvents(caseId, status, T(10));
    for (const ev of timelineEvents) {
      store.auditEvents.set(ev.auditEventId, ev);
    }
  }
}
