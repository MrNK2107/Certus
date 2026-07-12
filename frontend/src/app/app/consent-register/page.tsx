import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface ConsentRecord {
  id: string;
  caseId: string;
  source: string;
  status: string;
  grantedAt: string;
  expiresAt: string;
}

const columns: ServerColumn<ConsentRecord>[] = [
  { key: 'caseId', label: 'Case ID', sortable: true },
  { key: 'source', label: 'Source', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'grantedAt', label: 'Granted', sortable: true },
  { key: 'expiresAt', label: 'Expires', sortable: true },
];

export default async function ConsentRegisterPage() {
  const records = await apiFetchAll<ConsentRecord>('/consents');

  if (records.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Consent Register</h1>
        <EmptyState message="No consent records found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Consent Register</h1>
      <ServerDataTable columns={columns} data={records} pageSize={20} rowKey="id" />
    </div>
  );
}
