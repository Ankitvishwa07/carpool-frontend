import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { showToast } from '../utils/toast';

export default function SignupPage() {
  const signup = useAuthStore((s) => s.signup);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'rider' });
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
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email address is required';
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await signup(form.name, form.email, form.password, form.role);
    setSubmitting(false);

    if (result.success) {
      showToast('Account created successfully! Welcome to Current.', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message || 'Signup failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F5] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 mx-auto mb-4 flex items-center justify-center text-[#16A34A] font-black shadow-xs">
              <div className="w-5 h-5 rounded-md bg-[#16A34A]" />
            </div>
            <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
              Create Account<span className="text-[#16A34A]">.</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Join Current mobility network</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                required
                className="w-full glass-input rounded-2xl px-4 py-3.5 text-xs font-semibold focus-ring"
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
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
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-1.5">
                Password <span className="text-slate-400 font-normal">(min 8 chars)</span>
              </label>
              <div className="relative">
                <input
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-xs font-semibold px-1 focus-ring rounded-lg"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'rider' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all focus-ring ${
                    form.role === 'rider'
                      ? 'bg-[#DCFCE7] border-emerald-300 text-[#14532D] font-extrabold shadow-xs'
                      : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className="font-bold text-xs block">🧳 Rider</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Book seats</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'driver' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all focus-ring ${
                    form.role === 'driver'
                      ? 'bg-[#DCFCE7] border-emerald-300 text-[#14532D] font-extrabold shadow-xs'
                      : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className="font-bold text-xs block">🚘 Driver</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Post trips</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl btn-brand font-black text-xs shadow-md transition-all focus-ring mt-2"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-8 text-center">
            Already registered?{' '}
            <Link to="/login" className="text-[#16A34A] font-bold hover:underline focus-ring rounded-lg">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}