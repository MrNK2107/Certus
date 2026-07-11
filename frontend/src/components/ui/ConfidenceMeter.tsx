import styles from './ConfidenceMeter.module.css';

interface ConfidenceMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

function getBand(value: number): 'high' | 'medium' | 'low' {
  if (value >= 80) return 'high';
  if (value >= 50) return 'medium';
  return 'low';
}

export function ConfidenceMeter({ value, size = 'md', showLabel = true, label = 'Confidence' }: ConfidenceMeterProps) {
  const band = getBand(value);
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      {showLabel && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={`${styles.value} ${styles[`${band}Text`]}`}>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div className={`${styles.bar} ${styles[band]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
