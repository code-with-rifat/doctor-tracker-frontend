'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  className?: string;
};

export function RowActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'View',
  className,
}: RowActionsProps) {
  return (
    <div className={cn('inline-flex items-center justify-end gap-1', className)}>
      {onView ? (
        <button
          type="button"
          onClick={onView}
          title={viewLabel}
          aria-label={viewLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Eye className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          aria-label="Edit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
