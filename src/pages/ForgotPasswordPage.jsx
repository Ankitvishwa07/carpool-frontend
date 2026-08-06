import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

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
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-semibold mb-6">Reset your password</h1>

        {status === 'sent' ? (
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
            If that email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 mb-6 text-sm"
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send reset link'}
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