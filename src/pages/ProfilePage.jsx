import { useEffect, useState } from 'react';
import { getAccessToken } from '../api/client';
import api from '../api/client';
import { updateProfile } from '../api/profile';
import useAuthStore from '../store/authStore';
import LocationPicker from '../components/LocationPicker';

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
      setSuccess('Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-lg mx-auto px-4 py-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Your profile</h1>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="mb-4 text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div>}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
        <div className="text-sm text-gray-500">
          <p><span className="text-gray-700 font-medium">{user?.name}</span> · {user?.email}</p>
          <p className="capitalize mt-0.5">{user?.role}</p>
        </div>

        <LocationPicker label="Home location" value={homeLocation} onChange={setHomeLocation} />
        <LocationPicker label="Work location" value={workLocation} onChange={setWorkLocation} />

        <fieldset className="border rounded-md p-3">
          <legend className="text-sm font-medium text-gray-600 px-1">Car</legend>

          <div className="flex items-center gap-2 mb-3">
            <input id="hasCar" name="hasCar" type="checkbox" checked={car.hasCar} onChange={handleCarChange} />
            <label htmlFor="hasCar" className="text-sm text-gray-600">I have a car and can drive</label>
          </div>

          {car.hasCar && (
            <div className="space-y-2">
              <input name="make" placeholder="Make" value={car.make} onChange={handleCarChange}
                className="w-full border rounded-md px-3 py-2 text-sm" />
              <input name="model" placeholder="Model" value={car.model} onChange={handleCarChange}
                className="w-full border rounded-md px-3 py-2 text-sm" />
              <input name="color" placeholder="Color" value={car.color} onChange={handleCarChange}
                className="w-full border rounded-md px-3 py-2 text-sm" />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seats available</label>
                <input name="seatsAvailable" type="number" min="0" max="8" value={car.seatsAvailable}
                  onChange={handleCarChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
          )}
        </fieldset>

        <button type="submit" disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}