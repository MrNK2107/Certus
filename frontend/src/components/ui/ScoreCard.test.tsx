import { render, screen } from '@testing-library/react';
import { PillarName, SourceType } from '@msme-credit/shared';
import type { PillarScore } from '@msme-credit/shared';
import { ScoreCard } from './ScoreCard';

function createMockPillarScore(overrides: Partial<PillarScore> = {}): PillarScore {
  return {
    pillarScoreId: 'ps-1',
    caseId: 'case-1',
    pillarName: PillarName.REVENUE_STABILITY,
    score: 7.5,
    confidence: 85,
    evidenceSummary: 'Consistent revenue over 12 months',
    reasonCodes: ['RC-001', 'RC-002'],
    sourceCoverage: [SourceType.GST, SourceType.BUREAU],
    modelVersion: '1.0.0',
    ...overrides,
  };
}

describe('ScoreCard', () => {
  it('renders pillar label', () => {
    const score = createMockPillarScore();
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('Revenue Stability')).toBeInTheDocument();
  });

  it('renders score value', () => {
    const score = createMockPillarScore({ score: 8.3 });
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('8.3')).toBeInTheDocument();
  });

  it('renders confidence percentage', () => {
    const score = createMockPillarScore({ confidence: 72 });
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('renders evidence summary', () => {
    const score = createMockPillarScore({ evidenceSummary: 'Good performance' });
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('Good performance')).toBeInTheDocument();
  });

  it('does not render evidence summary when empty', () => {
    const score = createMockPillarScore({ evidenceSummary: '' });
    const { container } = render(<ScoreCard pillarScore={score} />);
    const paragraphs = container.querySelectorAll('p');
    const evidenceParagraph = Array.from(paragraphs).find(
      (p) => p.textContent === ''
    );
    expect(evidenceParagraph).toBeFalsy();
  });

  it('renders reason codes', () => {
    const score = createMockPillarScore({ reasonCodes: ['RC-001', 'RC-002'] });
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('RC-001')).toBeInTheDocument();
    expect(screen.getByText('RC-002')).toBeInTheDocument();
  });

  it('renders model version', () => {
    const score = createMockPillarScore({ modelVersion: '2.1.0' });
    render(<ScoreCard pillarScore={score} />);
    expect(screen.getByText('v2.1.0')).toBeInTheDocument();
  });

  it('renders source tags when allSources provided', () => {
    const score = createMockPillarScore();
    render(
      <ScoreCard
        pillarScore={score}
        allSources={[SourceType.GST, SourceType.AA]}
      />
    );
    expect(screen.getByText('GST')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  it('renders connected sources with different class', () => {
    const score = createMockPillarScore({ sourceCoverage: [SourceType.GST] });
    const { container } = render(
      <ScoreCard
        pillarScore={score}
        allSources={[SourceType.GST, SourceType.AA]}
      />
    );
    const sourceTags = container.querySelectorAll('[class*="sourceTag"]');
    expect(sourceTags.length).toBe(2);
    const connected = container.querySelector('[class*="sourceTagConnected"]');
    expect(connected).toBeInTheDocument();
    expect(connected?.textContent).toBe('GST');
  });
});
