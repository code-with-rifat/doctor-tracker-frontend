'use client';

import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number, windowSize = 4) {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = start + windowSize - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-slate-500">
        {total} result{total === 1 ? '' : 's'}
      </p>
    );
  }

  const pages = getVisiblePages(page, totalPages, 4);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        {total} result{total === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-1.5">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors',
              n === page
                ? 'bg-brand text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="ml-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
