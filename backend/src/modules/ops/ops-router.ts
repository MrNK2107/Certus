import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AlertStatus } from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { wrapAsync, AppError } from '../../middleware';

const router = Router();

router.get('/health', wrapAsync(async (_req: Request, res: Response) => {
  res.json(mockDataStore.platformHealth);
}));

router.get('/connectors', wrapAsync(async (_req: Request, res: Response) => {
  const connectors = Array.from(mockDataStore.connectorHealth.values());
  res.json(connectors);
}));

router.get('/connectors/:sourceType', wrapAsync(async (req: Request, res: Response) => {
  const connector = mockDataStore.connectorHealth.get(req.params.sourceType);
  if (!connector) throw new AppError(404, 'CONNECTOR_NOT_FOUND', 'Connector not found');
  res.json(connector);
}));

router.get('/alerts', wrapAsync(async (req: Request, res: Response) => {
  const severity = req.query.severity as string;
  const status = req.query.status as string;

  let alerts = Array.from(mockDataStore.alerts.values());
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  if (status) alerts = alerts.filter(a => a.status === status);

  alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  res.json(alerts);
}));

router.get('/alerts/:alertId', wrapAsync(async (req: Request, res: Response) => {
  const alert = mockDataStore.alerts.get(req.params.alertId);
  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alert not found');
  res.json(alert);
}));

router.post('/alerts/:alertId/acknowledge', wrapAsync(async (req: Request, res: Response) => {
  const alert = mockDataStore.alerts.get(req.params.alertId);
  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alert not found');

  const now = new Date().toISOString();
  alert.status = AlertStatus.ACKNOWLEDGED;
  alert.acknowledgedBy = req.headers['x-user'] as string || 'System';
  alert.acknowledgedAt = now;
  mockDataStore.alerts.set(req.params.alertId, alert);

  res.json(alert);
}));

router.post('/alerts/:alertId/resolve', wrapAsync(async (req: Request, res: Response) => {
  const alert = mockDataStore.alerts.get(req.params.alertId);
  if (!alert) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alert not found');

  const now = new Date().toISOString();
  alert.status = AlertStatus.RESOLVED;
  alert.resolvedBy = req.headers['x-user'] as string || 'System';
  alert.resolvedAt = now;
  mockDataStore.alerts.set(req.params.alertId, alert);

  res.json(alert);
}));

router.get('/sla', wrapAsync(async (_req: Request, res: Response) => {
  const metrics = Array.from(mockDataStore.slaMetrics.values());
  res.json(metrics);
}));

export default router;
