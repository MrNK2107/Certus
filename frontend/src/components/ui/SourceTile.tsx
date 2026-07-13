import type { SourceConnection } from '../../shared';
import styles from './SourceTile.module.css';

interface SourceTileProps {
  connection: SourceConnection;
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function freshnessLabel(freshness?: number): string {
  if (freshness === undefined || freshness === null) return 'Unknown';
  if (freshness < 1) return 'Today';
  if (freshness < 7) return `${freshness}d ago`;
  if (freshness < 30) return `${Math.round(freshness / 7)}w ago`;
  return `${Math.round(freshness / 30)}m ago`;
}

function qualityLabel(quality?: number): string {
  if (quality === undefined || quality === null) return '—';
  return `${Math.round(quality * 100)}%`;
}

export function SourceTile({ connection }: SourceTileProps) {
  const { sourceType, status, lastSyncedAt, freshness, quality, errorCode } = connection;
  const statusKey = status.toLowerCase();

  return (
    <div className={styles.tile}>
      <div className={styles.header}>
        <span className={styles.sourceName}>{sourceType}</span>
        <span className={`${styles.statusIcon} ${styles[statusKey] || styles.pending}`} />
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Status</span>
          <span className={styles.detailValue}>{status}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Last synced</span>
          <span className={styles.detailValue}>{formatTimestamp(lastSyncedAt)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Freshness</span>
          <span className={styles.detailValue}>{freshnessLabel(freshness)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Quality</span>
          <span className={styles.detailValue}>{qualityLabel(quality)}</span>
        </div>
      </div>

      {freshness !== undefined && freshness !== null && (
        <div className={styles.freshnessBar}>
          <div
            className={`${styles.freshnessFill} ${
              freshness < 7 ? styles.freshnessGood : freshness < 30 ? styles.freshnessStale : styles.freshnessOld
            }`}
            style={{ width: `${Math.max(0, 100 - (freshness / 90) * 100)}%` }}
          />
        </div>
      )}

      {errorCode && <span className={styles.errorText}>{errorCode}</span>}
    </div>
  );
}
