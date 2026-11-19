import { cn } from '@/lib/utils';

const DEFAULT_TONE = 'bg-teal-50 text-teal-800 ring-teal-100';

export function Tag({
  children,
  className,
  tone,
}: {
  children: string;
  className?: string;
  tone?: string;
}) {
  return (
    <span
      title={children}
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ring-1 ring-inset',
        tone || DEFAULT_TONE,
        className
      )}
    >
      {children}
    </span>
  );
}
