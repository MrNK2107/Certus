import styles from './ReasonCodeBadge.module.css';

interface ReasonCodeBadgeProps {
  code: string;
  category?: string;
  onClick?: () => void;
}

export function ReasonCodeBadge({ code, category, onClick }: ReasonCodeBadgeProps) {
  return (
    <span
      className={`${styles.badge}${onClick ? ` ${styles.clickable}` : ''}`}
      title={category ? `${category}: ${code}` : code}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {code}
    </span>
  );
}
