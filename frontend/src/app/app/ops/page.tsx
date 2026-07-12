import { LoadingSkeleton } from '@/components/ui';
import { apiFetch } from '@/lib/api';

interface OpsHealth {
  platformHealth: string;
  activeIncidents: number;
  openAlerts: number;
  queueLagMinutes: number;
}

export default async function OpsHomePage() {
  const health = await apiFetch<OpsHealth>('/ops/health');

  if (!health) {
    return <LoadingSkeleton variant="card" lines={4} />;
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-5)',
    flex: '1 1 200px',
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-navy-700)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-secondary)',
    marginTop: 'var(--spacing-1)',
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Operations</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
        <div style={cardStyle}>
          <div style={{
            ...valueStyle,
            fontSize: 'var(--font-size-xl)',
            color: health.platformHealth === 'Healthy' ? 'var(--color-positive)' : 'var(--color-risk)',
          }}>
            {health.platformHealth}
          </div>
          <div style={labelStyle}>Platform Health</div>
        </div>
        <div style={cardStyle}>
          <div style={{
            ...valueStyle,
            color: health.activeIncidents > 0 ? 'var(--color-risk)' : 'var(--color-positive)',
          }}>
            {health.activeIncidents}
          </div>
          <div style={labelStyle}>Active Incidents</div>
        </div>
        <div style={cardStyle}>
          <div style={{
            ...valueStyle,
            color: health.openAlerts > 0 ? 'var(--color-caution)' : 'var(--color-positive)',
          }}>
            {health.openAlerts}
          </div>
          <div style={labelStyle}>Open Alerts</div>
        </div>
        <div style={cardStyle}>
          <div style={{
            ...valueStyle,
            color: health.queueLagMinutes > 10 ? 'var(--color-caution)' : 'var(--color-positive)',
          }}>
            {health.queueLagMinutes}m
          </div>
          <div style={labelStyle}>Queue Lag</div>
        </div>
      </div>
    </div>
  );
}
