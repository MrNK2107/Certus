import { render, screen } from '@testing-library/react';
import { ServerDataTable, ServerColumn } from './ServerDataTable';

interface TestRow {
  id: string;
  name: string;
  value: string;
}

const columns: ServerColumn<TestRow>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'value', label: 'Value' },
];

const data: TestRow[] = [
  { id: '1', name: 'Alpha', value: '100' },
  { id: '2', name: 'Beta', value: '200' },
];

describe('ServerDataTable', () => {
  it('renders column headers', () => {
    render(
      <ServerDataTable
        columns={columns}
        data={data}
        rowKey="id"
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(
      <ServerDataTable
        columns={columns}
        data={data}
        rowKey="id"
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <ServerDataTable
        columns={columns}
        data={[]}
        rowKey="id"
        emptyMessage="No rows"
      />
    );
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
