import type { PillarScore, SourceType } from '../../shared';
import { SourceType as SourceTypeEnum } from '../../shared';
import { ScoreCard } from './ScoreCard';
import styles from './PillarGrid.module.css';

interface PillarGridProps {
  pillarScores: PillarScore[];
  allSources?: SourceType[];
}

const defaultSources: SourceType[] = [
  SourceTypeEnum.AA, SourceTypeEnum.GST, SourceTypeEnum.BUREAU,
  SourceTypeEnum.UPI, SourceTypeEnum.EPFO, SourceTypeEnum.REGISTRATION,
  SourceTypeEnum.INVOICE, SourceTypeEnum.POS, SourceTypeEnum.ECOMMERCE,
  SourceTypeEnum.ONDC, SourceTypeEnum.UTILITY,
];

export function PillarGrid({ pillarScores, allSources = defaultSources }: PillarGridProps) {
  if (pillarScores.length === 0) return null;

  return (
    <div className={styles.grid}>
      {pillarScores.map((ps) => (
        <ScoreCard key={ps.pillarName} pillarScore={ps} allSources={allSources} />
      ))}
    </div>
  );
}
