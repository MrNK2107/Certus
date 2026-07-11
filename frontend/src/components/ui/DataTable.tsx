'use client';

import { useState, useMemo, useCallback } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  sortable?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 20,
  sortable: globallySortable = false,
  onRowClick,
  emptyMessage = 'No data to display',
  rowKey,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  if (page > totalPages) setPage(totalPages);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            {columns.map((col) => {
              const isSortable = globallySortable && col.sortable;
              const isActive = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  className={`${styles.headerCell}${isSortable ? ` ${styles.headerCellSortable}` : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {isSortable && (
                    <span className={`${styles.sortIcon}${isActive ? ` ${styles.sortIconActive}` : ''}`}>
                      {isActive ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B4\u25BE'}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr className={styles.emptyRow}>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            paginated.map((row) => (
              <tr
                key={rowKey(row)}
                className={`${styles.bodyRow}${onRowClick ? ` ${styles.bodyRowClickable}` : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.bodyCell}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Page {page} of {totalPages} ({sorted.length} total)
          </span>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage(1)}
              type="button"
            >
              {'\u00AB'}
            </button>
            <button
              className={styles.pageButton}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              {'\u2039'}
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  className={`${styles.pageButton}${p === page ? ` ${styles.pageButtonActive}` : ''}`}
                  onClick={() => setPage(p)}
                  type="button"
                >
                  {p}
                </button>
              );
            })}
            <button
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              {'\u203A'}
            </button>
            <button
              className={styles.pageButton}
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              type="button"
            >
              {'\u00BB'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
