import { AnomalyBanner, EmptyState } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  description: string;
  sourcesInvolved: string[];
  timestamp: string;
}

export default async function AlertsPage() {
  const alerts = await apiFetchAll<AlertItem>('/ops/alerts');

  if (alerts.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Alerts</h1>
        <EmptyState message="No alerts at this time" />
      </div>
    );
  }

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Alerts</h1>
      <div style={listStyle}>
        {alerts.map((a) => (
          <AnomalyBanner
            key={a.id}
            anomaly={{
              type: a.type,
              severity: a.severity as any,
              description: a.description,
              sourcesInvolved: a.sourcesInvolved,
            } as any}
          />
        ))}
      </div>
    </div>
  );
}
