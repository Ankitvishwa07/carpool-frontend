import { useState } from 'react';
import { searchTrips } from '../api/trips';
import { createRequest } from '../api/requests';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/format';
import LocationPicker from '../components/LocationPicker';
import { showToast } from '../utils/toast';

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
      const msg = 'Please set both a starting point and a destination on the map';
      setError(msg);
      showToast(msg, 'error');
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
      setResults(trips || []);
      if (trips?.length > 0) {
        showToast(`Found ${trips.length} matching ride(s)!`, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Search failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleRequest = async (tripId) => {
    try {
      await createRequest(tripId);
      setRequestedIds((prev) => new Set(prev).add(tripId));
      showToast('Seat requested successfully! The driver will be notified.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>🔍</span> Find a Commute Ride
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Specify your pick-up point and destination to find matching drivers along your route.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <span className="text-base shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Search Console Form */}
      <form onSubmit={handleSearch} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="space-y-6">
          <LocationPicker label="Your Pick-Up Point" value={origin} onChange={setOrigin} />
          <LocationPicker label="Your Drop-Off Destination" value={destination} onChange={setDestination} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Preferred Time
            </label>
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Max Radius (km)
            </label>
            <input
              name="radiusKm"
              type="number"
              min="1"
              max="100"
              value={form.radiusKm}
              onChange={handleChange}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Time Window (min)
            </label>
            <input
              name="windowMinutes"
              type="number"
              min="1"
              max="240"
              value={form.windowMinutes}
              onChange={handleChange}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={searching}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl py-3.5 text-sm font-semibold shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {searching ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Searching Matching Routes...</span>
            </>
          ) : (
            <span>Search Carpools</span>
          )}
        </button>
      </form>

      {/* Results Section */}
      {results !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-200">
              Matching Trips ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <span className="text-4xl block opacity-40">🚘</span>
              <p className="text-sm font-semibold text-slate-300">No matching trips found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search radius, adjusting the time window, or checking back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((trip) => {
                const seatsLeft = trip.seatsTotal - trip.seatsBooked;
                const isRequested = requestedIds.has(trip._id);

                return (
                  <div
                    key={trip._id}
                    className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {trip.driverId?.name?.[0]?.toUpperCase() || 'D'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-100">{trip.driverId?.name || 'Driver'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              ⭐ {trip.driverId?.ratingAverage?.toFixed(1) ?? 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Verified Driver</p>
                        </div>
                      </div>

                      {/* Route information */}
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="text-indigo-400">🟢</span>
                          <span className="truncate font-medium">{trip.origin?.address || 'Origin'}</span>
                        </div>
                        <div className="h-3 border-l-2 border-dashed border-slate-700 ml-1.5 my-0.5"></div>
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="text-emerald-400">🔴</span>
                          <span className="truncate font-medium">{trip.destination?.address || 'Destination'}</span>
                        </div>
                      </div>

                      {/* Badges and Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-medium">
                          🕒 Departs {formatDateTime(trip.departureTime)}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                          💺 {seatsLeft} seat(s) left
                        </span>

                        {trip.matchDistanceMeters != null && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                            📍 {(trip.matchDistanceMeters / 1000).toFixed(1)} km to pickup
                          </span>
                        )}
                        {trip.detourMeters != null && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                            ↪️ +{(trip.detourMeters / 1000).toFixed(1)} km detour
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col items-center gap-3 shrink-0">
                      <Link
                        to={`/trips/${trip._id}`}
                        className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRequest(trip._id)}
                        disabled={isRequested}
                        className={`w-full px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-md ${
                          isRequested
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-default'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:scale-[1.02]'
                        }`}
                      >
                        {isRequested ? '✓ Seat Requested' : 'Request Seat'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}