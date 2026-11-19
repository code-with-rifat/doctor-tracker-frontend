import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  className?: string;
}) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight text-slate-900">
          {value}
        </p>
      </div>
      <div className="rounded-lg bg-brand-soft p-2.5 text-brand">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
    </div>
  );

  const styles = cn(
    'block rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200',
    href &&
      'cursor-pointer hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
    !href && 'hover:-translate-y-0.5',
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles} aria-label={`Open ${label}`}>
        {content}
      </Link>
    );
  }

  return <div className={styles}>{content}</div>;
}
