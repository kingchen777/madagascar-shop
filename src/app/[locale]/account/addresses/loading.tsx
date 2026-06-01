export default function AddressesLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
        <div className="h-6 w-32 rounded bg-gray-200" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded bg-gray-200" />
                <div className="h-3.5 w-40 rounded bg-gray-100" />
                <div className="h-3.5 w-24 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-7 w-7 rounded bg-gray-200 shrink-0" />
          </div>
        ))}
      </div>

      <div className="mt-4 h-10 w-40 rounded-lg bg-gray-200" />
    </div>
  );
}
