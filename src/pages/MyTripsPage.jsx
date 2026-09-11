import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyTrips, cancelTrip } from '../api/trips';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyTrips();
      const list = Array.isArray(data) ? data : data?.trips || [];
      setTrips(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCancel = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    setCancellingId(tripId);
    try {
      await cancelTrip(tripId);
      showToast('Trip cancelled successfully', 'success');
      await fetchTrips();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel trip';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const activeCount = trips.filter((t) => ['active', 'full'].includes(t.status)).length;
  const completedCount = trips.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Trip Summary (4 cols - Light Mint Green accent card) */}
        <div className="lg:col-span-4 glass-card-dark rounded-3xl p-6 sm:p-8 space-y-8">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#14532D] tracking-tight">Driver Summary</h2>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block">
                TOTAL OFFERED TRIPS
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {trips.length}
              </span>
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block">
                ACTIVE RIDES
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {activeCount}
              </span>
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A34A] block">
                COMPLETED COMMUTES
              </span>
              <span className="font-heading font-extrabold text-6xl sm:text-7xl text-slate-900 mt-1 block tracking-tight">
                {completedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: All Offered Trips (8 cols - Crisp White Card) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">My Offered Rides</h2>
            <Link
              to="/post-trip"
              className="px-4 py-2 rounded-xl btn-brand text-xs font-bold shadow-xs focus-ring"
            >
              + Post New Ride
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchTrips} />
          ) : trips.length === 0 ? (
            <EmptyState
              icon="🛵"
              title="No trips offered yet"
              description="Share your empty seats with co-commuters to save fuel costs and CO2."
              actionLabel="Offer a Ride"
              onAction={() => navigate('/post-trip')}
            />
          ) : (
            <div className="space-y-3">
              {trips.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/trips/${t._id}`)}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#16A34A]/50 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200">
                      🚗
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                        {t.origin?.address?.split(',')[0] || 'Origin'} <span className="text-[#16A34A]">→</span> {t.destination?.address?.split(',')[0] || 'Destination'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        🕒 {formatDateTime(t.departureTime)} • 💺 {t.seatsBooked}/{t.seatsTotal} booked
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-50">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-[#16A34A] border border-emerald-200">
                      {t.status}
                    </span>

                    {['active', 'full'].includes(t.status) && (
                      <button
                        onClick={(e) => handleCancel(e, t._id)}
                        disabled={cancellingId === t._id}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                      >
                        {cancellingId === t._id ? 'Cancelling...' : 'Cancel'}
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