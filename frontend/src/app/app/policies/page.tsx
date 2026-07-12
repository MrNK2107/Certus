import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface Policy {
  id: string;
  name: string;
  version: string;
  active: boolean;
  updatedAt: string;
}

const columns: ServerColumn<Policy>[] = [
  { key: 'name', label: 'Policy', sortable: true },
  { key: 'version', label: 'Version', sortable: true },
  { key: 'active', label: 'Active', sortable: true },
  { key: 'updatedAt', label: 'Updated', sortable: true },
];

export default async function PoliciesPage() {
  const policies = await apiFetchAll<Policy>('/policies');

  if (policies.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Policy Management</h1>
        <EmptyState message="No policies found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Policy Management</h1>
      <ServerDataTable columns={columns} data={policies} pageSize={20} rowKey="id" />
    </div>
  );
}
