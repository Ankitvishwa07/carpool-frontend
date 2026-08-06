import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border text-center">
        {status === 'verifying' && <p className="text-gray-500">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-700 mb-4">{message}</p>
            <Link to="/login" className="text-indigo-600 text-sm">Go to login</Link>
          </>
        )}
        {status === 'error' && <p className="text-red-600">{message}</p>}
      </div>
    </div>
  );
}