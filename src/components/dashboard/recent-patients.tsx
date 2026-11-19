'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Paginated, Patient } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Tag } from '@/components/ui/tag';
import { RelativeDate } from '@/components/ui/relative-date';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentPatients() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: () =>
      api<Paginated<Patient>>('/patients', {
        params: { page: 1, limit: 6 },
      }),
  });

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent patients</h2>
          <p className="mt-1 text-sm text-slate-500">Open a name for full history.</p>
        </div>
        <Link href="/patients" className="text-sm font-medium text-brand hover:text-brand-hover">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600">Couldn&apos;t load recent patients.</p>
      ) : null}

      {data ? (
        <ul className="divide-y divide-slate-100">
          {data.data.map((patient) => (
            <li key={patient._id}>
              <Link
                href={`/patients/${patient._id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50/80"
              >
                <Avatar name={patient.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{patient.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    <RelativeDate value={patient.createdAt} />
                  </p>
                </div>
                <span className="hidden max-w-[140px] sm:inline-flex">
                  <Tag>{patient.condition}</Tag>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
