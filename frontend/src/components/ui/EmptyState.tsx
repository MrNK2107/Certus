import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title = 'No data available', message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {'\u2205'}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {actionLabel && onAction && (
        <button className={styles.action} onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
