import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { showToast } from '../components/Toast';

export default function SignupPage() {
  const signup = useAuthStore((s) => s.signup);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'rider' });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signup(form.name, form.email, form.password, form.role);
    setSubmitting(false);
    if (result.success) {
      setSuccessMessage(result.message);
      showToast('Account created successfully! Check your email to verify.', 'success');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      showToast(result.message || 'Signup failed', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Glow background accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 mx-auto mb-4 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                ✨
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-100 tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">Join thousands commuting smarter every day</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <span className="text-base shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <span className="text-base shrink-0">🎉</span>
              <span>{successMessage} Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                required
                className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-slate-500 font-normal text-[11px]">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'rider' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    form.role === 'rider'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl block mb-1">🧳</span>
                  <span className="font-semibold text-xs block text-slate-100">Find Rides</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Book seats as a rider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'driver' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    form.role === 'driver'
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl block mb-1">🚘</span>
                  <span className="font-semibold text-xs block text-slate-100">Offer Rides</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Post trips as a driver</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create CommuteShare Account</span>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-8 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}