import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface ReasonCode {
  id: string;
  code: string;
  category: string;
  pillar: string;
  active: boolean;
}

const columns: ServerColumn<ReasonCode>[] = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'pillar', label: 'Pillar', sortable: true },
  { key: 'active', label: 'Active', sortable: true },
];

export default async function ReasonCodesPage() {
  const codes = await apiFetchAll<ReasonCode>('/reason-codes');

  if (codes.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Reason Code Catalog</h1>
        <EmptyState message="No reason codes configured" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Reason Code Catalog</h1>
      <ServerDataTable columns={columns} data={codes} pageSize={20} rowKey="id" />
    </div>
  );
}
