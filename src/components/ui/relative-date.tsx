import { formatFullDate, formatRelativeDate } from '@/lib/utils';

export function RelativeDate({ value }: { value: string }) {
  return (
    <time dateTime={value} title={formatFullDate(value)} className="text-slate-600">
      {formatRelativeDate(value)}
    </time>
  );
}
