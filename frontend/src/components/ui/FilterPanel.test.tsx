import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterDef } from './FilterPanel';

const filters: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  { key: 'search', label: 'Search', type: 'search', placeholder: 'Search...' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'text', label: 'Name', type: 'text', placeholder: 'Enter name' },
];

describe('FilterPanel', () => {
  it('renders title', () => {
    render(
      <FilterPanel
        title="Custom Filters"
        filters={[]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Custom Filters')).toBeInTheDocument();
  });

  it('renders default title', () => {
    render(
      <FilterPanel
        filters={[]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders select filter', () => {
    render(
      <FilterPanel
        filters={[filters[0]]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inactive' })).toBeInTheDocument();
  });

  it('renders search filter', () => {
    render(
      <FilterPanel
        filters={[filters[1]]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders date filter', () => {
    render(
      <FilterPanel
        filters={[filters[2]]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('renders text filter', () => {
    render(
      <FilterPanel
        filters={[filters[3]]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('calls onChange when select changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterPanel
        filters={[filters[0]]}
        values={{ status: '' }}
        onChange={onChange}
      />
    );
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'active' } });
    expect(onChange).toHaveBeenCalledWith('status', 'active');
  });

  it('calls onChange when search input changes', () => {
    const onChange = vi.fn();
    render(
      <FilterPanel
        filters={[filters[1]]}
        values={{ search: '' }}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('search', 'test');
  });

  it('calls onChange when date changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterPanel
        filters={[filters[2]]}
        values={{ date: '' }}
        onChange={onChange}
      />
    );
    const dateInput = container.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
    expect(onChange).toHaveBeenCalledWith('date', '2024-01-01');
  });

  it('renders clear button when values present', () => {
    render(
      <FilterPanel
        filters={[filters[0]]}
        values={{ status: 'active' }}
        onChange={() => {}}
        onClear={() => {}}
      />
    );
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('does not render clear button when no values', () => {
    render(
      <FilterPanel
        filters={[filters[0]]}
        values={{ status: '' }}
        onChange={() => {}}
        onClear={() => {}}
      />
    );
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('does not render clear button when onClear not provided', () => {
    render(
      <FilterPanel
        filters={[filters[0]]}
        values={{ status: 'active' }}
        onChange={() => {}}
      />
    );
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    render(
      <FilterPanel
        filters={[filters[0]]}
        values={{ status: 'active' }}
        onChange={() => {}}
        onClear={onClear}
      />
    );
    fireEvent.click(screen.getByText('Clear all'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
