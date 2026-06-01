export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="mb-6 h-10 w-full max-w-sm rounded-xl bg-gray-200 animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 flex flex-col gap-2">
              <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
              <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
