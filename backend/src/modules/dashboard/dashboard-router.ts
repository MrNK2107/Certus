import { Router, Request, Response } from 'express';
import { CaseState, DecisionType } from '../../shared';
import { mockDataStore } from '../../data/mock-data';
import { wrapAsync } from '../../middleware';

const router = Router();

router.get('/metrics', wrapAsync(async (_req: Request, res: Response) => {
  const cases = Array.from(mockDataStore.cases.values());
  const decisions = Array.from(mockDataStore.decisions.values());
  const auditEvents = Array.from(mockDataStore.auditEvents.values());
  const fhcResults = Array.from(mockDataStore.fhcResults.values());
  const alerts = Array.from(mockDataStore.alerts.values());
  const slaMetrics = Array.from(mockDataStore.slaMetrics.values());

  const totalCases = cases.length;
  const pendingCases = cases.filter(c =>
    c.status === CaseState.CONSENT_PENDING || c.status === CaseState.DRAFT
  ).length;
  const needsReview = cases.filter(c => {
    if (c.status !== CaseState.SCORED) return false;
    const fhc = fhcResults.find(f => f.caseId === c.caseId);
    return fhc && (fhc.healthBand === 'NEEDS_REVIEW' || fhc.healthBand === 'RISKY');
  }).length;
  const underReview = cases.filter(c => c.status === CaseState.UNDER_REVIEW).length;
  const scored = cases.filter(c => c.status === CaseState.SCORED).length;

  const decidedCases = cases.filter(c => c.status === CaseState.DECISIONED);
  let totalDecisionTime = 0;
  let decisionCount = 0;
  for (const c of decidedCases) {
    const dec = decisions.find(d => d.caseId === c.caseId);
    if (dec) {
      const created = new Date(c.createdAt).getTime();
      const decided = new Date(dec.createdAt).getTime();
      totalDecisionTime += (decided - created) / (1000 * 60 * 60);
      decisionCount++;
    }
  }
  const avgDecisionTime = decisionCount > 0 ? Math.round((totalDecisionTime / decisionCount) * 10) / 10 : 0;

  const approved = decisions.filter(d => d.decisionType === DecisionType.APPROVE).length;
  const totalDecisions = decisions.length;
  const approvalRate = totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100 * 100) / 100 : 0;

  const openAlerts = alerts.filter(a => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED').length;

  const slaTarget = slaMetrics.find(s => s.metricName === 'API Uptime');
  const slaPercent = slaTarget ? slaTarget.current : 99.9;

  const statusCounts = new Map<string, number>();
  for (const c of cases) {
    statusCounts.set(c.status, (statusCounts.get(c.status) || 0) + 1);
  }
  const casesByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));

  const bandCounts = new Map<string, number>();
  for (const fhc of fhcResults) {
    bandCounts.set(fhc.healthBand, (bandCounts.get(fhc.healthBand) || 0) + 1);
  }
  const casesByRiskBand = Array.from(bandCounts.entries()).map(([band, count]) => ({ band, count }));

  const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const recentActivity = sorted.slice(0, 10).map(e => ({
    auditEventId: e.auditEventId,
    caseId: e.caseId,
    actor: e.actor,
    action: e.action,
    objectType: e.objectType,
    timestamp: e.timestamp,
  }));

  res.json({
    totalCases,
    pendingCases,
    needsReview,
    underReview,
    scored,
    alerts: openAlerts,
    slaPercent,
    avgDecisionTime,
    approvalRate,
    casesByStatus,
    casesByRiskBand,
    recentActivity,
    recentActivityCount: recentActivity.length,
  });
}));

router.get('/recent-activity', wrapAsync(async (_req: Request, res: Response) => {
  const events = Array.from(mockDataStore.auditEvents.values())
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20)
    .map(e => ({
      id: e.auditEventId,
      caseId: e.caseId,
      action: e.action,
      user: e.actor,
      timestamp: e.timestamp,
    }));
  res.json(events);
}));

export default router;
