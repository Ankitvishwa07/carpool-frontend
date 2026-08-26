import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTrips, cancelTrip, completeTrip } from '../api/trips';
import { getIncomingRequests, acceptRequest, declineRequest } from '../api/requests';
import { formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

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
      setTrips(Array.isArray(tripsRes) ? tripsRes : tripsRes?.trips || []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [tripsRes, requestsRes] = await Promise.all([getMyTrips(), getIncomingRequests()]);
        if (active) {
          setTrips(Array.isArray(tripsRes) ? tripsRes : tripsRes?.trips || []);
          setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.requests || []);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load your trips');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runAction = async (id, fn, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      showToast(successMsg, 'success');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      showToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = (id) => {
    if (!confirm('Cancel this trip? Accepted riders will be notified.')) return;
    runAction(id, () => cancelTrip(id), 'Trip cancelled successfully');
  };

  const handleComplete = (id) => {
    runAction(id, () => completeTrip(id), 'Trip marked as completed!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-400">Loading your trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  const requestsByTrip = requests.reduce((acc, r) => {
    const tripId = r.tripId?._id;
    if (tripId) {
      acc[tripId] = acc[tripId] || [];
      acc[tripId].push(r);
    }
    return acc;
  }, {});

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'full':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>🚘</span> My Posted Trips
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your trips, approve incoming rider requests, and update ride statuses.
          </p>
        </div>
        <Link
          to="/post-trip"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0 text-center"
        >
          ➕ Post New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <span className="text-4xl block opacity-40">🚘</span>
          <p className="text-sm font-semibold text-slate-300">You haven't posted any trips yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Offer your extra seats when commuting and save money while helping co-commuters.
          </p>
          <Link
            to="/post-trip"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Post Your First Trip
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const pendingRequests = requestsByTrip[trip._id]?.filter((r) => r.status === 'pending') || [];

            return (
              <div key={trip._id} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadgeClass(trip.status)}`}>
                        {trip.status}
                      </span>
                      {trip.isRecurring && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                          🔁 Weekly Recurring
                        </span>
                      )}
                    </div>

                    {/* Route preview */}
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className="truncate">{trip.origin?.address || 'Origin'}</span>
                      <span className="text-indigo-400">→</span>
                      <span className="truncate">{trip.destination?.address || 'Destination'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>🕒 Departs: {formatDateTime(trip.departureTime)}</span>
                      <span>•</span>
                      <span>💺 {trip.seatsBooked} / {trip.seatsTotal} seats booked</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <Link
                      to={`/trips/${trip._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                    >
                      View Details
                    </Link>

                    {['active', 'full'].includes(trip.status) && (
                      <>
                        <button
                          disabled={busyId === trip._id}
                          onClick={() => handleComplete(trip._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                        <button
                          disabled={busyId === trip._id}
                          onClick={() => handleCancel(trip._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        🙋‍♂️ Pending Rider Requests ({pendingRequests.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pendingRequests.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center">
                              {r.riderId?.name?.[0]?.toUpperCase() || 'R'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-100">{r.riderId?.name || 'Rider'}</span>
                              <span className="text-slate-400 ml-2">⭐ {r.riderId?.ratingAverage?.toFixed(1) ?? 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={busyId === r._id}
                              onClick={() => runAction(r._id, () => acceptRequest(r._id), `Accepted request from ${r.riderId?.name || 'rider'}`)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
                            >
                              Accept
                            </button>
                            <button
                              disabled={busyId === r._id}
                              onClick={() => runAction(r._id, () => declineRequest(r._id), 'Declined rider request')}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50 border border-slate-700"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}