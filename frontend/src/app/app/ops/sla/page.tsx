import { LoadingSkeleton } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface SLAMetric {
  id: string;
  metric: string;
  current: string;
  target: string;
  status: string;
}

export default async function SLAPage() {
  const metrics = await apiFetchAll<SLAMetric>('/ops/sla');

  if (metrics.length === 0) {
    return <LoadingSkeleton variant="card" lines={5} />;
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-5)',
    flex: '1 1 280px',
  };
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-3) 0',
    borderBottom: '1px solid var(--border-color)',
  };
  const statusColor = (status: string): string => {
    if (status === 'Within' || status === 'OK') return 'var(--color-positive)';
    if (status === 'Warning') return 'var(--color-caution)';
    return 'var(--color-risk)';
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>SLA Dashboard</h1>
      <div style={cardStyle}>
        {metrics.map((m, idx) => (
          <div key={m.id} style={idx === metrics.length - 1 ? { ...rowStyle, borderBottom: 'none' } : rowStyle}>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
                {m.metric}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Current: {m.current} &middot; Target: {m.target}
              </div>
            </div>
            <span style={{
              padding: 'var(--spacing-1) var(--spacing-2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              background: statusColor(m.status),
              color: 'var(--color-white)',
            }}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
