import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DecisionRequest, OverrideRequest, AuditActionType, CaseState } from '@msme-credit/shared';
import { decisionStore } from './decision-store';
import { caseStore } from '../cases/case-store';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const decision = decisionStore.findByCase(req.params.caseId);
  if (!decision) throw new AppError(404, 'DECISION_NOT_FOUND', 'No decision found for this case');
  res.json(decision);
}));

router.get('/:caseId/history', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const decisions = decisionStore.findAllByCase(req.params.caseId);
  res.json(decisions);
}));

router.post('/:caseId', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const body = req.body as DecisionRequest;
  if (!body.decisionType) {
    throw new AppError(400, 'VALIDATION_ERROR', 'decisionType is required');
  }

  const decisionBy = req.headers['x-user'] as string || 'System';
  const decision = decisionStore.create(req.params.caseId, {
    ...body,
    decisionReason: body.decisionReason || ''
  }, decisionBy);

  // Transition the case state to DECISIONED
  caseStore.update(req.params.caseId, { status: CaseState.DECISIONED });

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: req.params.caseId,
    actor: decisionBy,
    action: AuditActionType.DECISION_MADE,
    objectType: 'DecisionRecord',
    objectId: decision.decisionId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    afterState: { decisionType: decision.decisionType },
    versionContext: { policyVersion: decision.policyVersion },
  });

  res.status(201).json(decision);
}));

router.post('/:caseId/override', wrapAsync(async (req: Request, res: Response) => {
  const caseData = caseStore.findById(req.params.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const body = req.body as OverrideRequest;
  if (!body.decisionType || !body.overrideReason || !body.policyReference) {
    throw new AppError(400, 'VALIDATION_ERROR', 'decisionType, overrideReason, and policyReference are required');
  }

  const decisionBy = req.headers['x-user'] as string || 'System';
  const decision = decisionStore.override(req.params.caseId, body, decisionBy);

  // Transition the case state to DECISIONED
  caseStore.update(req.params.caseId, { status: CaseState.DECISIONED });

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: req.params.caseId,
    actor: decisionBy,
    action: AuditActionType.DECISION_OVERRIDDEN,
    objectType: 'DecisionRecord',
    objectId: decision.decisionId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    beforeState: { decisionId: decision.overriddenFrom },
    afterState: { decisionType: decision.decisionType },
    versionContext: { policyVersion: decision.policyVersion },
  });

  res.json(decision);
}));

export default router;
