import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message?: string;
  hint?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'An unexpected error occurred', hint, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {'\u26A0'}
      </div>
      <p className={styles.message}>{message}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
