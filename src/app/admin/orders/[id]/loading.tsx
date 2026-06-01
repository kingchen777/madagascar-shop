export default function AdminOrderDetailLoading() {
  return (
    <div className="p-6 max-w-5xl space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-6 w-36 rounded-lg bg-gray-200" />
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-7 w-32 rounded-full bg-gray-200" />
      </div>
      <div className="h-3.5 w-64 rounded bg-gray-100" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="h-4 w-16 rounded bg-gray-200" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-48 rounded bg-gray-200" />
                  <div className="h-3 w-32 rounded bg-gray-100" />
                </div>
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-20 rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-3.5 w-32 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-3 w-28 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
