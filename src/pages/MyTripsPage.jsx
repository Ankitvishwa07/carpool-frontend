import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTrips, cancelTrip, completeTrip } from '../api/trips';
import { getIncomingRequests, acceptRequest, declineRequest } from '../api/requests';
import { formatDateTime } from '../utils/format';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tripsRes, requestsRes] = await Promise.all([getMyTrips(), getIncomingRequests()]);
      setTrips(tripsRes.trips);
      setRequests(requestsRes.requests);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = (id) => {
    if (!confirm('Cancel this trip? Accepted riders will be notified.')) return;
    runAction(id, () => cancelTrip(id));
  };

  const handleComplete = (id) => {
    runAction(id, () => completeTrip(id));
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-8 text-red-600">{error}</div>;

  const requestsByTrip = requests.reduce((acc, r) => {
    const tripId = r.tripId._id;
    acc[tripId] = acc[tripId] || [];
    acc[tripId].push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">My trips</h1>

      {trips.length === 0 && <p className="text-gray-500 text-sm">You haven't posted any trips yet.</p>}

      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip._id} className="bg-white border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {trip.origin.address || 'Origin'} → {trip.destination.address || 'Destination'}
                </p>
                <p className="text-sm text-gray-500">
                  Departs {formatDateTime(trip.departureTime)} · {trip.seatsBooked}/{trip.seatsTotal} seats booked ·
                  {' '}<span className="capitalize">{trip.status}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/trips/${trip._id}`} className="text-sm text-gray-600 hover:underline">
                  View
                </Link>
                {['active', 'full'].includes(trip.status) && (
                  <button
                    disabled={busyId === trip._id}
                    onClick={() => handleComplete(trip._id)}
                    className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
                  >
                    Mark completed
                  </button>
                )}
                {['active', 'full'].includes(trip.status) && (
                  <button
                    disabled={busyId === trip._id}
                    onClick={() => handleCancel(trip._id)}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {requestsByTrip[trip._id]?.filter((r) => r.status === 'pending').length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Pending requests</p>
                {requestsByTrip[trip._id]
                  .filter((r) => r.status === 'pending')
                  .map((r) => (
                    <div key={r._id} className="flex items-center justify-between text-sm">
                      <span>{r.riderId.name} · ★ {r.riderId.ratingAverage?.toFixed(1) ?? 'N/A'}</span>
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === r._id}
                          onClick={() => runAction(r._id, () => acceptRequest(r._id))}
                          className="text-green-600 hover:underline disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          disabled={busyId === r._id}
                          onClick={() => runAction(r._id, () => declineRequest(r._id))}
                          className="text-gray-500 hover:underline disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}