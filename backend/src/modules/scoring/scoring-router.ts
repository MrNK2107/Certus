import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuditActionType, PillarName } from '../../shared';
import { scoringService } from './scoring-service';
import { caseStore } from '../cases/case-store';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/:caseId/fhc', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  let fhc = scoringService.getFHCResult(req.params.caseId);
  if (!fhc) {
    fhc = scoringService.computeScore(req.params.caseId);
  }
  res.json(fhc);
}));

router.get('/:caseId/pillars', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  let pillars = scoringService.getPillarScores(req.params.caseId);
  if (pillars.length === 0) {
    scoringService.computeScore(req.params.caseId);
    pillars = scoringService.getPillarScores(req.params.caseId);
  }
  res.json(pillars);
}));

router.post('/:caseId/compute', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const fhc = scoringService.computeScore(req.params.caseId);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: req.params.caseId,
    actor: 'System',
    action: AuditActionType.SCORING_COMPLETED,
    objectType: 'FHCResult',
    objectId: fhc.fhcResultId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    versionContext: { modelVersion: fhc.modelVersion, policyVersion: fhc.policyVersion },
  });

  res.json(fhc);
}));

router.get('/:caseId/explanations', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  let fhc = scoringService.getFHCResult(req.params.caseId);
  if (!fhc) {
    fhc = scoringService.computeScore(req.params.caseId);
  }

  const explanations = fhc.pillarScores.map(p => ({
    pillarName: p.pillarName,
    score: p.score,
    confidence: p.confidence,
    evidenceSummary: p.evidenceSummary,
    reasonCodes: p.reasonCodes,
    sourceCoverage: p.sourceCoverage,
    scoreInterpretation: p.score >= 70 ? 'Strong' : p.score >= 50 ? 'Moderate' : 'Weak',
  }));

  res.json({
    overallHealth: fhc.overallHealth,
    healthBand: fhc.healthBand,
    confidence: fhc.confidence,
    completeness: fhc.completeness,
    strengths: fhc.strengths,
    risks: fhc.risks,
    missingSources: fhc.missingSources,
    anomalies: fhc.anomalies,
    recommendation: fhc.recommendation,
    pillarExplanations: explanations,
  });
}));

export default router;
