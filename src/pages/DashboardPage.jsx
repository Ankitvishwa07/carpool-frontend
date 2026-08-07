import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === 'driver' || user?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute right-1/3 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role === 'admin' ? '🛡️ Administrator' : isDriver ? '🚘 Driver Mode' : '🧳 Rider Mode'}
              </span>
              {user?.ratingAverage != null && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  ⭐ {user.ratingAverage.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-300">{user?.name}</span> 👋
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              Find convenient carpool matches, manage your ride requests, and share your daily commute seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/search"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02] flex items-center gap-2"
            >
              <span>🔍</span> Find a Ride
            </Link>
            {isDriver && (
              <Link
                to="/post-trip"
                className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 text-sm font-semibold border border-slate-700/80 transition-all duration-200 hover:scale-[1.02] flex items-center gap-2"
              >
                <span>➕</span> Post Trip
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Actions */}
      <div>
        <h2 className="font-heading text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions & Hub
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            to="/search"
            className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl flex items-center justify-center mb-4 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                🔍
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                Find a Ride
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Search nearby drivers matching your commute route, departure time, and pick-up radius.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Search routes</span>
              <span>→</span>
            </div>
          </Link>

          {isDriver && (
            <>
              <Link
                to="/post-trip"
                className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl flex items-center justify-center mb-4 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Post a Trip
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Offer empty seats on your daily route and split fuel costs with verified co-commuters.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Create new trip</span>
                  <span>→</span>
                </div>
              </Link>

              <Link
                to="/my-trips"
                className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 text-2xl flex items-center justify-center mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    🚘
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
                    My Posted Trips
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Review incoming rider requests, approve passengers, and manage active trip itineraries.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Manage trips</span>
                  <span>→</span>
                </div>
              </Link>
            </>
          )}

          <Link
            to="/my-requests"
            className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 text-2xl flex items-center justify-center mb-4 border border-sky-500/30 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-sky-300 transition-colors">
                My Requests
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Track status updates on requested rides (Pending, Accepted, Declined, or Completed).
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>View ride requests</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/profile"
            className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 text-2xl flex items-center justify-center mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform">
                👤
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-purple-300 transition-colors">
                Profile & Car Info
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Update home/work location presets, vehicle details, seat availability, and driver preferences.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Edit profile</span>
              <span>→</span>
            </div>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="group glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 text-2xl flex items-center justify-center mb-4 border border-rose-500/30 group-hover:scale-110 transition-transform">
                  🛡️
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-100 group-hover:text-rose-300 transition-colors">
                  Admin Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Monitor platform performance, inspect user ratings, and manage driver verifications.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>Admin dashboard</span>
                <span>→</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}