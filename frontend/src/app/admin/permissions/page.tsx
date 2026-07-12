import { apiFetchAll } from '@/lib/api';

interface PermissionMatrix {
  role: string;
  permissions: { action: string; granted: boolean }[];
}

export default async function PermissionsPage() {
  const roles = await apiFetchAll<PermissionMatrix>('/admin/roles');

  if (roles.length === 0) {
    return (
      <div>
        <h1>Permission Matrix</h1>
        <p>No roles configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Permission Matrix</h1>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Permissions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r, i) => (
            <tr key={r.role ?? i}>
              <td>{r.role}</td>
              <td>
                {(r.permissions ?? []).map((p) => p.action).join(', ') || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
