import {
  FHCResult, PillarScore, HealthBand, PillarName, SourceType,
  Case, CaseState, Anomaly
} from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { v4 as uuidv4 } from 'uuid';

function getHealthBand(score: number): HealthBand {
  if (score >= 70) return HealthBand.STRONG;
  if (score >= 50) return HealthBand.PROMISING_BUT_THIN;
  if (score >= 35) return HealthBand.NEEDS_REVIEW;
  return HealthBand.RISKY;
}

function computeOverallHealth(pillarScores: PillarScore[]): number {
  if (pillarScores.length === 0) return 0;
  const weighted = pillarScores.reduce((sum, p) => sum + p.score * (p.confidence / 100), 0);
  const totalWeight = pillarScores.reduce((sum, p) => sum + p.confidence / 100, 0);
  return totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
}

function computeConfidence(pillarScores: PillarScore[]): number {
  if (pillarScores.length === 0) return 0;
  const total = pillarScores.reduce((sum, p) => sum + p.confidence, 0);
  return Math.round(total / pillarScores.length);
}

function computeCompleteness(caseData: Case, pillarScores: PillarScore[]): number {
  const allSources = Object.values(SourceType);
  const coveredSources = new Set<SourceType>();
  for (const p of pillarScores) {
    for (const s of p.sourceCoverage) {
      coveredSources.add(s);
    }
  }
  const coverage = allSources.length > 0 ? (coveredSources.size / allSources.length) * 100 : 0;
  const pillarCount = pillarScores.length;
  const pillarFactor = (pillarCount / 6) * 100;
  return Math.round((coverage * 0.4 + pillarFactor * 0.6));
}

function determineStrengths(pillarScores: PillarScore[]): string[] {
  const strengths: string[] = [];
  for (const p of pillarScores) {
    if (p.score >= 65) {
      strengths.push(p.evidenceSummary);
    }
  }
  return strengths;
}

function determineRisks(pillarScores: PillarScore[]): string[] {
  const risks: string[] = [];
  for (const p of pillarScores) {
    if (p.score < 40) {
      risks.push(`Low ${p.pillarName.replace(/_/g, ' ').toLowerCase()} (${p.score}/100)`);
    }
  }
  if (risks.length === 0 && pillarScores.some(p => p.score < 50)) {
    return ['Multiple areas need attention'];
  }
  return risks;
}

function findMissingSources(pillarScores: PillarScore[]): SourceType[] {
  const covered = new Set<SourceType>();
  for (const p of pillarScores) {
    for (const s of p.sourceCoverage) {
      covered.add(s);
    }
  }
  return Object.values(SourceType).filter(s => !covered.has(s));
}

function detectAnomalies(_caseData: Case, pillarScores: PillarScore[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  for (const p of pillarScores) {
    if (p.reasonCodes.includes('source_revoked')) {
      anomalies.push({
        anomalyId: uuidv4(),
        type: 'CONSENT_REVOKED',
        severity: 'HIGH',
        description: `Source consent was revoked for ${p.pillarName.replace(/_/g, ' ').toLowerCase()}`,
        sourcesInvolved: p.sourceCoverage,
        reasonCode: 'source_revoked',
      });
    }
    if (p.reasonCodes.includes('gst_gap_detected')) {
      anomalies.push({
        anomalyId: uuidv4(),
        type: 'GST_GAP',
        severity: 'MEDIUM',
        description: 'GST filing gap detected',
        sourcesInvolved: [SourceType.GST],
        reasonCode: 'gst_gap_detected',
      });
    }
  }
  return anomalies;
}

export class ScoringService {
  getFHCResult(caseId: string): FHCResult | undefined {
    return mockDataStore.fhcResults.get(caseId);
  }

  getPillarScores(caseId: string): PillarScore[] {
    return mockDataStore.pillarScores.get(caseId) || [];
  }

  computeScore(caseId: string): FHCResult {
    const caseData = mockDataStore.cases.get(caseId);
    if (!caseData) {
      throw Object.assign(new Error('Case not found'), { statusCode: 404, code: 'CASE_NOT_FOUND' });
    }

    const existingPillarScores = mockDataStore.pillarScores.get(caseId);
    const pillarScores = existingPillarScores || this.computePillarScores(caseData);

    const overallHealth = computeOverallHealth(pillarScores);
    const confidence = computeConfidence(pillarScores);
    const completeness = computeCompleteness(caseData, pillarScores);
    const healthBand = getHealthBand(overallHealth);
    const strengths = determineStrengths(pillarScores);
    const risks = determineRisks(pillarScores);
    const missingSources = findMissingSources(pillarScores);
    const anomalies = detectAnomalies(caseData, pillarScores);

    const result: FHCResult = {
      fhcResultId: `FHC-${caseId}-${Date.now()}`,
      caseId,
      overallHealth,
      healthBand,
      confidence,
      completeness,
      pillarScores,
      strengths,
      risks,
      missingSources,
      anomalies,
      recommendation: overallHealth >= 70 ? 'Manual review with streamlined priority' :
                       overallHealth >= 50 ? 'Consider with enhanced monitoring' :
                       'Required manual review - multiple risk factors detected',
      modelVersion: caseData.modelVersion || '1.0.0',
      policyVersion: caseData.policyVersion || '1.2',
      createdAt: new Date().toISOString(),
      version: 1,
    };

    mockDataStore.fhcResults.set(caseId, result);
    mockDataStore.pillarScores.set(caseId, pillarScores);

    return result;
  }

  private computePillarScores(caseData: Case): PillarScore[] {
    const modelVersion = caseData.modelVersion || '1.0.0';
    const baseScore = 50;
    const baseConfidence = 50;

    const vintageBonus = Math.min((caseData.businessProfile?.vintage || 0) * 5, 20);
    const turnoverFactor = caseData.businessProfile?.turnoverBand ? 5 : 0;

    const pillarConfigs: Array<{ name: PillarName; adjustments: number[]; evidence: string; codes: string[]; sources: SourceType[] }> = [
      { name: PillarName.REVENUE_STABILITY, adjustments: [vintageBonus, turnoverFactor], evidence: 'Based on business vintage and turnover band', codes: vintageBonus > 10 ? ['stable_monthly_inflows'] : ['limited_data'], sources: [SourceType.AA, SourceType.GST] },
      { name: PillarName.CASH_FLOW_HEALTH, adjustments: [turnoverFactor], evidence: 'Based on business profile assessment', codes: ['positive_inflow_outflow_ratio'], sources: [SourceType.AA] },
      { name: PillarName.COMPLIANCE_DISCIPLINE, adjustments: [turnoverFactor], evidence: 'Based on registration and profile data', codes: ['gst_filings_regular'], sources: [SourceType.GST] },
      { name: PillarName.OPERATIONAL_MATURITY, adjustments: [vintageBonus], evidence: `${caseData.businessProfile?.vintage || 0} years in operation`, codes: ['established_vintage'], sources: [SourceType.REGISTRATION] },
      { name: PillarName.CREDIT_BEHAVIOR, adjustments: [0], evidence: 'No bureau data - default assessment', codes: ['limited_data'], sources: [SourceType.BUREAU] },
      { name: PillarName.DIGITAL_COMMERCIAL_ACTIVITY, adjustments: [0], evidence: 'No digital data available', codes: ['low_digital_footprint'], sources: [SourceType.UPI] },
    ];

    return pillarConfigs.map((cfg, idx) => ({
      pillarScoreId: `PS-${caseData.caseId}-${cfg.name.substring(0, 2)}-${Date.now()}`,
      caseId: caseData.caseId,
      pillarName: cfg.name,
      score: Math.min(Math.max(baseScore + cfg.adjustments.reduce((a, b) => a + b, 0) + idx * 3, 0), 100),
      confidence: Math.min(baseConfidence + cfg.adjustments.reduce((a, b) => a + b, 0), 100),
      evidenceSummary: cfg.evidence,
      reasonCodes: cfg.codes,
      sourceCoverage: cfg.sources,
      modelVersion,
    }));
  }
}

export const scoringService = new ScoringService();
