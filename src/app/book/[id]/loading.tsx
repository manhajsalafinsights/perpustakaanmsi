export default function BookDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="w-24 h-8 bg-surface-dark rounded-lg mb-4" />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Cover skeleton */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="aspect-[3/4] bg-surface-dark rounded-2xl" />
        </div>

        {/* Info skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-surface-dark rounded-lg w-3/4" />
          <div className="h-4 bg-surface-dark rounded w-1/3" />
          <div className="h-4 bg-surface-dark rounded w-1/4" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-surface-dark rounded w-full" />
            <div className="h-3 bg-surface-dark rounded w-5/6" />
            <div className="h-3 bg-surface-dark rounded w-4/6" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-9 bg-surface-dark rounded-xl w-28" />
            <div className="h-9 bg-surface-dark rounded-xl w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
