import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium leading-none text-slate-700 ring-1 ring-inset ring-slate-200/80',
        className
      )}
    >
      {children}
    </span>
  );
}
