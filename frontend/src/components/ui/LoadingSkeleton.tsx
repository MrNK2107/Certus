import styles from './LoadingSkeleton.module.css';

type SkeletonVariant = 'card' | 'text' | 'table' | 'chart';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  lines?: number;
}

function CardSkeleton({ lines = 4 }: { lines: number }) {
  return (
    <div className={`${styles.skeleton} ${styles.card}`}>
      <div className={styles.cardBody}>
        <div className={`${styles.skeleton} ${styles.heading}`} />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.line} ${
              i === lines - 1 ? styles.lineShort : i % 2 === 0 ? styles.lineFull : styles.lineMedium
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TextSkeleton({ lines = 3 }: { lines: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${styles.line} ${
            i === lines - 1 ? styles.lineShort : i % 2 === 0 ? styles.lineFull : styles.lineMedium
          }`}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.skeleton} ${styles.tableCell}`} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <div key={rowIdx} className={styles.tableRow}>
          {Array.from({ length: 4 }).map((_, cellIdx) => (
            <div key={cellIdx} className={`${styles.skeleton} ${styles.tableCell}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  const heights = [60, 80, 45, 95, 70, 50, 85, 65];
  return (
    <div className={styles.chart}>
      <div className={`${styles.skeleton} ${styles.heading}`} />
      <div className={styles.chartBars}>
        {heights.map((h, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.chartBar}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ variant = 'card', lines = 4 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'card':
      return <CardSkeleton lines={lines} />;
    case 'text':
      return <TextSkeleton lines={lines} />;
    case 'table':
      return <TableSkeleton />;
    case 'chart':
      return <ChartSkeleton />;
    default:
      return <CardSkeleton lines={lines} />;
  }
}
