import type { Anomaly } from '@msme-credit/shared';
import styles from './AnomalyBanner.module.css';

interface AnomalyBannerProps {
  anomaly: Anomaly;
}

export function AnomalyBanner({ anomaly }: AnomalyBannerProps) {
  const { type, severity, description, sourcesInvolved } = anomaly;
  const variant = severity?.toLowerCase() ?? 'noseverity';

  return (
    <div className={`${styles.banner} ${styles[variant] || styles.noSeverity}`}>
      <span className={styles.icon}>{severity === 'HIGH' ? '\u26A0' : severity === 'MEDIUM' ? '\u25B2' : '\u2139'}</span>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.type}>{type}</span>
          {severity && <span className={styles.severity}>{severity}</span>}
        </div>
        <div className={styles.description}>{description}</div>
        {sourcesInvolved.length > 0 && (
          <div className={styles.sources}>
            {sourcesInvolved.map((s) => (
              <span key={s.toString()} className={styles.sourceTag}>{s.toString()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
