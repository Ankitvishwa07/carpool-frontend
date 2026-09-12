import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      {/* Soft Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#16A34A]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 mx-auto flex items-center justify-center text-2xl font-black text-[#16A34A] shadow-xs">
          🧭
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#16A34A]">404 Error</span>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            The commute route or page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl btn-brand text-xs font-extrabold shadow-sm transition-all focus-ring"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
