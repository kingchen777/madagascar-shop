export default function AdminProductsLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-36 rounded-lg bg-gray-200" />
        <div className="h-9 w-36 rounded-xl bg-gray-200" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="bg-gray-50 px-4 py-3 flex gap-6">
          {[120, 60, 80, 80, 60, 60, 80].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-200" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-6">
              <div className="h-12 w-12 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
              <div className="h-3.5 w-20 rounded bg-gray-100" />
              <div className="h-6 w-14 rounded-full bg-gray-200" />
              <div className="h-6 w-14 rounded-full bg-gray-200" />
              <div className="h-3.5 w-24 rounded bg-gray-200" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-lg bg-gray-200" />
                <div className="h-7 w-7 rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
