import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRequests, cancelRequest } from '../api/requests';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyRequests();
      const list = Array.isArray(data) ? data : data?.requests || [];
      setRequests(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (e, reqId) => {
    e.stopPropagation();
    if (!window.confirm('Cancel this seat request?')) return;
    setCancellingId(reqId);
    try {
      await cancelRequest(reqId);
      showToast('Request cancelled', 'success');
      await fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel request';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Request Stats (4 cols - Light Mint Green accent card) */}
        <div className="lg:col-span-4 glass-card-dark rounded-3xl p-6 sm:p-8 space-y-8">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14532D] tracking-tight">Rider Overview</h2>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block">
                ACCEPTED RIDES
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {acceptedCount}
              </span>
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 block">
                PENDING APPROVAL
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {pendingCount}
              </span>
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-700 block">
                DECLINED / OTHER
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {declinedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Recent Requests (8 cols - Crisp White Card) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">My Seat Requests</h2>
            <Link to="/search" className="text-xs text-[#16A34A] hover:underline font-bold focus-ring rounded-lg">
              Find more rides →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchRequests} />
          ) : requests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No seat requests yet"
              description="Search for trips heading your direction and book your seat easily."
              actionLabel="Search Rides"
              onAction={() => navigate('/search')}
            />
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r._id}
                  onClick={() => r.tripId?._id && navigate(`/trips/${r.tripId._id}`)}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#16A34A]/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                      {r.tripId?.origin?.address?.split(',')[0] || 'Origin'} <span className="text-[#16A34A]">→</span> {r.tripId?.destination?.address?.split(',')[0] || 'Destination'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      🕒 {r.tripId?.departureTime ? formatDateTime(r.tripId.departureTime) : 'Scheduled Trip'}
                    </p>
                    {r.pickupNote && <p className="text-xs text-slate-400 italic">Note: "{r.pickupNote}"</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-50">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold capitalize bg-emerald-100 text-[#16A34A] border border-emerald-200">
                      {r.status}
                    </span>

                    {['pending', 'accepted'].includes(r.status) && (
                      <button
                        onClick={(e) => handleCancel(e, r._id)}
                        disabled={cancellingId === r._id}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                      >
                        {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}