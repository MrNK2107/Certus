import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User, AuditActionType } from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/users', wrapAsync(async (req: Request, res: Response) => {
  const role = req.query.role as string;
  const status = req.query.status as string;

  let users = Array.from(mockDataStore.users.values());
  if (role) users = users.filter(u => u.role === role);
  if (status) users = users.filter(u => u.status === status);
  res.json(users);
}));

router.get('/users/:userId', wrapAsync(async (req: Request, res: Response) => {
  const user = mockDataStore.users.get(req.params.userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  res.json(user);
}));

router.post('/users', wrapAsync(async (req: Request, res: Response) => {
  const body = req.body as Partial<User>;
  if (!body.name || !body.email || !body.role) {
    throw new AppError(400, 'VALIDATION_ERROR', 'name, email, and role are required');
  }

  const now = new Date().toISOString();
  const user: User = {
    userId: `USR-${uuidv4().substring(0, 8)}`,
    name: body.name,
    email: body.email,
    role: body.role,
    team: body.team,
    branch: body.branch,
    status: 'ACTIVE',
    createdAt: now,
  };

  mockDataStore.users.set(user.userId, user);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.USER_CREATED,
    objectType: 'User',
    objectId: user.userId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: {},
  });

  res.status(201).json(user);
}));

router.patch('/users/:userId', wrapAsync(async (req: Request, res: Response) => {
  const existing = mockDataStore.users.get(req.params.userId);
  if (!existing) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

  const updated = { ...existing, ...req.body };
  mockDataStore.users.set(req.params.userId, updated);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.USER_UPDATED,
    objectType: 'User',
    objectId: req.params.userId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(updated);
}));

router.post('/users/:userId/deactivate', wrapAsync(async (req: Request, res: Response) => {
  const user = mockDataStore.users.get(req.params.userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

  user.status = 'INACTIVE';
  mockDataStore.users.set(req.params.userId, user);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.USER_DEACTIVATED,
    objectType: 'User',
    objectId: req.params.userId,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(user);
}));

router.get('/roles', wrapAsync(async (_req: Request, res: Response) => {
  const permissions = Array.from(mockDataStore.permissions.values());
  res.json(permissions);
}));

router.get('/branches', wrapAsync(async (_req: Request, res: Response) => {
  const branches = Array.from(mockDataStore.branches.values());
  res.json(branches);
}));

router.get('/teams', wrapAsync(async (req: Request, res: Response) => {
  const branchId = req.query.branchId as string;
  let teams = Array.from(mockDataStore.teams.values());
  if (branchId) teams = teams.filter(t => t.branchId === branchId);
  res.json(teams);
}));

router.get('/settings', wrapAsync(async (_req: Request, res: Response) => {
  res.json(mockDataStore.platformSettings);
}));

router.patch('/settings', wrapAsync(async (req: Request, res: Response) => {
  mockDataStore.platformSettings = { ...mockDataStore.platformSettings, ...req.body };

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.SETTINGS_CHANGED,
    objectType: 'PlatformSettings',
    objectId: 'platform-settings',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(mockDataStore.platformSettings);
}));

export default router;
