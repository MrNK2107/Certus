import styles from './TimelineEvent.module.css';

type EventVariant = 'info' | 'success' | 'warning' | 'error';

interface TimelineEventProps {
  title: string;
  timestamp: string;
  icon?: string;
  variant?: EventVariant;
  description?: string;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

const defaultIcons: Record<EventVariant, string> = {
  info: '\u2139',
  success: '\u2713',
  warning: '\u26A0',
  error: '\u2717',
};

export function TimelineEvent({ title, timestamp, icon, variant = 'info', description }: TimelineEventProps) {
  return (
    <div className={styles.event}>
      <div className={`${styles.iconWrapper} ${styles[variant]}`}>
        {icon ?? defaultIcons[variant]}
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>
          <span className={styles.timestamp}>{formatTimestamp(timestamp)}</span>
        </div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
}
