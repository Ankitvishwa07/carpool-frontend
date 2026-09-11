export default function ErrorState({
  message = 'Something went wrong while fetching data.',
  onRetry,
}) {
  return (
    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0 p-2 rounded-xl bg-rose-100 border border-rose-200">⚠️</span>
        <div>
          <p className="font-bold text-sm text-rose-900">Execution Alert</p>
          <p className="text-rose-700">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 focus-ring"
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}

