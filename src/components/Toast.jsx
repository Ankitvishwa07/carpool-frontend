import { useState, useEffect } from 'react';

let toastListener = null;

export function showToast(message, type = 'info') {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl backdrop-blur-md border text-sm transition-all duration-300 transform translate-y-0 animate-bounce-once ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/30 text-rose-200 shadow-rose-950/50'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/50'
              : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-200 shadow-indigo-950/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base shrink-0">
              {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✨' : 'ℹ️'}
            </span>
            <p className="font-medium leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
