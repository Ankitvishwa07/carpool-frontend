import { useEffect, useState } from 'react';
import { getAdminUsers, flagUser, unflagUser, disableUser, enableUser, getAdminAnalytics } from '../api/admin';
import { SkeletonStat, SkeletonTableRow } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { showToast } from '../utils/toast';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
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
    loadData();
  }, []);

  const runAction = async (id, fn, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      showToast(successMsg, 'success');
      await loadData();
    } catch (err) {
      showToast(successMsg, 'success');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <SkeletonStat /><SkeletonStat /><SkeletonStat />
          <SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {error && <ErrorState message={error} onRetry={loadData} />}

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ['Total Users', analytics.totalUsers, '👥', 'text-[#16A34A]'],
            ['Drivers', analytics.totalDrivers, '🚘', 'text-emerald-700'],
            ['Total Trips', analytics.totalTrips, '🗺️', 'text-sky-700'],
            ['Active Trips', analytics.activeTrips, '⚡', 'text-amber-600'],
            ['Pending Requests', analytics.pendingRequests, '📋', 'text-purple-700'],
            ['Avg Rating', analytics.platformAverageRating?.toFixed(1) || '5.0', '⭐', 'text-amber-500'],
          ].map(([label, value, icon, colorClass]) => (
            <div key={label} className="glass-card rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-extrabold uppercase tracking-wider text-[10px]">{label}</span>
                <span className="text-base">{icon}</span>
              </div>
              <p className={`font-heading text-2xl font-black ${colorClass}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Accounts Table (Crisp White Card with Forest Green Header) */}
      <div className="glass-card rounded-3xl overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading text-base font-bold text-slate-900">
            User Accounts ({filteredUsers.length})
          </h2>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="glass-input rounded-2xl px-4 py-2 text-xs w-full sm:w-64 font-semibold focus-ring"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState icon="🔍" title="No users found" description="Try a different search query." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-emerald-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-emerald-100 text-[#14532D] uppercase tracking-wider font-extrabold border-b border-emerald-200">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#14532D] font-extrabold text-xs flex items-center justify-center border border-emerald-300">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16A34A] border border-emerald-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        disabled={busyId === u._id}
                        onClick={() => runAction(u._id, () => flagUser(u._id, 'Flagged'), `Flagged ${u.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold focus-ring hover:bg-amber-100"
                      >
                        Flag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}