import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface Branch {
  id: string;
  name: string;
  code: string;
  region: string;
  portfolioOwner: string;
}

const columns: ServerColumn<Branch>[] = [
  { key: 'name', label: 'Branch', sortable: true },
  { key: 'code', label: 'Code', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'portfolioOwner', label: 'Portfolio Owner', sortable: true },
];

export default async function BranchesPage() {
  const branches = await apiFetchAll<Branch>('/admin/branches');

  if (branches.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Branch Management</h1>
        <EmptyState message="No branches found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Branch Management</h1>
      <ServerDataTable columns={columns} data={branches} pageSize={20} rowKey="id" />
    </div>
  );
}
