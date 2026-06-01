export default function AdminSettingsLoading() {
  return (
    <div className="p-6 max-w-2xl space-y-6 animate-pulse">
      <div className="h-6 w-28 rounded-lg bg-gray-200" />

      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
            <div className="h-9 w-36 rounded-lg bg-gray-200 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
