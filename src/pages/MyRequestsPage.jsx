import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRequests, cancelRequest } from '../api/requests';
import { formatDateTime } from '../utils/format';

const statusColors = {
  pending: 'text-yellow-700 bg-yellow-50',
  accepted: 'text-green-700 bg-green-50',
  declined: 'text-red-700 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-50',
  completed: 'text-blue-700 bg-blue-50',
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const { requests } = await getMyRequests();
      setRequests(requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    setBusyId(id);
    try {
      await cancelRequest(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">My ride requests</h1>

      {requests.length === 0 && <p className="text-gray-500 text-sm">You haven't requested any rides yet.</p>}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">
                {r.tripId.origin.address || 'Origin'} → {r.tripId.destination.address || 'Destination'}
              </p>
              <p className="text-sm text-gray-500">Departs {formatDateTime(r.tripId.departureTime)}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[r.status]}`}>
                {r.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/trips/${r.tripId._id}`} className="text-sm text-gray-600 hover:underline">
                View
              </Link>
              {['pending', 'accepted'].includes(r.status) && (
                <button
                  disabled={busyId === r._id}
                  onClick={() => handleCancel(r._id)}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}