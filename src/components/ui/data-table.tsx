'use client';

import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'right';
  cell: (row: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  hideBelow?: 'md' | 'lg' | 'xl';
  truncate?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
};

function hideClass(hideBelow?: Column<unknown>['hideBelow']) {
  if (hideBelow === 'md') return 'hidden md:table-cell';
  if (hideBelow === 'lg') return 'hidden lg:table-cell';
  if (hideBelow === 'xl') return 'hidden xl:table-cell';
  return undefined;
}

export function DataTable<T>({ columns, rows, rowKey, actions }: DataTableProps<T>) {
  return (
    <>
      <div className="hidden w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={cn(
                    'h-11 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500',
                    index === 0 && 'w-[42%]',
                    index === 1 && columns.length === 2 && 'w-[40%]',
                    index === 1 && columns.length === 3 && 'w-[28%]',
                    index === 2 && 'w-[18%]',
                    col.align === 'right' && 'text-right',
                    hideClass(col.hideBelow),
                    col.headerClassName,
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions ? (
                <th className="h-11 w-[140px] px-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/90"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'h-14 px-5 align-middle text-slate-800',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.truncate && 'truncate',
                      hideClass(col.hideBelow),
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
                {actions ? (
                  <td className="h-14 w-[140px] px-4 text-right align-middle">
                    {actions(row)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <MobileCard
            key={rowKey(row)}
            columns={columns}
            row={row}
            actions={actions?.(row)}
          />
        ))}
      </div>
    </>
  );
}

function MobileCard<T>({
  columns,
  row,
  actions,
}: {
  columns: Column<T>[];
  row: T;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const visible = columns.filter((col) => !col.hideOnMobile);
  const primary = visible[0];
  const rest = visible.slice(1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900">{primary?.cell(row)}</div>
          <div className="mt-3 space-y-2.5">
            {rest.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-slate-500">{col.mobileLabel || col.header}</span>
                <span className="min-w-0 truncate text-right text-slate-800">{col.cell(row)}</span>
              </div>
            ))}
          </div>
        </div>
        {actions ? (
          <div className="relative shrink-0">
            <button
              type="button"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {open ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                  {actions}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
