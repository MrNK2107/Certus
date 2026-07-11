import type { AuditEvent } from '@msme-credit/shared';
import styles from './AuditRow.module.css';

interface AuditRowProps {
  event: AuditEvent;
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function actorInitials(actor: string): string {
  return actor
    .split(/[\s@.]+/)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function AuditRow({ event }: AuditRowProps) {
  const { actor, action, objectType, objectId, timestamp, requestId, versionContext } = event;

  return (
    <div className={styles.row}>
      <div className={styles.actorBadge}>{actorInitials(actor)}</div>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <div>
            <span className={styles.actor}>{actor}</span>
            <span className={styles.action}> {formatAction(action)}</span>
          </div>
          <span className={styles.timestamp}>{formatTimestamp(timestamp)}</span>
        </div>
        <div className={styles.details}>
          <span className={styles.detailItem}>
            <span className={styles.detailLabel}>Object: </span>
            {objectType}/{objectId}
          </span>
          <span className={styles.detailItem}>
            <span className={styles.detailLabel}>Request: </span>
            {requestId}
          </span>
        </div>
        {(versionContext.modelVersion || versionContext.policyVersion || versionContext.consentVersion) && (
          <div className={styles.metadata}>
            {versionContext.modelVersion && (
              <span className={styles.metaTag}>model: {versionContext.modelVersion}</span>
            )}
            {versionContext.policyVersion && (
              <span className={styles.metaTag}>policy: {versionContext.policyVersion}</span>
            )}
            {versionContext.consentVersion !== undefined && (
              <span className={styles.metaTag}>consent: v{versionContext.consentVersion}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
