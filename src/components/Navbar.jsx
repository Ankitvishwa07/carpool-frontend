import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'text-white bg-indigo-600/80 shadow-lg shadow-indigo-600/30 border border-indigo-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'driver':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🚗</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
              CommuteShare
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-mono uppercase tracking-wider">Carpool Hub</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/search" className={navLinkClass('/search')}>
                🔍 Find Ride
              </Link>
              {(user.role === 'driver' || user.role === 'admin') && (
                <Link to="/post-trip" className={navLinkClass('/post-trip')}>
                  ➕ Post Trip
                </Link>
              )}
              <Link to="/my-trips" className={navLinkClass('/my-trips')}>
                🚘 My Trips
              </Link>
              <Link to="/my-requests" className={navLinkClass('/my-requests')}>
                📋 My Requests
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  🛡️ Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>

        {/* Right Action Icons & User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="h-5 w-px bg-slate-800"></div>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800/60"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${roleBadge(user.role)} leading-none uppercase mt-0.5`}>
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-900/40"
                title="Logout"
              >
                🚪
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 bg-slate-800/60 border border-slate-700/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 mb-3">
                <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold text-sm flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                🔍 Find Ride
              </Link>
              {(user.role === 'driver' || user.role === 'admin') && (
                <Link
                  to="/post-trip"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  ➕ Post Trip
                </Link>
              )}
              <Link
                to="/my-trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                🚘 My Trips
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                📋 My Requests
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                👤 Profile Settings
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  🛡️ Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-slate-200 bg-slate-800 rounded-xl"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-white bg-indigo-600 rounded-xl"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}