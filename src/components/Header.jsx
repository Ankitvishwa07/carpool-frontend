import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const PAGE_TITLES = {
  '/dashboard': 'Ride Overview',
  '/search': 'Search Trips',
  '/my-trips': 'My Trips',
  '/my-requests': 'My Requests',
  '/post-trip': 'Post Trip',
  '/profile': 'Profile & Settings',
  '/admin': 'Admin Control Center',
};

export default function Header({ onMobileMenuToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'Ride Overview';

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
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

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-emerald-100/80 dark:border-slate-800 px-4 sm:px-8 py-5 flex items-center justify-between z-20 shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 focus-ring"
          aria-label="Open mobile navigation menu"
        >
          ☰
        </button>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <NotificationBell />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((p) => !p)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-[#16A34A] transition-all focus-ring"
              aria-label="User profile menu"
              aria-expanded={profileDropdownOpen}
            >
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#14532D] font-extrabold text-sm flex items-center justify-center shadow-xs border-2 border-[#16A34A]">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-emerald-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2 divide-y divide-emerald-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-emerald-50/50">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors"
                  >
                    <span>👤</span> Profile Settings
                  </Link>
                  <Link
                    to="/my-trips"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors"
                  >
                    <span>🛵</span> My Trips
                  </Link>
                  <Link
                    to="/my-requests"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#16A34A] transition-colors"
                  >
                    <span>📋</span> My Requests
                  </Link>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


