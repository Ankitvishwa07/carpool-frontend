import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isDriver = user?.role === 'driver' || user?.role === 'admin';

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate(`/search?origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7CA9FF]/20 text-[#7CA9FF] border border-[#7CA9FF]/30">
              {user?.role === 'admin' ? '🛡️ Administrator' : isDriver ? '🚘 Driver Partner' : '⚡ Rapido Commuter'}
            </span>
            {user?.ratingAverage != null && user.ratingAverage > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                ★ {user.ratingAverage.toFixed(1)} ({user.ratingCount || 0})
              </span>
            )}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-[#7CA9FF]">{user?.name}</span>
          </h1>
          <p className="text-xs text-slate-400">Where are you commuting today?</p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/search"
            className="px-4 py-2.5 rounded-xl bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950 text-xs font-bold shadow-md shadow-[#7CA9FF]/20 transition-all flex items-center gap-2"
          >
            <span>🔍</span> Find a Ride
          </Link>
          {isDriver && (
            <Link
              to="/post-trip"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
            >
              <span>🚘</span> Offer Seats
            </Link>
          )}
        </div>
      </div>

      {/* Main Split Grid: Left Rapido Booking Hero + Right Stats & Quick Actions */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Rapido Quick Search Widget & Route Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rapido Ride Booking Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7CA9FF]/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7CA9FF] animate-pulse"></span>
                <h2 className="font-heading font-extrabold text-lg text-white">Book Your Daily Commute</h2>
              </div>
              <span className="text-xs text-[#7CA9FF] font-semibold bg-[#7CA9FF]/10 px-2.5 py-1 rounded-lg border border-[#7CA9FF]/20">
                ⚡ Instant Matching
              </span>
            </div>

            <form onSubmit={handleQuickSearch} className="space-y-4">
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 relative">
                {/* Route Visual Line */}
                <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gradient-to-b from-emerald-500 via-[#7CA9FF] to-rose-500 rounded-full"></div>

                {/* Pickup Location */}
                <div className="flex items-center gap-3 pl-8 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                  <input
                    type="text"
                    placeholder="Enter pickup location (e.g. Downtown Metro)"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none py-1"
                  />
                </div>

                <div className="h-px bg-slate-800 ml-8"></div>

                {/* Dropoff Location */}
                <div className="flex items-center gap-3 pl-8 relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></span>
                  <input
                    type="text"
                    placeholder="Enter destination (e.g. Tech Park Gateway)"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none py-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Leaving</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">Today / Tomorrow</span>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Passengers</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">1 Seat</span>
                </div>
                <button
                  type="submit"
                  className="col-span-2 sm:col-span-1 bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950 font-extrabold rounded-xl py-3 text-sm shadow-lg shadow-[#7CA9FF]/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🔍</span> Search
                </button>
              </div>
            </form>
          </div>

          {/* Rapid Features Promo Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#7CA9FF]/10 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#7CA9FF] uppercase tracking-wider">🌱 Eco & Budget Friendly</span>
              <h3 className="font-heading font-bold text-base text-white">Save up to 60% on daily commute fuel costs</h3>
              <p className="text-xs text-slate-400">Verified campus and corporate commuters only.</p>
            </div>
            <div className="text-3xl shrink-0">🌿</div>
          </div>
        </div>

        {/* Right Column: Stats & Quick Hub Tiles (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Rides</span>
              <div className="text-2xl font-extrabold text-[#7CA9FF]">12</div>
              <span className="text-[11px] text-emerald-400 font-medium">↑ 3 this week</span>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">CO2 Reduced</span>
              <div className="text-2xl font-extrabold text-emerald-400">28 kg</div>
              <span className="text-[11px] text-slate-400 font-medium">Green commuter badge</span>
            </div>
          </div>

          {/* Quick Hub Options */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-300 uppercase tracking-wider">Quick Navigation</h3>

            <Link
              to="/search"
              className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#7CA9FF]/15 text-[#7CA9FF] border border-[#7CA9FF]/30 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                  🔍
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#7CA9FF] transition-colors">Find a Commute Ride</h4>
                  <p className="text-xs text-slate-400">Filter routes by distance, price, and departure time</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-[#7CA9FF] group-hover:translate-x-1 transition-all">→</span>
            </Link>

            {isDriver && (
              <Link
                to="/post-trip"
                className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                    🚘
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Post a New Trip</h4>
                    <p className="text-xs text-slate-400">Share your car seats & offset travel expenses</p>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all">→</span>
              </Link>
            )}

            <Link
              to="/my-trips"
              className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                  🛵
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">My Active & Past Trips</h4>
                  <p className="text-xs text-slate-400">Track current status and manage rider bookings</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-purple-300 group-hover:translate-x-1 transition-all">→</span>
            </Link>

            <Link
              to="/my-requests"
              className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                  📋
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Ride Requests</h4>
                  <p className="text-xs text-slate-400">View status of your submitted seat requests</p>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-amber-300 group-hover:translate-x-1 transition-all">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}