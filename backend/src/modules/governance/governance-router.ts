import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuditActionType } from '@msme-credit/shared';
import { mockDataStore } from '../../data/mock-data';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/policies', wrapAsync(async (_req: Request, res: Response) => {
  const policies = Array.from(mockDataStore.policies.values());
  res.json(policies);
}));

router.get('/policies/:policyId', wrapAsync(async (req: Request, res: Response) => {
  const policy = mockDataStore.policies.get(req.params.policyId);
  if (!policy) throw new AppError(404, 'POLICY_NOT_FOUND', 'Policy not found');
  res.json(policy);
}));

router.post('/policies', wrapAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const now = new Date().toISOString();
  const policy = {
    policyId: `POL-${uuidv4().substring(0, 8)}`,
    name: body.name,
    description: body.description || '',
    version: 1,
    active: body.active !== undefined ? body.active : true,
    rules: body.rules || [],
    createdAt: now,
    updatedAt: now,
    createdBy: req.headers['x-user'] as string || 'System',
  };
  mockDataStore.policies.set(policy.policyId, policy);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.POLICY_CREATED,
    objectType: 'Policy',
    objectId: policy.policyId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: {},
  });

  res.status(201).json(policy);
}));

router.patch('/policies/:policyId', wrapAsync(async (req: Request, res: Response) => {
  const existing = mockDataStore.policies.get(req.params.policyId);
  if (!existing) throw new AppError(404, 'POLICY_NOT_FOUND', 'Policy not found');

  const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
  mockDataStore.policies.set(req.params.policyId, updated);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.POLICY_UPDATED,
    objectType: 'Policy',
    objectId: req.params.policyId,
    timestamp: updated.updatedAt,
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(updated);
}));

router.get('/models', wrapAsync(async (_req: Request, res: Response) => {
  const models = Array.from(mockDataStore.models.values());
  res.json(models);
}));

router.post('/models/:versionId/promote', wrapAsync(async (req: Request, res: Response) => {
  const model = mockDataStore.models.get(req.params.versionId);
  if (!model) throw new AppError(404, 'MODEL_NOT_FOUND', 'Model version not found');

  const now = new Date().toISOString();
  for (const m of mockDataStore.models.values()) {
    m.active = false;
  }
  model.active = true;
  model.promotedAt = now;
  model.promotedBy = req.headers['x-user'] as string || 'System';
  mockDataStore.models.set(req.params.versionId, model);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.MODEL_PROMOTED,
    objectType: 'ModelVersion',
    objectId: req.params.versionId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: { modelVersion: model.version },
  });

  res.json(model);
}));

router.get('/reason-codes', wrapAsync(async (_req: Request, res: Response) => {
  const codes = Array.from(mockDataStore.reasonCodes.values()).filter(c => c.active);
  res.json(codes);
}));

router.get('/retention', wrapAsync(async (_req: Request, res: Response) => {
  const policies = Array.from(mockDataStore.retentionPolicies.values());
  res.json(policies);
}));

router.get('/feature-flags', wrapAsync(async (_req: Request, res: Response) => {
  const flags = Array.from(mockDataStore.featureFlags.values());
  res.json(flags);
}));

router.post('/feature-flags/:flagId/toggle', wrapAsync(async (req: Request, res: Response) => {
  const flag = mockDataStore.featureFlags.get(req.params.flagId);
  if (!flag) throw new AppError(404, 'FLAG_NOT_FOUND', 'Feature flag not found');

  flag.enabled = !flag.enabled;
  flag.updatedAt = new Date().toISOString();
  mockDataStore.featureFlags.set(req.params.flagId, flag);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.FEATURE_FLAG_TOGGLED,
    objectType: 'FeatureFlag',
    objectId: req.params.flagId,
    timestamp: flag.updatedAt,
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(flag);
}));

router.get('/integrations', wrapAsync(async (_req: Request, res: Response) => {
  const integrations = Array.from(mockDataStore.integrations.values());
  res.json(integrations);
}));

router.get('/limits', wrapAsync(async (_req: Request, res: Response) => {
  const limits = Array.from(mockDataStore.limits.values());
  res.json(limits);
}));

export default router;
