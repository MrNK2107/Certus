import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface ReconciliationRecord {
  id: string;
  caseId: string;
  source: string;
  expected: string;
  actual: string;
  status: string;
}

const columns: ServerColumn<ReconciliationRecord>[] = [
  { key: 'caseId', label: 'Case ID', sortable: true },
  { key: 'source', label: 'Source', sortable: true },
  { key: 'expected', label: 'Expected', sortable: true },
  { key: 'actual', label: 'Actual', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

export default async function ReconciliationPage() {
  const records = await apiFetchAll<ReconciliationRecord>('/ops/reconciliation');

  if (records.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Reconciliation</h1>
        <EmptyState message="No reconciliation records found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Reconciliation</h1>
      <ServerDataTable columns={columns} data={records} pageSize={20} rowKey="id" />
    </div>
  );
}
