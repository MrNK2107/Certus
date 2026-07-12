import { SourceTile, LoadingSkeleton, EmptyState } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface ConnectorHealth {
  id: string;
  sourceType: string;
  status: string;
  lastSyncedAt?: string;
  freshness?: number;
  quality?: number;
  errorCode?: string;
  successRate: number;
}

export default async function ConnectorsPage() {
  const connectors = await apiFetchAll<ConnectorHealth>('/ops/connectors');

  if (connectors.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Connector Health</h1>
        <EmptyState message="No connector data available" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Connector Health</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-4)' }}>
        {connectors.map((c) => (
          <div key={c.id}>
            <SourceTile
              connection={{
                sourceType: c.sourceType,
                status: c.status,
                lastSyncedAt: c.lastSyncedAt,
                freshness: c.freshness,
                quality: c.quality ?? c.successRate / 100,
                errorCode: c.errorCode,
              } as any}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
