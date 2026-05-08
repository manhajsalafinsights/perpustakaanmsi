export function BookCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 sm:w-52">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="aspect-[3/4] skeleton-shimmer" />
        <div className="p-3 sm:p-4 space-y-2">
          <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
          <div className="h-3 skeleton-shimmer rounded-lg w-full" />
          <div className="h-3 skeleton-shimmer rounded-lg w-2/3" />
          <div className="h-5 skeleton-shimmer rounded-full w-16 mt-2" />
        </div>
      </div>
    </div>
  );
}

export function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden">
          <div className="aspect-[3/4] skeleton-shimmer" />
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
            <div className="h-3 skeleton-shimmer rounded-lg w-full" />
            <div className="h-3 skeleton-shimmer rounded-lg w-2/3" />
            <div className="h-5 skeleton-shimmer rounded-full w-16 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 skeleton-shimmer rounded-lg w-48" />
      <div className="h-5 skeleton-shimmer rounded-lg w-64" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
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
