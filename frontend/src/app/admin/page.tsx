import { LoadingSkeleton } from '@/components/ui';
import { apiFetch } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  activeRoles: number;
  branches: number;
  activeIntegrations: number;
  featureFlagsEnabled: number;
  featureFlagsDisabled: number;
}

export default async function AdminHomePage() {
  const stats = await apiFetch<AdminStats>('/admin/stats');

  if (!stats) {
    return <LoadingSkeleton variant="card" lines={5} />;
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-5)',
    flex: '1 1 200px',
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-navy-700)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-secondary)',
    marginTop: 'var(--spacing-1)',
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Admin Overview</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.totalUsers}</div>
          <div style={labelStyle}>Total Users</div>
        </div>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.activeRoles}</div>
          <div style={labelStyle}>Active Roles</div>
        </div>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.branches}</div>
          <div style={labelStyle}>Branches</div>
        </div>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.activeIntegrations}</div>
          <div style={labelStyle}>Active Integrations</div>
        </div>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.featureFlagsEnabled}</div>
          <div style={labelStyle}>Feature Flags Enabled</div>
        </div>
        <div style={cardStyle}>
          <div style={valueStyle}>{stats.featureFlagsDisabled}</div>
          <div style={{ ...labelStyle, color: 'var(--color-caution-text)' }}>Feature Flags Disabled</div>
        </div>
      </div>
    </div>
  );
}
