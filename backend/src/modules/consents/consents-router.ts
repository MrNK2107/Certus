import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConsentArtifact, ConsentStatus, AuditActionType } from '../../shared';
import { consentStore } from './consent-store';
import { auditStore } from '../audit/audit-store';
import { caseStore } from '../cases/case-store';
import { mockDataStore } from '../../data/mock-data';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const caseId = req.query.caseId as string;
  let consents: ConsentArtifact[];
  if (caseId) {
    const caseData = caseStore.findById(caseId);
    if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');
    consents = consentStore.findByCase(caseId);
  } else {
    consents = Array.from(mockDataStore.consents.values());
  }
  res.json(consents);
}));

router.get('/:consentId', wrapAsync(async (req: Request, res: Response) => {
  const consent = consentStore.findById(req.params.consentId);
  if (!consent) throw new AppError(404, 'CONSENT_NOT_FOUND', 'Consent not found');
  res.json(consent);
}));

router.post('/', wrapAsync(async (req: Request, res: Response) => {
  const body = req.body as Partial<ConsentArtifact>;
  if (!body.caseId || !body.sourceType) {
    throw new AppError(400, 'VALIDATION_ERROR', 'caseId and sourceType are required');
  }
  const caseData = caseStore.findById(body.caseId);
  if (!caseData) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');

  const now = new Date().toISOString();
  const consent: ConsentArtifact = {
    consentId: `CON-${uuidv4().substring(0, 8)}`,
    caseId: body.caseId,
    sourceType: body.sourceType,
    status: ConsentStatus.PENDING,
    purposeCode: body.purposeCode || 'FHC_ASSESSMENT',
    scope: body.scope || 'Standard data access',
    createdAt: now,
    expiresAt: body.expiresAt,
    version: 1,
  };

  const created = consentStore.create(consent);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: created.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.CONSENT_GRANTED,
    objectType: 'ConsentArtifact',
    objectId: created.consentId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: { consentVersion: 1 },
  });

  res.status(201).json(created);
}));

router.post('/:consentId/revoke', wrapAsync(async (req: Request, res: Response) => {
  const updated = consentStore.revoke(req.params.consentId);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: updated.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.CONSENT_REVOKED,
    objectType: 'ConsentArtifact',
    objectId: updated.consentId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    beforeState: { status: ConsentStatus.ACTIVE },
    afterState: { status: ConsentStatus.REVOKED },
    versionContext: { consentVersion: updated.version },
  });

  res.json(updated);
}));

router.post('/:consentId/amend', wrapAsync(async (req: Request, res: Response) => {
  const body = req.body as Partial<ConsentArtifact>;
  const amended = consentStore.amend(req.params.consentId, body);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: amended.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.CONSENT_AMENDED,
    objectType: 'ConsentArtifact',
    objectId: amended.consentId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    versionContext: { consentVersion: amended.version },
  });

  res.json(amended);
}));

export default router;
