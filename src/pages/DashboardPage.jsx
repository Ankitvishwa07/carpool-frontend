import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getMyTrips } from '../api/trips';
import { getMyRequests } from '../api/requests';
import { SkeletonCard } from '../components/Skeleton';
import { formatDateTime } from '../utils/format';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [myTrips, setMyTrips] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [tripsRes, reqsRes] = await Promise.allSettled([getMyTrips(), getMyRequests()]);
        if (!active) return;

        if (tripsRes.status === 'fulfilled') {
          const list = Array.isArray(tripsRes.value) ? tripsRes.value : tripsRes.value?.trips || [];
          setMyTrips(list);
        }
        if (reqsRes.status === 'fulfilled') {
          const list = Array.isArray(reqsRes.value) ? reqsRes.value : reqsRes.value?.requests || [];
          setMyRequests(list);
        }
      } catch {
        // non-fatal fallback
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate(`/search?origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}`);
  };

  const activeTrip = myTrips.find((t) => ['active', 'full'].includes(t.status)) || myTrips[0];
  const upcomingCount = myTrips.length + myRequests.filter((r) => r.status === 'accepted').length;
  const co2SavedKg = Math.round(upcomingCount * 4.2 + 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Main Grid: Left Hero Highlight (8 cols - Fresh Light Mint Green Card) + Right Stats (4 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card (Light Mint Green accent identity block) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#DCFCE7] via-[#E8F5E9] to-white border border-emerald-300/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[220px] shadow-xs">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-[#15803D]">
              <span>CURRENT COMMUTE</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#166534] font-medium font-sans">STATUS</span>
                <span className="text-sm font-extrabold text-[#14532D] uppercase px-3 py-1 rounded-full bg-white border border-emerald-300 shadow-2xs">
                  {activeTrip?.status || 'Ready'}
                </span>
              </div>
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#14532D] tracking-tight leading-tight">
              {activeTrip ? (
                <>
                  {activeTrip.origin?.address?.split(',')[0] || 'Origin'} <br />
                  <span className="text-[#16A34A]">→</span> {activeTrip.destination?.address?.split(',')[0] || 'Destination'}
                </>
              ) : (
                <>
                  Connect & Share <br />
                  <span className="text-[#16A34A]">Daily Eco-Friendly Commutes</span>
                </>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 relative z-10">
            <button
              onClick={() => navigate(activeTrip ? `/trips/${activeTrip._id}` : '/search')}
              className="px-6 py-3.5 rounded-full btn-brand text-xs font-black shadow-md transition-all flex items-center gap-2 focus-ring"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>{activeTrip ? 'View Trip Detail' : 'Explore Available Rides'}</span>
            </button>

            {user?.role === 'driver' && (
              <button
                onClick={() => navigate('/post-trip')}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-emerald-50 text-[#14532D] text-xs font-bold transition-all border border-emerald-300 focus-ring shadow-2xs"
              >
                + Offer a Ride
              </button>
            )}
          </div>
        </div>

        {/* Right Stats Column: Monthly Trips & CO2 Saved (Crisp White Cards with Light Green Highlights) */}
        <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {/* Monthly Trips Stat */}
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16A34A]">
              TOTAL ACTIVE RIDES
            </span>
            <div className="mt-4">
              <div className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none">
                {upcomingCount}
              </div>
              <p className="text-xs font-bold text-[#16A34A] mt-2">+15% active engagement</p>
            </div>
          </div>

          {/* CO2 Saved Stat */}
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#16A34A]">
              ESTIMATED CO2 SAVED
            </span>
            <div className="mt-4 space-y-2">
              <div className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-none flex items-baseline gap-1.5">
                <span>{co2SavedKg}</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#16A34A]">kg</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Left "Find a ride" (5 cols) + Right "Scheduled Rides" (7 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Find a ride widget (Crisp White Card with Green Form Controls) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Quick Ride Search</h3>

          <form onSubmit={handleQuickSearch} className="space-y-4">
            <div className="space-y-3">
              <div className="relative flex items-center">
                <span className="absolute left-4 w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <input
                  type="text"
                  placeholder="Pickup Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold placeholder:text-slate-400 focus-ring"
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-4 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold placeholder:text-slate-400 focus-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl btn-brand text-xs font-black shadow-md focus-ring mt-2"
            >
              Search Availability
            </button>
          </form>
        </div>

        {/* Scheduled Rides (Crisp White Card with Light Green Badges) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Your Scheduled Rides</h3>
            <Link to="/my-trips" className="text-xs text-[#16A34A] hover:underline font-bold focus-ring rounded-lg">
              View All Rides →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : myTrips.length === 0 && myRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center space-y-2">
              <span className="text-3xl block">🚗</span>
              <p className="text-sm font-bold text-slate-800">No scheduled rides yet</p>
              <p className="text-xs text-slate-500">Find a ride or post your route to start carpooling.</p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/search')}
                  className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold"
                >
                  Search Rides
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrips.slice(0, 3).map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/trips/${t._id}`)}
                  className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between gap-4 hover:border-[#16A34A]/40 hover:bg-emerald-50/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16A34A] font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      🚗
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                        {t.origin?.address?.split(',')[0] || 'Origin'} → {t.destination?.address?.split(',')[0] || 'Destination'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {formatDateTime(t.departureTime)} • 💺 {t.seatsTotal - t.seatsBooked} seats left
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-[#16A34A] border border-emerald-200 shrink-0">
                    {t.status}
                  </span>
                </div>
              ))}

              {myRequests.slice(0, 2).map((r) => (
                <div
                  key={r._id}
                  onClick={() => navigate(r.tripId?._id ? `/trips/${r.tripId._id}` : '/my-requests')}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 hover:border-[#16A34A]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16A34A] font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      🙋‍♂️
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                        Request for {r.tripId?.origin?.address?.split(',')[0] || 'Trip'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Status: <span className="capitalize font-bold text-slate-700">{r.status}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-200 text-slate-700 shrink-0">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}