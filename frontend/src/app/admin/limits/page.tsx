import { apiFetchAll } from '@/lib/api';

interface LimitConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  unit: string;
  applicableRoles: string[];
}

export default async function LimitsPage() {
  const limits = await apiFetchAll<LimitConfig>('/governance/limits');

  if (limits.length === 0) {
    return (
      <div>
        <h1>Delegated Authority Limits</h1>
        <p>No limits configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Delegated Authority Limits</h1>
      <table>
        <thead>
          <tr>
            <th>Limit Name</th>
            <th>Min</th>
            <th>Max</th>
            <th>Unit</th>
            <th>Applicable Roles</th>
          </tr>
        </thead>
        <tbody>
          {limits.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.min}</td>
              <td>{l.max}</td>
              <td>{l.unit}</td>
              <td>{(l.applicableRoles ?? []).join(', ') || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
