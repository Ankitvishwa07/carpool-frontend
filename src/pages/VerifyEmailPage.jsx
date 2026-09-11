import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(() => (token ? 'verifying' : 'error'));
  const [message, setMessage] = useState(() => (token ? '' : 'No verification token found in link.'));

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
    <div className="min-h-screen bg-[#F4F9F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 text-center border border-emerald-100 shadow-xl space-y-6">
          {status === 'verifying' && (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#16A34A] border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#16A34A] text-3xl flex items-center justify-center mx-auto border border-emerald-200">
                ✓
              </div>
              <h2 className="font-heading text-xl font-black text-slate-900">Email Verified!</h2>
              <p className="text-xs text-slate-600 font-medium">{message}</p>
              <Link
                to="/login"
                className="inline-block w-full py-4 rounded-2xl btn-brand text-xs shadow-md transition-all focus-ring font-black"
              >
                Proceed to Log in
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 text-3xl flex items-center justify-center mx-auto border border-rose-200">
                ⚠️
              </div>
              <h2 className="font-heading text-xl font-black text-slate-900">Verification Failed</h2>
              <p className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 font-semibold">{message}</p>
              <Link
                to="/login"
                className="inline-block text-xs text-[#16A34A] hover:underline font-bold focus-ring rounded-lg"
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