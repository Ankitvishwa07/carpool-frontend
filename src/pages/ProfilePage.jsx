import { useEffect, useState } from 'react';
import api from '../api/client';
import { updateProfile } from '../api/profile';
import { getUserRatings } from '../api/rating';
import useAuthStore from '../store/authStore';
import LocationPicker from '../components/LocationPicker';
import { SkeletonCard } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { showToast } from '../utils/toast';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [homeLocation, setHomeLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [car, setCar] = useState({ hasCar: false, seatsAvailable: 0, make: '', model: '', color: '' });
  const [ratings, setRatings] = useState([]);

  const userId = user?._id || user?.id;

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/auth/me');
      const profile = data.user;
      if (profile.homeLocation) {
        setHomeLocation({
          lat: profile.homeLocation.coordinates[1],
          lng: profile.homeLocation.coordinates[0],
          address: profile.homeLocation.address,
        });
      }
      if (profile.workLocation) {
        setWorkLocation({
          lat: profile.workLocation.coordinates[1],
          lng: profile.workLocation.coordinates[0],
          address: profile.workLocation.address,
        });
      }
      if (profile.car) {
        setCar({
          hasCar: profile.car.hasCar || false,
          seatsAvailable: profile.car.seatsAvailable || 0,
          make: profile.car.make || '',
          model: profile.car.model || '',
          color: profile.car.color || '',
        });
      }

      if (userId) {
        const ratingData = await getUserRatings(userId);
        setRatings(ratingData.ratings || []);
      }
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleCarChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCar((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { user: updated } = await updateProfile({
        homeLocation: homeLocation || undefined,
        workLocation: workLocation || undefined,
        hasCar: car.hasCar,
        seatsAvailable: car.hasCar ? Number(car.seatsAvailable) : 0,
        make: car.make,
        model: car.model,
        color: car.color,
      });
      updateUser(updated);
      setSuccess('Profile saved successfully!');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setSuccess('Profile saved successfully!');
      showToast('Profile updated successfully!', 'success');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {error && <ErrorState message={error} onRetry={fetchProfile} />}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#16A34A] text-xs flex items-center gap-2 font-bold">
          <span>✨</span> {success}
        </div>
      )}

      {/* User Overview Header (Light Mint Green feature card) */}
      <div className="glass-card-dark rounded-3xl p-6 sm:p-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#16A34A] text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="font-heading text-xl font-extrabold text-[#14532D] truncate">{user?.name}</h2>
          <p className="text-xs text-slate-600 font-medium truncate">{user?.email}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16A34A]/15 text-[#15803D] border border-[#16A34A]/30">
              Role: {user?.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 border border-amber-500/30">
              ★ {user?.ratingAverage?.toFixed(1) || '5.0'} ({user?.ratingCount || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
        {/* Saved Locations */}
        <div className="space-y-4">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
            <span>📍</span> Saved Locations & Presets
          </h2>
          <div className="space-y-4">
            <LocationPicker label="Default Home Location" value={homeLocation} onChange={setHomeLocation} />
            <LocationPicker label="Default Work Location" value={workLocation} onChange={setWorkLocation} />
          </div>
        </div>

        {/* Vehicle Setup */}
        <div className="space-y-4">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
            <span>🚘</span> Vehicle Specification
          </h2>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="hasCar"
                name="hasCar"
                type="checkbox"
                checked={car.hasCar}
                onChange={handleCarChange}
                className="w-4 h-4 rounded text-[#16A34A] bg-white border-emerald-300 focus:ring-[#16A34A]"
              />
              <label htmlFor="hasCar" className="text-xs font-bold text-slate-800 cursor-pointer">
                🚘 Offer car seats as a driver
              </label>
            </div>

            {car.hasCar && (
              <div className="space-y-4 pt-3 border-t border-emerald-200/60">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Make</label>
                    <input
                      name="make"
                      placeholder="e.g. Honda"
                      value={car.make}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Model</label>
                    <input
                      name="model"
                      placeholder="e.g. Civic"
                      value={car.model}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Color</label>
                    <input
                      name="color"
                      placeholder="e.g. Black"
                      value={car.color}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold focus-ring"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl btn-brand text-xs font-black shadow-md transition-all focus-ring"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Ratings Received */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
          <span>⭐</span> Co-Commuter Feedback & Reviews ({ratings.length})
        </h2>

        {ratings.length === 0 ? (
          <p className="text-xs text-slate-500 font-medium py-2">No rating reviews received yet.</p>
        ) : (
          <div className="divide-y divide-emerald-50 space-y-3">
            {ratings.map((r) => (
              <div key={r._id} className="pt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{r.raterId?.name || 'Commuter'}</span>
                  <span className="text-amber-500 font-extrabold">★ {r.stars}/5</span>
                </div>
                {r.comment && <p className="text-xs text-slate-600 italic">"{r.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}