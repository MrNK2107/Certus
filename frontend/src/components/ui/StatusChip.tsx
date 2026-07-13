import type { CaseState, ConsentStatus } from '../../shared';
import styles from './StatusChip.module.css';

type ChipColor = 'positive' | 'caution' | 'risk' | 'info' | 'missing';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

const caseStateColorMap: Partial<Record<CaseState, ChipColor>> = {
  DRAFT: 'missing',
  CONSENT_PENDING: 'info',
  CONSENT_GRANTED: 'positive',
  SOURCE_LINKING: 'info',
  DATA_FETCHING: 'info',
  DATA_READY: 'positive',
  SCORING: 'info',
  SCORED: 'positive',
  UNDER_REVIEW: 'caution',
  DECISIONED: 'positive',
  CONSENT_REVOKED: 'risk',
  EXPIRED: 'missing',
  FAILED: 'risk',
};

const consentStatusColorMap: Record<ConsentStatus, ChipColor> = {
  PENDING: 'caution',
  ACTIVE: 'positive',
  AMENDED: 'info',
  REVOKED: 'risk',
  EXPIRED: 'missing',
};

const consentStatuses = new Set(Object.keys(consentStatusColorMap));

const healthBandColorMap: Record<string, ChipColor> = {
  STRONG: 'positive',
  PROMISING_BUT_THIN: 'caution',
  RISKY: 'risk',
  NEEDS_REVIEW: 'caution',
};

function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const colorClass: ChipColor = consentStatuses.has(status)
    ? consentStatusColorMap[status as ConsentStatus]
    : (caseStateColorMap[status as CaseState] ?? healthBandColorMap[status] ?? 'missing');

  return (
    <span className={`${styles.chip} ${styles[size]} ${styles[colorClass]}`}>
      <span className={styles.dot} />
      {formatStatusLabel(status)}
    </span>
  );
}
