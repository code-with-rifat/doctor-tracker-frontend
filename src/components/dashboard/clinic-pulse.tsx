import Link from 'next/link';

type ClinicPulseProps = {
  totalPatients: number;
  patientsThisMonth: number;
  topCondition?: string;
  busiestDoctor?: string;
};

export function ClinicPulse({
  totalPatients,
  patientsThisMonth,
  topCondition,
  busiestDoctor,
}: ClinicPulseProps) {
  const share =
    totalPatients === 0 ? 0 : Math.round((patientsThisMonth / totalPatients) * 100);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h2 className="text-base font-semibold text-slate-900">Clinic pulse</h2>
      <p className="mt-1 text-sm text-slate-500">Quick signals from current records.</p>
      <dl className="mt-4 space-y-3">
        <Link
          href={`/patients?from=${monthStart}`}
          className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2.5 transition-colors hover:bg-brand-soft"
        >
          <dt className="text-sm text-slate-600">This month vs all patients</dt>
          <dd className="text-sm font-semibold tabular-nums text-slate-900">{share}%</dd>
        </Link>
        <Link
          href={
            topCondition
              ? `/patients?condition=${encodeURIComponent(topCondition)}`
              : '/patients'
          }
          className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2.5 transition-colors hover:bg-brand-soft"
        >
          <dt className="text-sm text-slate-600">Most common condition</dt>
          <dd className="max-w-[55%] truncate text-right text-sm font-semibold text-slate-900">
            {topCondition || '—'}
          </dd>
        </Link>
        <Link
          href="/doctors"
          className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2.5 transition-colors hover:bg-brand-soft"
        >
          <dt className="text-sm text-slate-600">Busiest doctor</dt>
          <dd className="max-w-[55%] truncate text-right text-sm font-semibold text-slate-900">
            {busiestDoctor || '—'}
          </dd>
        </Link>
      </dl>
    </div>
  );
}
