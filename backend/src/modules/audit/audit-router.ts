import { Router, Request, Response } from 'express';
import { AuditActionType } from '../../shared';
import { auditStore } from './audit-store';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/events', wrapAsync(async (req: Request, res: Response) => {
  const caseId = req.query.caseId as string;
  const action = req.query.action as string;
  const actor = req.query.actor as string;
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;

  let events = auditStore.findAll();

  if (caseId) {
    events = events.filter(e => e.caseId === caseId);
  }
  if (action) {
    events = events.filter(e => e.action === action);
  }
  if (actor) {
    events = events.filter(e => e.actor === actor);
  }
  if (dateFrom) {
    events = events.filter(e => e.timestamp >= dateFrom);
  }
  if (dateTo) {
    events = events.filter(e => e.timestamp <= dateTo);
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 50;
  const start = (page - 1) * pageSize;
  const paginated = events.slice(start, start + pageSize);

  res.json({
    data: paginated,
    meta: { total: events.length, page, pageSize, totalPages: Math.ceil(events.length / pageSize) },
  });
}));

router.get('/events/:eventId', wrapAsync(async (req: Request, res: Response) => {
  const event = auditStore.findById(req.params.eventId);
  if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Audit event not found');
  res.json(event);
}));

router.get('/access-logs', wrapAsync(async (req: Request, res: Response) => {
  const caseId = req.query.caseId as string;
  const logs = auditStore.getAccessLogs(caseId);
  res.json(logs);
}));

export default router;
