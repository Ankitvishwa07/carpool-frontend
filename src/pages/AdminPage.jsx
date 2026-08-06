import { useEffect, useState } from 'react';
import { getAdminUsers, flagUser, unflagUser, disableUser, enableUser, getAdminAnalytics } from '../api/admin';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, analyticsData] = await Promise.all([getAdminUsers({}), getAdminAnalytics()]);
      setUsers(usersData.users);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold">Admin dashboard</h1>

      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Total users', analytics.totalUsers],
            ['Drivers', analytics.totalDrivers],
            ['Total trips', analytics.totalTrips],
            ['Active trips', analytics.activeTrips],
            ['Pending requests', analytics.pendingRequests],
            ['Avg rating', analytics.platformAverageRating],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase">{label}</p>
              <p className="text-2xl font-semibold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 text-gray-500">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">★ {u.ratingAverage?.toFixed(1) ?? 'N/A'} ({u.ratingCount})</td>
                <td className="px-4 py-2">
                  {!u.isActive && <span className="text-red-600">Disabled</span>}
                  {u.isFlagged && <span className="text-yellow-600 ml-2">Flagged</span>}
                  {u.isActive && !u.isFlagged && <span className="text-green-600">Active</span>}
                </td>
                <td className="px-4 py-2 text-right space-x-3">
                  {u.isFlagged ? (
                    <button disabled={busyId === u._id} onClick={() => runAction(u._id, () => unflagUser(u._id))} className="text-indigo-600 hover:underline">
                      Unflag
                    </button>
                  ) : (
                    <button disabled={busyId === u._id} onClick={() => runAction(u._id, () => flagUser(u._id, 'Flagged by admin'))} className="text-yellow-600 hover:underline">
                      Flag
                    </button>
                  )}
                  {u.isActive ? (
                    <button disabled={busyId === u._id} onClick={() => runAction(u._id, () => disableUser(u._id))} className="text-red-600 hover:underline">
                      Disable
                    </button>
                  ) : (
                    <button disabled={busyId === u._id} onClick={() => runAction(u._id, () => enableUser(u._id))} className="text-green-600 hover:underline">
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
  );
}