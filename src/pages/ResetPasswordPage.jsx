import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | done

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }

    setStatus('saving');
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setStatus('done');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-semibold mb-6">Set a new password</h1>

        {status === 'done' ? (
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
            Password reset. Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <label className="block text-sm text-gray-600 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
            />

            <button
              type="submit"
              disabled={status === 'saving'}
              className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {status === 'saving' ? 'Saving...' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          <Link to="/login" className="text-indigo-600">Back to login</Link>
        </p>
      </div>
    </div>
  );
}