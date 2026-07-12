'use client';

import { useEffect, useState } from 'react';
import { apiFetchAll, apiPost } from '@/lib/api';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    apiFetchAll<FeatureFlag>('/governance/feature-flags').then(setFlags);
  }, []);

  async function handleToggle(id: string) {
    const updated = await apiPost<FeatureFlag>(`/governance/feature-flags/${id}/toggle`, {});
    if (updated) {
      setFlags((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
  }

  if (flags.length === 0) {
    return (
      <div>
        <h1>Feature Flags</h1>
        <p>No feature flags configured.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Feature Flags</h1>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Description</th>
            <th>Enabled</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td>{flag.name}</td>
              <td>{flag.description}</td>
              <td>
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => handleToggle(flag.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
