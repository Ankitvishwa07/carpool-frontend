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
      const msg = 'Please set both a pickup point and drop-off destination on the map';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setSearching(true);
    try {
      const res = await searchTrips({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        time: form.time || undefined,
        radiusKm: form.radiusKm,
        windowMinutes: form.windowMinutes,
      });
      const tripsList = Array.isArray(res) ? res : res?.trips || [];
      setResults(tripsList);
      if (tripsList.length > 0) {
        showToast(`Found ${tripsList.length} matching ride(s)!`, 'success');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#7CA9FF]/20 text-[#7CA9FF] border border-[#7CA9FF]/30">
              ⚡ Rapido Route Matcher
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Find a Commute Ride
          </h1>
          <p className="text-xs text-slate-400">Specify your pick-up point and destination to match drivers.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <span className="text-base shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Spatial Search Container */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search Input Form & Trip List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSearch} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
            <div className="space-y-4">
              <LocationPicker label="Pick-Up Location" value={origin} onChange={setOrigin} />
              <LocationPicker label="Drop-Off Destination" value={destination} onChange={setDestination} />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Time
                </label>
                <input
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Radius (km)
                </label>
                <input
                  name="radiusKm"
                  type="number"
                  min="1"
                  max="100"
                  value={form.radiusKm}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Window (min)
                </label>
                <input
                  name="windowMinutes"
                  type="number"
                  min="1"
                  max="240"
                  value={form.windowMinutes}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950 font-extrabold rounded-xl py-3.5 text-sm shadow-lg shadow-[#7CA9FF]/20 transition-all flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                  <span>Matching Rides...</span>
                </>
              ) : (
                <span>Search Available Rides</span>
              )}
            </button>
          </form>

          {/* Results List */}
          {results !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-white">
                  Available Commutes ({results.length})
                </h2>
              </div>

              {results.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 space-y-2">
                  <span className="text-3xl block opacity-40">🚘</span>
                  <p className="text-sm font-bold text-slate-200">No matching rides found</p>
                  <p className="text-xs text-slate-400">
                    Try expanding your search radius or modifying departure time window.
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
                        className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 space-y-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#7CA9FF] text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0">
                              {trip.driverId?.name?.[0]?.toUpperCase() || 'D'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{trip.driverId?.name || 'Driver'}</span>
                                {trip.driverId?.ratingAverage != null && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    ★ {trip.driverId.ratingAverage.toFixed(1)}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {trip.car?.make ? `${trip.car.make} ${trip.car.model || ''} (${trip.car.color || 'Car'})` : 'Verified Vehicle'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-extrabold text-[#7CA9FF]">₹{trip.pricePerSeat || 50}</span>
                            <span className="text-[10px] text-slate-400 block">per seat</span>
                          </div>
                        </div>

                        {/* Route Timeline */}
                        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center gap-2.5 text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="font-semibold truncate">{trip.origin?.address || 'Pickup Point'}</span>
                          </div>
                          <div className="h-2 border-l-2 border-dashed border-slate-700 ml-1"></div>
                          <div className="flex items-center gap-2.5 text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                            <span className="font-semibold truncate">{trip.destination?.address || 'Drop-off Destination'}</span>
                          </div>
                        </div>

                        {/* Footer details & Action */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 font-semibold border border-slate-800">
                              🕒 {formatDateTime(trip.departureTime)}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              💺 {seatsLeft} seat(s) left
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/trips/${trip._id}`}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
                            >
                              Details
                            </Link>
                            <button
                              onClick={() => handleRequest(trip._id)}
                              disabled={isRequested || seatsLeft <= 0}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                                isRequested
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-[#7CA9FF] hover:bg-[#6697FF] text-slate-950'
                              }`}
                            >
                              {isRequested ? '✓ Requested' : 'Request Seat'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Info & Interactive Map Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <span>📍</span> Map & Pickup Radius
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rapido smart route matching searches for drivers whose routes pass within your specified radius.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Select Pickup Point</span>
                  <span className="text-slate-400">Click map or search address</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Select Drop-Off Destination</span>
                  <span className="text-slate-400">Set your destination workplace/home</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7CA9FF]/20 text-[#7CA9FF] flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Instant Request & Match</span>
                  <span className="text-slate-400">Request seats and track driver location</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}