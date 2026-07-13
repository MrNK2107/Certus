import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  SourceType, SourceLinkStatus, FetchStatus,
  SourceConnection, SourceFetch, AuditActionType,
} from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { caseStore } from '../cases/case-store';
import { auditStore } from '../audit/audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/', wrapAsync(async (_req: Request, res: Response) => {
  const sourceTypes = Object.values(SourceType).map(st => ({
    type: st,
    label: st,
    priority: [SourceType.AA, SourceType.GST, SourceType.BUREAU].includes(st) ? 'CORE' : 'SUPPORTING',
  }));
  res.json(sourceTypes);
}));

router.get('/connections', wrapAsync(async (req: Request, res: Response) => {
  const caseId = req.query.caseId as string;
  let connections: SourceConnection[];
  if (caseId) {
    connections = Array.from(mockDataStore.sourceConnections.values())
      .filter(c => c.caseId === caseId);
  } else {
    connections = Array.from(mockDataStore.sourceConnections.values());
  }
  res.json(connections);
}));

router.get('/connections/:sourceLinkId', wrapAsync(async (req: Request, res: Response) => {
  const conn = mockDataStore.sourceConnections.get(req.params.sourceLinkId);
  if (!conn) throw new AppError(404, 'CONNECTION_NOT_FOUND', 'Source connection not found');
  res.json(conn);
}));

router.post('/connections', wrapAsync(async (req: Request, res: Response) => {
  const { caseId, sourceType } = req.body as { caseId: string; sourceType: SourceType };
  if (!caseId || !sourceType) {
    throw new AppError(400, 'VALIDATION_ERROR', 'caseId and sourceType are required');
  }
  if (!caseStore.findById(caseId)) {
    throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found');
  }

  const now = new Date().toISOString();
  const connection: SourceConnection = {
    sourceLinkId: `SL-${uuidv4().substring(0, 8)}`,
    caseId,
    sourceType,
    status: SourceLinkStatus.CONNECTING,
  };

  mockDataStore.sourceConnections.set(connection.sourceLinkId, connection);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.SOURCE_LINKED,
    objectType: 'SourceConnection',
    objectId: connection.sourceLinkId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: {},
  });

  res.status(201).json(connection);
}));

router.post('/connections/:sourceLinkId/unlink', wrapAsync(async (req: Request, res: Response) => {
  const conn = mockDataStore.sourceConnections.get(req.params.sourceLinkId);
  if (!conn) throw new AppError(404, 'CONNECTION_NOT_FOUND', 'Source connection not found');

  const now = new Date().toISOString();
  const updated: SourceConnection = { ...conn, status: SourceLinkStatus.REVOKED };
  mockDataStore.sourceConnections.set(req.params.sourceLinkId, updated);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: conn.caseId,
    actor: req.headers['x-user'] as string || 'System',
    action: AuditActionType.SOURCE_UNLINKED,
    objectType: 'SourceConnection',
    objectId: conn.sourceLinkId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: {},
  });

  res.json(updated);
}));

router.get('/fetches', wrapAsync(async (req: Request, res: Response) => {
  const caseId = req.query.caseId as string;
  let fetches: SourceFetch[];
  if (caseId) {
    fetches = Array.from(mockDataStore.sourceFetches.values())
      .filter(f => f.caseId === caseId);
  } else {
    fetches = Array.from(mockDataStore.sourceFetches.values());
  }
  res.json(fetches);
}));

router.post('/connections/:sourceLinkId/fetch', wrapAsync(async (req: Request, res: Response) => {
  const conn = mockDataStore.sourceConnections.get(req.params.sourceLinkId);
  if (!conn) throw new AppError(404, 'CONNECTION_NOT_FOUND', 'Source connection not found');

  const now = new Date().toISOString();
  const fetch: SourceFetch = {
    fetchId: `FETCH-${uuidv4().substring(0, 8)}`,
    caseId: conn.caseId,
    sourceType: conn.sourceType,
    status: FetchStatus.IN_PROGRESS,
    startedAt: now,
    retryCount: 0,
    payloadVersion: '1.0',
  };

  mockDataStore.sourceFetches.set(fetch.fetchId, fetch);

  auditStore.addEvent({
    auditEventId: `AUD-${uuidv4().substring(0, 8)}`,
    caseId: conn.caseId,
    actor: 'System',
    action: AuditActionType.DATA_FETCHED,
    objectType: 'SourceFetch',
    objectId: fetch.fetchId,
    timestamp: now,
    requestId: req.requestId,
    versionContext: {},
  });

  res.status(201).json(fetch);
}));

router.get('/:caseId/documents', wrapAsync(async (req: Request, res: Response) => {
  const docs = Array.from(mockDataStore.sourceDocuments.values())
    .filter(d => d.caseId === req.params.caseId);
  res.json(docs);
}));

router.get('/:caseId/payloads', wrapAsync(async (req: Request, res: Response) => {
  const payloads = Array.from(mockDataStore.sourcePayloads.values())
    .filter(p => p.caseId === req.params.caseId);
  res.json(payloads);
}));

export default router;
