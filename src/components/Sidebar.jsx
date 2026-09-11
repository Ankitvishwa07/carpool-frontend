import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Trip Search', path: '/search' },
    { label: 'My Trips', path: '/my-trips' },
    { label: 'My Requests', path: '/my-requests' },
    { label: 'Post Trip', path: '/post-trip', driverOnly: true },
    { label: 'Profile', path: '/profile' },
    { label: 'Admin', path: '/admin', adminOnly: true },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly) return user?.role === 'admin';
    if (item.driverOnly) return user?.role === 'driver' || user?.role === 'admin';
    return true;
  });

  return (
    <>
      {/* Desktop Sidebar (Fixed 64) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen sticky top-0 bg-white border-r border-emerald-100 p-6 z-30 shrink-0 shadow-xs">
        <div className="space-y-8">
          {/* Brand Logo - Current. */}
          <Link to="/dashboard" className="flex items-center gap-3 group focus-ring rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#16A34A] font-black shadow-xs group-hover:scale-105 transition-transform border border-emerald-200">
              <div className="w-4 h-4 rounded-md bg-[#16A34A]" />
            </div>
            <span className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              Current<span className="text-[#16A34A]">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {filteredItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 focus-ring ${
                    active
                      ? 'bg-emerald-100 text-[#14532D] border border-emerald-300 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/80'
                  }`}
                >
                  {/* Radio-style indicator circle */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Driver Status Badge (Fresh Light Mint Green accent) */}
        <div className="p-4 rounded-2xl bg-[#DCFCE7] text-[#14532D] border border-emerald-300 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#15803D] block">
            DRIVER STATUS
          </span>
          <div className="flex items-center gap-2 text-xs font-bold text-[#14532D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Accepting Rides</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md p-6 flex flex-col justify-between animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-6 flex-1 flex flex-col justify-between border border-emerald-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-black border border-emerald-200">
                    <div className="w-3.5 h-3.5 rounded-md bg-[#16A34A]" />
                  </div>
                  <span className="font-heading font-black text-xl text-slate-900">Current.</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                {filteredItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold ${
                        active
                          ? 'bg-emerald-100 text-[#14532D] border border-emerald-300'
                          : 'text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          active ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300'
                        }`}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 rounded-2xl bg-[#DCFCE7] text-[#14532D] border border-emerald-300">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#15803D] block">
                DRIVER STATUS
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#14532D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Accepting Rides</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


