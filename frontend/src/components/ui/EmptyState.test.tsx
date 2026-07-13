import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders default title when no title prop', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<EmptyState title="Custom title" />);
    expect(screen.getByText('Custom title')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<EmptyState message="Nothing to show" />);
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('does not render message when not provided', () => {
    const { container } = render(<EmptyState />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('renders action button when actionLabel and onAction provided', () => {
    const onAction = vi.fn();
    render(<EmptyState actionLabel="Add data" onAction={onAction} />);
    const button = screen.getByRole('button', { name: 'Add data' });
    expect(button).toBeInTheDocument();
  });

  it('does not render button when no actionLabel', () => {
    render(<EmptyState />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('does not render button when no onAction even with actionLabel', () => {
    render(<EmptyState actionLabel="Add data" />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('calls onAction when button clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState actionLabel="Add data" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add data' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
