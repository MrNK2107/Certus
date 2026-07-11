import type { PillarScore, SourceType } from '@msme-credit/shared';
import { ReasonCodeBadge } from './ReasonCodeBadge';
import styles from './ScoreCard.module.css';

interface ScoreCardProps {
  pillarScore: PillarScore;
  allSources?: SourceType[];
}

const pillarLabels: Record<string, string> = {
  REVENUE_STABILITY: 'Revenue Stability',
  CASH_FLOW_HEALTH: 'Cash Flow Health',
  COMPLIANCE_DISCIPLINE: 'Compliance Discipline',
  OPERATIONAL_MATURITY: 'Operational Maturity',
  CREDIT_BEHAVIOR: 'Credit Behavior',
  DIGITAL_COMMERCIAL_ACTIVITY: 'Digital Commercial Activity',
};

export function ScoreCard({ pillarScore, allSources }: ScoreCardProps) {
  const { pillarName, score, confidence, evidenceSummary, reasonCodes, sourceCoverage, modelVersion } = pillarScore;
  const covered = new Set(sourceCoverage.map((s) => s.toString()));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.pillarLabel}>{pillarLabels[pillarName] ?? pillarName}</span>
          <span className={styles.score}>
            {score.toFixed(1)}
            <span className={styles.scoreDenominator}>/10</span>
          </span>
        </div>
        <div className={styles.metrics}>
          <span className={styles.metric}>
            <span className={`${styles.metricDot} ${confidence >= 50 ? styles.metricDotActive : styles.metricDotMissing}`} />
            {Math.round(confidence)}%
          </span>
        </div>
      </div>

      {evidenceSummary && (
        <p className={styles.evidence}>{evidenceSummary}</p>
      )}

      {reasonCodes.length > 0 && (
        <div className={styles.reasonCodes}>
          {reasonCodes.map((code) => (
            <ReasonCodeBadge key={code} code={code} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        {allSources && allSources.length > 0 && (
          <div className={styles.sourceList}>
            {allSources.map((source) => {
              const key = source.toString();
              const connected = covered.has(key);
              return (
                <span
                  key={key}
                  className={`${styles.sourceTag} ${connected ? styles.sourceTagConnected : styles.sourceTagMissing}`}
                >
                  {key}
                </span>
              );
            })}
          </div>
        )}
        <span className={styles.version}>v{modelVersion}</span>
      </div>
    </div>
  );
}
