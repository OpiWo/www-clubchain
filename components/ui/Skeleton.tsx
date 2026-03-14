import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'bg-[#1a1a24] skeleton-pulse rounded-sm',
        className
      )}
    />
  );
}

export function LeagueCardSkeleton() {
  return (
    <div className="bg-[#111118] border border-[#2a2a38] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-7 w-3/4" />
      <div className="flex items-end justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}
