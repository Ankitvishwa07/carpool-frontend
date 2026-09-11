import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { showToast } from '../utils/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
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
    <div className="min-h-screen bg-[#F4F9F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 mx-auto mb-4 flex items-center justify-center text-[#16A34A] font-black shadow-xs">
              🔑
            </div>
            <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-500 mt-1">Enter registered email for password recovery</p>
          </div>

          {status === 'sent' ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs text-center space-y-2">
              <span className="text-3xl block">📩</span>
              <p className="font-extrabold text-sm text-slate-900">Check your inbox</p>
              <p>We've dispatched a recovery link if that email exists.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs font-semibold focus-ring"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-4 rounded-2xl btn-brand font-black text-xs shadow-md transition-all focus-ring"
              >
                {status === 'sending' ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-500 mt-6 text-center">
            Remembered?{' '}
            <Link to="/login" className="text-[#16A34A] font-bold hover:underline focus-ring rounded-lg">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}