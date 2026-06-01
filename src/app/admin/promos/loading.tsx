export default function AdminPromosLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 w-36 rounded-lg bg-gray-200" />

      {/* Create form skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-gray-200" />
              <div className="h-9 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="h-9 w-28 rounded-xl bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="bg-gray-50 px-4 py-3 flex gap-6">
          {[80, 60, 60, 80, 60, 60, 80].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-200" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-6">
              <div className="h-4 w-24 rounded bg-gray-200 font-mono" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
              <div className="h-3.5 w-20 rounded bg-gray-200" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
              <div className="h-3.5 w-20 rounded bg-gray-100" />
              <div className="h-6 w-12 rounded-full bg-gray-200 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
