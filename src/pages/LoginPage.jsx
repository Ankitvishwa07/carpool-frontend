import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { showToast } from '../utils/toast';
import { loginSchema, validateWithZod } from '../utils/validation';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const { isValid, errors } = validateWithZod(loginSchema, form);
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const success = await login(form.email, form.password);
    setSubmitting(false);
    if (success) {
      showToast('Welcome back to Current!', 'success');
      navigate('/dashboard');
    } else {
      const latestError = useAuthStore.getState().error;
      if (latestError) showToast(latestError, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F5] flex items-center justify-center px-4 py-12">
      {/* Background Soft Emerald Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 mx-auto mb-4 flex items-center justify-center text-[#16A34A] font-black shadow-xs">
              <div className="w-5 h-5 rounded-md bg-[#16A34A]" />
            </div>
            <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
              Current<span className="text-[#16A34A]">.</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-1.5 cursor-pointer">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alex@company.com"
                required
                className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs font-semibold focus-ring"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 cursor-pointer">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#16A34A] hover:underline font-bold focus-ring rounded-lg">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs font-semibold pr-12 focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-1 focus-ring rounded-lg"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl btn-brand font-black text-xs shadow-md transition-all focus-ring mt-2"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-8 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#16A34A] font-bold hover:underline focus-ring rounded-lg">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}