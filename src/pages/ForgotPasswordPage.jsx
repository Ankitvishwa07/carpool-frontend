import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { showToast } from '../utils/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('sent');
      showToast('Password reset link sent! Check your email inbox.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
      showToast(msg, 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
              🔑
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-100">Reset Password</h1>
            <p className="text-xs text-slate-400 mt-1">Enter your registered email to receive a reset link</p>
          </div>

          {status === 'sent' ? (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
              <span className="text-2xl block">📩</span>
              <p className="font-semibold text-sm">Check your inbox</p>
              <p className="text-emerald-400">If that email exists in our system, we've sent a password reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Sending link...</span>
                  </>
                ) : (
                  <span>Send Password Reset Link</span>
                )}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-400 mt-6 text-center">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}