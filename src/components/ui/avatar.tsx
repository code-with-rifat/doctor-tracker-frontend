import { avatarColor, cn, getInitials } from '@/lib/utils';

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        avatarColor(name),
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
