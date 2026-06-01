export default function LoginLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md animate-pulse">
        <div className="text-center mb-8 space-y-3">
          <div className="inline-block h-14 w-14 rounded-2xl bg-gray-200" />
          <div className="h-6 w-40 rounded bg-gray-200 mx-auto" />
          <div className="h-4 w-56 rounded bg-gray-100 mx-auto" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
          <div className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-100" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-100" />
          </div>
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-100 mx-auto" />
        </div>
      </div>
    </div>
  );
}
