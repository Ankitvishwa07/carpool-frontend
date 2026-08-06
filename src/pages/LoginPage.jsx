import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(form.email, form.password);
    setSubmitting(false);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-semibold mb-6">Log in</h1>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
        />

        <div className="text-right -mt-3">
          <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/signup" className="text-indigo-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}