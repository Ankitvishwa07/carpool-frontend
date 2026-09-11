import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = '🚘',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="glass-card rounded-3xl p-10 sm:p-14 text-center border border-emerald-100 space-y-4 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#16A34A] text-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
        <span>{icon}</span>
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="font-heading font-extrabold text-base text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-brand text-xs font-extrabold shadow-sm transition-all focus-ring"
            >
              {actionLabel}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-brand text-xs font-extrabold shadow-sm transition-all focus-ring"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

