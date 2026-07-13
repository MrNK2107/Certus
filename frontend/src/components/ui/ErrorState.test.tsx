import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders default message when no message prop', () => {
    render(<ErrorState />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders hint when provided', () => {
    render(<ErrorState hint="Try refreshing the page" />);
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
  });

  it('does not render hint when not provided', () => {
    const { container } = render(<ErrorState />);
    const hints = container.querySelectorAll('p');
    expect(hints.length).toBe(1);
  });

  it('renders retry button when onRetry provided', () => {
    render(<ErrorState onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('does not render retry button when no onRetry prop', () => {
    render(<ErrorState />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
