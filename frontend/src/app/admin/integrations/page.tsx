import { apiFetchAll } from '@/lib/api';

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  environment: string;
}

export default async function IntegrationsPage() {
  const integrations = await apiFetchAll<IntegrationConfig>('/governance/integrations');

  if (integrations.length === 0) {
    return (
      <div>
        <h1>Integrations</h1>
        <p>No integrations configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Integrations</h1>
      <table>
        <thead>
          <tr>
            <th>Integration</th>
            <th>Type</th>
            <th>Environment</th>
            <th>Enabled</th>
          </tr>
        </thead>
        <tbody>
          {integrations.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.type}</td>
              <td>{i.environment}</td>
              <td>{i.enabled ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
