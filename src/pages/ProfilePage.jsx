import { useEffect, useState } from 'react';
import api from '../api/client';
import { updateProfile } from '../api/profile';
import useAuthStore from '../store/authStore';
import LocationPicker from '../components/LocationPicker';
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

  useEffect(() => {
    (async () => {
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
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      const msg = err.response?.data?.message || 'Failed to save profile';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#7CA9FF] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>👤</span> User Profile & Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize your default commute presets, vehicle specifications, and driver details.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
          <span>✨</span> {success}
        </div>
      )}

      {/* Profile Card Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex items-center gap-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#7CA9FF] p-0.5 shadow-xl shadow-[#7CA9FF]/20 shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl font-extrabold text-[#7CA9FF]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="font-heading text-xl font-extrabold text-white truncate">{user?.name}</h2>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#7CA9FF]/20 text-[#7CA9FF] border border-[#7CA9FF]/30">
              Role: {user?.role}
            </span>
            {user?.ratingAverage != null && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ★ {user.ratingAverage.toFixed(1)} rating
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-2xl">
        {/* Saved Locations */}
        <div className="space-y-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#7CA9FF] border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>📍</span> Saved Locations & Commute Presets
          </h2>
          <div className="space-y-4">
            <LocationPicker label="Default Home Location" value={homeLocation} onChange={setHomeLocation} />
            <LocationPicker label="Default Work Location" value={workLocation} onChange={setWorkLocation} />
          </div>
        </div>

        {/* Car Specs Section */}
        <div className="space-y-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#7CA9FF] border-b border-slate-800 pb-2 flex items-center gap-2">
            <span>🚘</span> Vehicle & Driver Setup
          </h2>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="hasCar"
                name="hasCar"
                type="checkbox"
                checked={car.hasCar}
                onChange={handleCarChange}
                className="w-4 h-4 rounded text-[#7CA9FF] bg-slate-800 border-slate-700 focus:ring-[#7CA9FF]"
              />
              <label htmlFor="hasCar" className="text-xs font-bold text-slate-200 cursor-pointer">
                🚘 I have a vehicle and want to offer seats as a driver partner
              </label>
            </div>

            {car.hasCar && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Vehicle Make
                    </label>
                    <input
                      name="make"
                      placeholder="e.g. Honda / Hyundai"
                      value={car.make}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Vehicle Model
                    </label>
                    <input
                      name="model"
                      placeholder="e.g. Civic / City"
                      value={car.model}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Vehicle Color
                    </label>
                    <input
                      name="color"
                      placeholder="e.g. Silver / White"
                      value={car.color}
                      onChange={handleCarChange}
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Available Passenger Seats
                  </label>
                  <input
                    name="seatsAvailable"
                    type="number"
                    min="0"
                    max="8"
                    value={car.seatsAvailable}
                    onChange={handleCarChange}
                    className="w-32 glass-input rounded-xl px-3.5 py-2 text-xs font-extrabold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950 font-extrabold rounded-xl py-3.5 text-sm shadow-lg shadow-[#7CA9FF]/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
              <span>Saving Settings...</span>
            </>
          ) : (
            <span>Save Profile Settings</span>
          )}
        </button>
      </form>
    </div>
  );
}