import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 focus-ring ${
      isActive(path)
        ? 'bg-[#7CA9FF] text-slate-950 shadow-md shadow-[#7CA9FF]/20 font-extrabold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
    }`;

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'driver':
        return 'bg-[#7CA9FF]/20 text-[#7CA9FF] border-[#7CA9FF]/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Rapido-inspired blue theme */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group focus-ring rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-[#7CA9FF] p-0.5 shadow-lg shadow-[#7CA9FF]/25 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl text-white tracking-tight leading-tight flex items-center gap-1">
              Commute<span className="text-[#7CA9FF]">Share</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest -mt-0.5">Funded Mobility</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {user ? (
            <>
              <Link to="/search" className={navLinkClass('/search')}>
                <span>🔍</span> Find Ride
              </Link>
              {(user.role === 'driver' || user.role === 'admin') && (
                <Link to="/post-trip" className={navLinkClass('/post-trip')}>
                  <span>🚘</span> Post Trip
                </Link>
              )}
              <Link to="/my-trips" className={navLinkClass('/my-trips')}>
                <span>🛵</span> My Trips
              </Link>
              <Link to="/my-requests" className={navLinkClass('/my-requests')}>
                <span>📋</span> Requests
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  <span>🛡️</span> Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>

        {/* Right Action Icons & User Profile Menu */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="h-5 w-px bg-slate-800"></div>

              {/* Profile Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((p) => !p)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 transition-all border border-slate-800 focus-ring"
                  aria-expanded={profileDropdownOpen}
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#7CA9FF] text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">{user.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${roleBadge(user.role)} leading-none uppercase mt-0.5 w-fit font-bold`}>
                      {user.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 ml-1">▾</span>
                </button>

                {/* Dropdown Menu Box */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#7CA9FF]/15 hover:text-[#7CA9FF] transition-colors"
                      >
                        <span>👤</span> Profile Settings
                      </Link>
                      <Link
                        to="/my-trips"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#7CA9FF]/15 hover:text-[#7CA9FF] transition-colors"
                      >
                        <span>🛵</span> My Trips
                      </Link>
                      <Link
                        to="/my-requests"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#7CA9FF]/15 hover:text-[#7CA9FF] transition-colors"
                      >
                        <span>📋</span> My Requests
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#7CA9FF] hover:bg-[#7CA9FF]/15 transition-colors"
                        >
                          <span>🛡️</span> Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <span>🚪</span> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-extrabold text-slate-300 hover:text-white transition-colors focus-ring rounded-xl"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-xs font-extrabold text-slate-950 bg-[#7CA9FF] hover:bg-[#6697FF] rounded-xl shadow-md shadow-[#7CA9FF]/20 transition-all duration-200 hover:scale-[1.02] focus-ring"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 bg-slate-900 border border-slate-800 focus-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#7CA9FF] text-slate-950 font-extrabold text-sm flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-900 font-bold text-xs"
              >
                🔍 Find Ride
              </Link>
              {(user.role === 'driver' || user.role === 'admin') && (
                <Link
                  to="/post-trip"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-900 font-bold text-xs"
                >
                  🚘 Post Trip
                </Link>
              )}
              <Link
                to="/my-trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-900 font-bold text-xs"
              >
                🛵 My Trips
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-900 font-bold text-xs"
              >
                📋 Requests
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-slate-200 hover:bg-slate-900 font-bold text-xs"
              >
                👤 Profile Settings
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-[#7CA9FF] hover:bg-slate-900 font-bold text-xs"
                >
                  🛡️ Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 font-bold text-xs"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-slate-200 bg-slate-900 rounded-xl font-bold text-xs"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-slate-950 bg-[#7CA9FF] rounded-xl font-extrabold text-xs"
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