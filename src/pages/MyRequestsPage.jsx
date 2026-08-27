import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRequests, cancelRequest } from '../api/requests';
import { formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

const statusBadges = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  declined: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  cancelled: 'bg-slate-800 text-slate-400 border-slate-700',
  completed: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
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
      const res = await getMyRequests();
      setRequests(Array.isArray(res) ? res : res?.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your requests');
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
        const res = await getMyRequests();
        if (active) setRequests(Array.isArray(res) ? res : res?.requests || []);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load your requests');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this ride request?')) return;
    setBusyId(id);
    try {
      await cancelRequest(id);
      showToast('Ride request cancelled', 'info');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel request';
      showToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#7CA9FF] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-400">Loading your ride requests...</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📋</span> My Ride Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track the status of your requested seats and trip confirmations.
          </p>
        </div>
        <Link
          to="/search"
          className="px-4 py-2.5 rounded-xl bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950 text-xs font-extrabold shadow-md shadow-[#7CA9FF]/20 transition-all hover:scale-[1.02] shrink-0 text-center"
        >
          🔍 Search Rides
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <span className="text-4xl block opacity-40">🧳</span>
          <p className="text-sm font-bold text-white">You haven't requested any rides yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Find drivers travelling along your route and request seats for a hassle-free commute.
          </p>
          <Link
            to="/search"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#7CA9FF] text-slate-950 text-xs font-bold shadow-md shadow-[#7CA9FF]/20"
          >
            Find a Ride Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadges[r.status]}`}>
                    {r.status}
                  </span>
                </div>

                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="truncate">{r.tripId?.origin?.address || 'Origin'}</span>
                  <span className="text-[#7CA9FF]">→</span>
                  <span className="truncate">{r.tripId?.destination?.address || 'Destination'}</span>
                </div>

                <p className="text-xs text-slate-400 font-semibold">
                  🕒 Departs: {formatDateTime(r.tripId?.departureTime)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                {r.tripId?._id && (
                  <Link
                    to={`/trips/${r.tripId._id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors border border-slate-800"
                  >
                    View Details
                  </Link>
                )}
                {['pending', 'accepted'].includes(r.status) && (
                  <button
                    disabled={busyId === r._id}
                    onClick={() => handleCancel(r._id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}