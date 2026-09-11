import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { showToast } from '../utils/toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing its token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setStatus('saving');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setStatus('done');
      showToast('Password reset successfully! Redirecting to login...', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
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
              🔒
            </div>
            <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-500 mt-1">Create strong password for your account</p>
          </div>

          {status === 'done' ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs text-center space-y-2">
              <span className="text-3xl block">✅</span>
              <p className="font-extrabold text-sm text-slate-900">Password Updated!</p>
              <p>Redirecting to login...</p>
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
                  New Password <span className="text-slate-400 font-normal">(min 8 chars)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs font-semibold pr-12 focus-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-1 focus-ring rounded-lg"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full py-4 rounded-2xl btn-brand font-black text-xs shadow-md transition-all focus-ring"
              >
                {status === 'saving' ? 'Saving password...' : 'Update Password'}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-500 mt-6 text-center">
            <Link to="/login" className="text-[#16A34A] font-bold hover:underline focus-ring rounded-lg">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}