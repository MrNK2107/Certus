import type { DecisionType } from '@msme-credit/shared';
import styles from './RecommendationBanner.module.css';

interface RecommendationBannerProps {
  recommendation: string;
  decisionType?: DecisionType;
}

const config: Record<string, { variant: string; icon: string; title: string }> = {
  APPROVE: { variant: 'approve', icon: '\u2713', title: 'Approval Recommended' },
  DECLINE: { variant: 'decline', icon: '\u2717', title: 'Decline Recommended' },
  REFER: { variant: 'refer', icon: '\u26A0', title: 'Manual Review Required' },
  REQUEST_MORE_DATA: { variant: 'moreData', icon: '\u2139', title: 'Additional Data Needed' },
};

export function RecommendationBanner({ recommendation, decisionType }: RecommendationBannerProps) {
  const cfg = decisionType ? config[decisionType] : undefined;
  const variant = cfg?.variant ?? 'default';
  const icon = cfg?.icon ?? '\u2139';
  const title = cfg?.title ?? 'Recommendation';

  return (
    <div className={`${styles.banner} ${styles[variant]}`}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{recommendation}</div>
      </div>
    </div>
  );
}
