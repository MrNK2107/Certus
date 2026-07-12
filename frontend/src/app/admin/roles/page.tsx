import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  userCount: number;
  permissions: string;
}

const columns: ServerColumn<Role>[] = [
  { key: 'name', label: 'Role', sortable: true },
  { key: 'userCount', label: 'Users', sortable: true },
  { key: 'permissions', label: 'Permissions' },
];

export default async function RolesPage() {
  const roles = await apiFetchAll<Role>('/admin/roles');

  if (roles.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Role Management</h1>
        <EmptyState message="No roles configured" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Role Management</h1>
      <ServerDataTable columns={columns} data={roles} pageSize={20} rowKey="id" />
    </div>
  );
}
