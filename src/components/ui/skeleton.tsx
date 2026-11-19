import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[linear-gradient(90deg,#e2e8f0_0%,#f1f5f9_50%,#e2e8f0_100%)] bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]',
        className
      )}
    />
  );
}
