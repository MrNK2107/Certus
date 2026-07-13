import { render, screen, fireEvent } from '@testing-library/react';
import { ReasonCodeBadge } from './ReasonCodeBadge';

describe('ReasonCodeBadge', () => {
  it('renders code text', () => {
    render(<ReasonCodeBadge code="RC-001" />);
    expect(screen.getByText('RC-001')).toBeInTheDocument();
  });

  it('renders title with category when provided', () => {
    render(<ReasonCodeBadge code="RC-001" category="RISK" />);
    const badge = screen.getByText('RC-001');
    expect(badge).toHaveAttribute('title', 'RISK: RC-001');
  });

  it('renders title with just code when no category', () => {
    render(<ReasonCodeBadge code="RC-001" />);
    const badge = screen.getByText('RC-001');
    expect(badge).toHaveAttribute('title', 'RC-001');
  });

  it('is clickable when onClick provided', () => {
    const onClick = vi.fn();
    render(<ReasonCodeBadge code="RC-001" onClick={onClick} />);
    fireEvent.click(screen.getByText('RC-001'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has button role when onClick provided', () => {
    render(<ReasonCodeBadge code="RC-001" onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not have button role when no onClick', () => {
    render(<ReasonCodeBadge code="RC-001" />);
    const badge = screen.getByText('RC-001');
    expect(badge).not.toHaveAttribute('role');
  });

  it('responds to Enter key when onClick provided', () => {
    const onClick = vi.fn();
    render(<ReasonCodeBadge code="RC-001" onClick={onClick} />);
    const badge = screen.getByText('RC-001');
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('responds to Space key when onClick provided', () => {
    const onClick = vi.fn();
    render(<ReasonCodeBadge code="RC-001" onClick={onClick} />);
    const badge = screen.getByText('RC-001');
    fireEvent.keyDown(badge, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
