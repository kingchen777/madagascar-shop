export default function AdminDashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded-lg bg-gray-200" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="h-6 w-12 rounded bg-gray-200" />
            <div className="h-3 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Two panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3.5 w-16 rounded bg-gray-100" />
            </div>
            <ul className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, j) => (
                <li key={j} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                  <div className="h-5 w-20 rounded-full bg-gray-200" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
