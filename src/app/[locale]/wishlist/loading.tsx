export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-7 w-36 rounded-lg bg-gray-200 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-100" />
              <div className="h-5 w-20 rounded bg-gray-200 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
