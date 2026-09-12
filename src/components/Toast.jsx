import { useState, useEffect } from 'react';
import { setToastListener } from '../utils/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastListener((newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    });
    return () => {
      setToastListener(null);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold transition-all duration-300 transform translate-y-0 animate-bounce-once ${
            toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200 shadow-rose-950/50'
              : toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
              : 'bg-slate-900/95 border-[#7CA9FF]/40 text-[#7CA9FF] shadow-black/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base shrink-0">
              {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✨' : '⚡'}
            </span>
            <p className="leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-white text-xs ml-3 p-1 rounded-lg focus-ring"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
