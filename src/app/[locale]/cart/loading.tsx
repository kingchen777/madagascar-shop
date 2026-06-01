export default function CartLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-pulse">
      <div className="h-7 w-32 rounded-lg bg-gray-200 mb-8" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-20 w-20 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-100" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3.5 w-24 rounded bg-gray-200" />
                  <div className="h-3.5 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="h-11 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
