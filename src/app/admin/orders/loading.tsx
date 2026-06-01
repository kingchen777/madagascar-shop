export default function AdminOrdersLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 rounded-lg bg-gray-200" />
        <div className="h-8 w-32 rounded-lg bg-gray-200" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-5 w-8 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="bg-gray-50 px-4 py-3 flex gap-4">
          {[40, 80, 100, 60, 60, 80, 80, 60].map((w, i) => (
            <div key={i} className={`h-3 rounded bg-gray-200`} style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="h-4 w-4 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-24 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
              <div className="h-3.5 w-32 rounded bg-gray-200" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
              <div className="h-3.5 w-24 rounded bg-gray-200" />
              <div className="h-6 w-28 rounded-full bg-gray-200" />
              <div className="h-3.5 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
