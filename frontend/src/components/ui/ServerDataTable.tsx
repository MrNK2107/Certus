'use client';

import { DataTable, StatusChip } from '@/components/ui';
import type { Column } from '@/components/ui';

export interface ServerColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface ServerDataTableProps<T> {
  columns: ServerColumn<T>[];
  data: T[];
  pageSize?: number;
  rowKey: string;
  emptyMessage?: string;
}

export function ServerDataTable<T>({
  columns,
  data,
  pageSize,
  rowKey: rowKeyField,
  emptyMessage,
}: ServerDataTableProps<T>) {
  const tableColumns: Column<T>[] = columns.map((col) => ({
    key: col.key,
    label: col.label,
    sortable: col.sortable,
    width: col.width,
  }));

  return (
    <DataTable
      columns={tableColumns}
      data={data}
      pageSize={pageSize}
      rowKey={(r: T) => String((r as Record<string, unknown>)[rowKeyField])}
      emptyMessage={emptyMessage}
    />
  );
}
