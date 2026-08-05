interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`relative overflow-hidden rounded-xl bg-slate-200/60 dark:bg-slate-700/40 ${className}`}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-shimmer" />
  </div>
);

export const CardSkeleton = () => (
  <div className="glass-card p-5 flex flex-col gap-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const GridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);
