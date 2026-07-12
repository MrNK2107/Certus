import { ServerDataTable, EmptyState } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetch, apiFetchAll } from '@/lib/api';

interface ModelVersion {
  id: string;
  version: string;
  status: string;
  promotedAt: string;
  description: string;
}

interface ModelActiveInfo {
  activeVersion: string;
}

const columns: ServerColumn<ModelVersion>[] = [
  { key: 'version', label: 'Version', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'promotedAt', label: 'Promoted', sortable: true },
  { key: 'description', label: 'Description' },
];

export default async function ModelVersionsPage() {
  const info = await apiFetch<ModelActiveInfo>('/model-versions/active');
  const versions = await apiFetchAll<ModelVersion>('/model-versions');

  if (versions.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Model Versions</h1>
        <EmptyState message="No model versions found" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Model Versions</h1>
      {info && (
        <div
          style={{
            background: 'var(--color-info-bg)',
            border: '1px solid var(--color-info)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-6)',
            color: 'var(--color-info-text)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          Active Version: {info.activeVersion}
        </div>
      )}
      <ServerDataTable columns={columns} data={versions} pageSize={20} rowKey="id" />
    </div>
  );
}
