import { useEffect, useState } from 'react';
import { getAdminUsers, flagUser, unflagUser, disableUser, enableUser, getAdminAnalytics } from '../api/admin';
import { showToast } from '../utils/toast';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, analyticsData] = await Promise.all([getAdminUsers({}), getAdminAnalytics()]);
      setUsers(Array.isArray(usersData) ? usersData : usersData?.users || []);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
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
        const [usersData, analyticsData] = await Promise.all([getAdminUsers({}), getAdminAnalytics()]);
        if (active) {
          setUsers(Array.isArray(usersData) ? usersData : usersData?.users || []);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load admin data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runAction = async (id, fn, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      showToast(successMsg, 'success');
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      showToast(msg, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-400">Loading admin analytics & user database...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>🛡️</span> Platform Admin Control Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor system metrics, review flagged accounts, and moderate user access.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Analytics Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ['Total Users', analytics.totalUsers, '👥', 'text-indigo-400'],
            ['Drivers', analytics.totalDrivers, '🚘', 'text-emerald-400'],
            ['Total Trips', analytics.totalTrips, '🗺️', 'text-sky-400'],
            ['Active Trips', analytics.activeTrips, '⚡', 'text-amber-400'],
            ['Pending Requests', analytics.pendingRequests, '📋', 'text-purple-400'],
            ['Avg Rating', analytics.platformAverageRating?.toFixed(1) || '5.0', '⭐', 'text-yellow-400'],
          ].map(([label, value, icon, colorClass]) => (
            <div key={label} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">{label}</span>
                <span className="text-base">{icon}</span>
              </div>
              <p className={`font-heading text-2xl font-extrabold ${colorClass}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* User Management Console */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-bold text-slate-200">
            User Accounts Database ({filteredUsers.length})
          </h2>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter users by name or email..."
            className="glass-input rounded-xl px-4 py-2 text-xs w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">
                    ⭐ {u.ratingAverage?.toFixed(1) ?? 'N/A'} <span className="text-slate-500">({u.ratingCount})</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {!u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Disabled
                      </span>
                    ) : u.isFlagged ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    {u.isFlagged ? (
                      <button
                        disabled={busyId === u._id}
                        onClick={() => runAction(u._id, () => unflagUser(u._id), `Unflagged ${u.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors disabled:opacity-50"
                      >
                        Unflag
                      </button>
                    ) : (
                      <button
                        disabled={busyId === u._id}
                        onClick={() => runAction(u._id, () => flagUser(u._id, 'Flagged by admin'), `Flagged ${u.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 font-semibold transition-colors disabled:opacity-50"
                      >
                        Flag
                      </button>
                    )}
                    {u.isActive ? (
                      <button
                        disabled={busyId === u._id}
                        onClick={() => runAction(u._id, () => disableUser(u._id), `Disabled account for ${u.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 font-semibold transition-colors disabled:opacity-50"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        disabled={busyId === u._id}
                        onClick={() => runAction(u._id, () => enableUser(u._id), `Re-enabled account for ${u.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors disabled:opacity-50"
                      >
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}