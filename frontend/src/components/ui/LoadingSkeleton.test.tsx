import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders card variant by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders card variant explicitly', () => {
    const { container } = render(<LoadingSkeleton variant="card" />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders text variant', () => {
    const { container } = render(<LoadingSkeleton variant="text" />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders table variant', () => {
    const { container } = render(<LoadingSkeleton variant="table" />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders chart variant', () => {
    const { container } = render(<LoadingSkeleton variant="chart" />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('accepts custom lines for card variant', () => {
    const { container } = render(<LoadingSkeleton variant="card" lines={6} />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
