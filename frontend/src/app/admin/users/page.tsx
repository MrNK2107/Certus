import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

const columns: ServerColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'team', label: 'Team', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

export default async function UsersPage() {
  const users = await apiFetchAll<User>('/admin/users');

  if (users.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>User Management</h1>
        <EmptyState message="No users found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>User Management</h1>
      <ServerDataTable columns={columns} data={users} pageSize={20} rowKey="id" />
    </div>
  );
}
