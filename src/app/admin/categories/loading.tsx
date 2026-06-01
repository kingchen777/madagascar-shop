export default function AdminCategoriesLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 rounded-lg bg-gray-200" />
        <div className="h-9 w-36 rounded-xl bg-gray-200" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="bg-gray-50 px-4 py-3 flex gap-6">
          {[100, 80, 60, 60].map((w, i) => (
            <div key={i} className="h-3 rounded bg-gray-200" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-6">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-4 w-16 rounded bg-gray-100" />
              <div className="ml-auto flex gap-2">
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
