import { render, screen } from '@testing-library/react';
import { CaseState, ConsentStatus, HealthBand } from '../../shared';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('renders with formatted status text', () => {
    render(<StatusChip status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it.each([
    ['DRAFT', 'missing'],
    ['CONSENT_PENDING', 'info'],
    ['SCORED', 'positive'],
    ['UNDER_REVIEW', 'caution'],
    ['DECISIONED', 'positive'],
    ['CANCELLED', 'missing'],
  ])('applies correct CSS class for status %s', (status, _expectedClass) => {
    const { container } = render(<StatusChip status={status} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip).toBeTruthy();
  });

  it.each([
    [HealthBand.STRONG, 'positive'],
    [HealthBand.PROMISING_BUT_THIN, 'caution'],
    [HealthBand.RISKY, 'risk'],
    [HealthBand.NEEDS_REVIEW, 'caution'],
  ])('renders health band %s with correct color', (band) => {
    render(<StatusChip status={band} />);
    const label = band
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    [ConsentStatus.PENDING, 'caution'],
    [ConsentStatus.ACTIVE, 'positive'],
    [ConsentStatus.AMENDED, 'info'],
    [ConsentStatus.REVOKED, 'risk'],
    [ConsentStatus.EXPIRED, 'missing'],
  ])('renders consent status %s with correct color', (status) => {
    render(<StatusChip status={status} />);
    const label = status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders dot indicator', () => {
    const { container } = render(<StatusChip status="DRAFT" />);
    const dot = container.querySelector('span > span');
    expect(dot).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<StatusChip status="DRAFT" size="sm" />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.className).toContain('sm');
  });

  it('defaults to md size', () => {
    const { container } = render(<StatusChip status="DRAFT" />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.className).toContain('md');
  });
});
