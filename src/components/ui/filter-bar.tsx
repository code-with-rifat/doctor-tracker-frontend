'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterBarProps = {
  children: React.ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
};

export function FilterBar({
  children,
  onClear,
  hasActiveFilters,
  className,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 md:hidden">
        <Button type="button" variant="secondary" onClick={() => setOpen((v) => !v)}>
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        {hasActiveFilters && onClear ? (
          <Button type="button" variant="ghost" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          'grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
          open ? 'grid' : 'hidden md:grid'
        )}
      >
        {children}
        {onClear ? (
          <div className="hidden items-end md:flex">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onClear}
              disabled={!hasActiveFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
