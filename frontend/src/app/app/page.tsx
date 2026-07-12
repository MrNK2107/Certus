import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface AppMetrics {
  totalCases: number;
  pendingCases: number;
  needsReview: number;
  underReview: number;
  scored: number;
  alerts: number;
}

export default async function AppHomePage() {
  const metrics = await apiFetch<AppMetrics>('/dashboard/metrics');

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-4)',
    flex: '1 1 150px',
    textAlign: 'center',
  };
  const valStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-navy-700)',
  };
  const lblStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-1)',
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-6)' }}>Lender Workspace</h1>
      <p style={{ marginBottom: 'var(--spacing-6)', color: 'var(--text-secondary)' }}>
        Welcome to the MSME Financial Health Card platform.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={cardStyle}><div style={valStyle}>{metrics?.totalCases ?? 0}</div><div style={lblStyle}>Total Cases</div></div>
        <div style={cardStyle}><div style={valStyle}>{metrics?.pendingCases ?? 0}</div><div style={lblStyle}>Pending</div></div>
        <div style={cardStyle}><div style={valStyle}>{metrics?.needsReview ?? 0}</div><div style={lblStyle}>Needs Review</div></div>
        <div style={cardStyle}><div style={valStyle}>{metrics?.underReview ?? 0}</div><div style={lblStyle}>Under Review</div></div>
        <div style={cardStyle}><div style={{ ...valStyle, color: 'var(--color-risk)' }}>{metrics?.alerts ?? 0}</div><div style={lblStyle}>Alerts</div></div>
      </div>
      <nav style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
        <Link href="/app/dashboard" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Dashboard</Link>
        <Link href="/app/queue" style={{ fontWeight: 'var(--font-weight-semibold)' }}>Queue</Link>
        <Link href="/app/cases" style={{ fontWeight: 'var(--font-weight-semibold)' }}>All Cases</Link>
      </nav>
    </div>
  );
}
