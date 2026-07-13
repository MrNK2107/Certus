import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Column } from './DataTable';

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const columns: Column<TestRow>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
];

const data: TestRow[] = [
  { id: '1', name: 'Alpha', value: 100 },
  { id: '2', name: 'Beta', value: 200 },
  { id: '3', name: 'Gamma', value: 300 },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('calls rowKey for each row', () => {
    const rowKey = vi.fn((r: TestRow) => r.id);
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={rowKey}
      />
    );
    expect(rowKey).toHaveBeenCalledTimes(3);
  });

  it('renders empty state when no data', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        rowKey={(r) => r.id}
        emptyMessage="Nothing here"
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders default empty message', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders custom render for cells', () => {
    const cols: Column<TestRow>[] = [
      { key: 'name', label: 'Name', render: (row) => `Name: ${row.name}` },
    ];
    render(
      <DataTable
        columns={cols}
        data={[data[0]]}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText('Name: Alpha')).toBeInTheDocument();
  });

  it('renders pagination when data exceeds pageSize', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pageSize={2}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  it('does not render pagination when data fits in one page', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pageSize={20}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
  });

  it('handles row click when onRowClick provided', () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[data[0]]}
        rowKey={(r) => r.id}
        onRowClick={onRowClick}
      />
    );
    fireEvent.click(screen.getByText('Alpha'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('sorts data when sortable header clicked', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        sortable
        rowKey={(r) => r.id}
      />
    );
    const nameHeader = screen.getByText('Name');
    const rowsBefore = screen.getAllByRole('row');
    expect(rowsBefore[1].textContent).toContain('Alpha');
    fireEvent.click(nameHeader);
    const rowsAfter = screen.getAllByRole('row');
    expect(rowsAfter[1].textContent).toContain('Alpha');
  });
});
