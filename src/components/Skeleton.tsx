export function BookCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="aspect-[3/4] skeleton-shimmer" />
      <div className="p-2 sm:p-3 space-y-1.5">
        <div className="h-3 skeleton-shimmer rounded-lg w-3/4" />
        <div className="h-2.5 skeleton-shimmer rounded-lg w-full" />
        <div className="h-2.5 skeleton-shimmer rounded-lg w-2/3" />
        <div className="h-4 skeleton-shimmer rounded-full w-14 mt-1.5" />
      </div>
    </div>
  );
}

const GRID_CLASSES = "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 sm:gap-4";

export function BookGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden">
          <div className="aspect-[3/4] skeleton-shimmer" />
          <div className="p-2 sm:p-3 space-y-1.5">
            <div className="h-3 skeleton-shimmer rounded-lg w-3/4" />
            <div className="h-2.5 skeleton-shimmer rounded-lg w-full" />
            <div className="h-2.5 skeleton-shimmer rounded-lg w-2/3" />
            <div className="h-4 skeleton-shimmer rounded-full w-14 mt-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="space-y-5">
      <div className="h-7 skeleton-shimmer rounded-lg w-48" />
      <BookGridSkeleton count={count} />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-6">
          <div className="h-4 skeleton-shimmer rounded-lg w-24 mb-3" />
          <div className="h-8 skeleton-shimmer rounded-lg w-16" />
        </div>
      ))}
    </div>
  );
}
