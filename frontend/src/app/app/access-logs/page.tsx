import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface AccessLogEntry {
  id: string;
  caseId: string;
  accessedBy: string;
  action: string;
  timestamp: string;
}

const columns: ServerColumn<AccessLogEntry>[] = [
  { key: 'caseId', label: 'Case ID', sortable: true },
  { key: 'accessedBy', label: 'Accessed By', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'timestamp', label: 'Timestamp', sortable: true },
];

export default async function AccessLogsPage() {
  const logs = await apiFetchAll<AccessLogEntry>('/access-logs');

  if (logs.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Access Logs</h1>
        <EmptyState message="No access logs recorded yet" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Access Logs</h1>
      <ServerDataTable columns={columns} data={logs} pageSize={20} rowKey="id" />
    </div>
  );
}
