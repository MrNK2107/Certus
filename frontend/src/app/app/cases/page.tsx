import { ServerDataTable } from '@/components/ui';
import type { ServerColumn } from '@/components/ui';
import { apiFetchAll } from '@/lib/api';

interface CaseListItem {
  caseId: string;
  businessName: string;
  sector: string;
  status: string;
  createdAt: string;
}

const columns: ServerColumn<CaseListItem>[] = [
  { key: 'caseId', label: 'Case ID', sortable: true },
  { key: 'businessName', label: 'Business', sortable: true },
  { key: 'sector', label: 'Sector', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
];

export default async function CaseListPage() {
  const items = await apiFetchAll<CaseListItem>('/cases');
  return (
    <div>
      <h1>Case List</h1>
      <ServerDataTable columns={columns} data={items} pageSize={20} rowKey="caseId" />
    </div>
  );
}
