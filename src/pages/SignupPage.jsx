import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const signup = useAuthStore((s) => s.signup);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'rider' });
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
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-semibold mb-6">Create your account</h1>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-2 rounded">{successMessage}</div>
        )}

        <label className="block text-sm text-gray-600 mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        />

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
          minLength={8}
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm text-gray-600 mb-1">I want to</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
        >
          <option value="rider">Find rides (rider)</option>
          <option value="driver">Offer rides (driver)</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
        </p>
      </form>
    </div>
  );
}