import { useState } from 'react';
import { searchTrips } from '../api/trips';
import { createRequest } from '../api/requests';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/format';
import LocationPicker from '../components/LocationPicker';

export default function SearchTripsPage() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [form, setForm] = useState({ time: '', radiusKm: 5, windowMinutes: 30 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [requestedIds, setRequestedIds] = useState(new Set());

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!origin || !destination) {
      setError('Please set both a starting point and a destination on the map');
      return;
    }

    setSearching(true);
    try {
      const { trips } = await searchTrips({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        time: form.time || undefined,
        radiusKm: form.radiusKm,
        windowMinutes: form.windowMinutes,
      });
      setResults(trips);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleRequest = async (tripId) => {
    try {
      await createRequest(tripId);
      setRequestedIds((prev) => new Set(prev).add(tripId));
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Find a ride</h1>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl border shadow-sm space-y-4 mb-8">
        <LocationPicker label="Your starting point" value={origin} onChange={setOrigin} />
        <LocationPicker label="Your destination" value={destination} onChange={setDestination} />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Preferred time (optional)</label>
            <input name="time" type="time" value={form.time} onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Radius (km)</label>
            <input name="radiusKm" type="number" min="1" max="100" value={form.radiusKm} onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time window (min)</label>
            <input name="windowMinutes" type="number" min="1" max="240" value={form.windowMinutes} onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={searching}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results !== null && (
        <div className="space-y-3">
          {results.length === 0 && <p className="text-gray-500 text-sm">No matching trips found.</p>}
          {results.map((trip) => (
            <div key={trip._id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{trip.driverId?.name || 'Driver'}</p>
                <p className="text-sm text-gray-500">
                  {trip.origin.address || 'Origin'} → {trip.destination.address || 'Destination'}
                </p>
                <p className="text-sm text-gray-500">
                  Departs {formatDateTime(trip.departureTime)} · {trip.seatsTotal - trip.seatsBooked} seat(s) left ·
                  {' '}★ {trip.driverId?.ratingAverage?.toFixed(1) ?? 'N/A'}
                </p>
                {(trip.matchDistanceMeters != null || trip.detourMeters != null) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {trip.matchDistanceMeters != null && `${(trip.matchDistanceMeters / 1000).toFixed(1)} km to pickup`}
                    {trip.detourMeters != null && ` · +${(trip.detourMeters / 1000).toFixed(1)} km detour for driver`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/trips/${trip._id}`} className="text-sm text-gray-600 hover:underline">
                  View
                </Link>
                <button
                  onClick={() => handleRequest(trip._id)}
                  disabled={requestedIds.has(trip._id)}
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {requestedIds.has(trip._id) ? 'Requested' : 'Request seat'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}