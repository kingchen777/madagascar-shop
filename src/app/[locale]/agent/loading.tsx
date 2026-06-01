export default function AgentLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-gray-200 mb-3" />
      <div className="h-4 w-96 rounded bg-gray-100 mb-10" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-10 rounded-lg bg-gray-100" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-9 rounded-lg bg-gray-100" />
                </div>
              ))}
            </div>
            <div className="h-24 rounded-lg bg-gray-100" />
            <div className="h-11 rounded-xl bg-gray-200" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-32 rounded bg-gray-200" />
                <div className="h-3 w-48 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
