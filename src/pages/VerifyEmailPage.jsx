import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(() => (token ? 'verifying' : 'error'));
  const [message, setMessage] = useState(() => (token ? '' : 'No verification token found in the link.'));

  useEffect(() => {
    if (!token) return;
    let active = true;

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        if (active) {
          setStatus('success');
          setMessage(res.data.message);
        }
      })
      .catch((err) => {
        if (active) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed.');
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 text-center border border-slate-800 shadow-2xl space-y-6">
          {status === 'verifying' && (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-300">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 text-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                ✓
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-100">Email Verified!</h2>
              <p className="text-xs text-slate-400">{message}</p>
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-all"
              >
                Proceed to Log in
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-300 text-3xl flex items-center justify-center mx-auto border border-rose-500/30">
                ⚠️
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-100">Verification Failed</h2>
              <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">{message}</p>
              <Link
                to="/login"
                className="inline-block text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}