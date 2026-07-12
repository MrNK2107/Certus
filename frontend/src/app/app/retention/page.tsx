import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface RetentionPolicy {
  id: string;
  source: string;
  retentionDays: number;
  purgeAfterDays: number;
}

const columns: ServerColumn<RetentionPolicy>[] = [
  { key: 'source', label: 'Source', sortable: true },
  { key: 'retentionDays', label: 'Retention Days', sortable: true },
  { key: 'purgeAfterDays', label: 'Purge After', sortable: true },
];

export default async function RetentionPage() {
  const policies = await apiFetchAll<RetentionPolicy>('/retention');

  if (policies.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Data Retention</h1>
        <EmptyState message="No retention policies configured" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Data Retention</h1>
      <ServerDataTable columns={columns} data={policies} pageSize={20} rowKey="id" />
    </div>
  );
}
