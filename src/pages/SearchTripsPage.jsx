import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTrips } from '../api/trips';
import { createRequest } from '../api/requests';
import LocationPicker from '../components/LocationPicker';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { showToast } from '../utils/toast';

const CATEGORIES = ['All', 'Under ₹200', 'Morning Rides', 'Evening Rides'];

export default function SearchTripsPage() {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState(() => {
    const addr = searchParams.get('origin');
    return addr ? { address: addr } : null;
  });
  const [destination, setDestination] = useState(() => {
    const addr = searchParams.get('destination');
    return addr ? { address: addr } : null;
  });
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [bookingTrip, setBookingTrip] = useState(null);
  const [pickupNote, setPickupNote] = useState('');
  const [booking, setBooking] = useState(false);
  const [requestedIds, setRequestedIds] = useState(new Set());

  const fetchTrips = async () => {
    setSearching(true);
    setError('');
    try {
      const data = await searchTrips({
        origin: origin?.address,
        destination: destination?.address,
        date,
      });
      const list = Array.isArray(data) ? data : data?.trips || [];
      setResults(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookingTrip) return;
    setBooking(true);
    try {
      await createRequest({
        tripId: bookingTrip._id,
        seatsRequested: 1,
        pickupNote,
      });
      setRequestedIds((prev) => new Set([...prev, bookingTrip._id]));
      showToast('Seat request submitted! Driver will be notified.', 'success');
      setBookingTrip(null);
      setPickupNote('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request seat';
      showToast(msg, 'error');
    } finally {
      setBooking(false);
    }
  };

  const filteredResults = results.filter((trip) => {
    if (activeCategory === 'Under ₹200') return (trip.pricePerSeat || 0) <= 200;
    if (activeCategory === 'Morning Rides') {
      const h = new Date(trip.departureTime).getHours();
      return h >= 6 && h < 12;
    }
    if (activeCategory === 'Evening Rides') {
      const h = new Date(trip.departureTime).getHours();
      return h >= 16 && h < 22;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Card (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24">
          <h2 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Find Rides</h2>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <LocationPicker label="Pickup Location" value={origin} onChange={setOrigin} />
            <LocationPicker label="Dropoff Location" value={destination} onChange={setDestination} />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>📅</span> Travel Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus-ring"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full py-3.5 rounded-2xl btn-brand text-xs font-black shadow-md focus-ring"
            >
              {searching ? 'Searching...' : 'Search Matching Rides'}
            </button>
          </form>
        </div>

        {/* Right Search Results (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-emerald-100">
            <h2 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Available Commutes</h2>
            <span className="text-xs text-slate-500 font-bold">
              Found {filteredResults.length} rides
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all focus-ring ${
                  activeCategory === cat
                    ? 'bg-[#16A34A] text-white shadow-sm font-extrabold'
                    : 'bg-emerald-50 text-slate-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Trips List */}
          {searching ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchTrips} />
          ) : filteredResults.length === 0 ? (
            <EmptyState
              icon="🚗"
              title="No rides found"
              description="Try adjusting your pickup or date filters to find matching rides."
            />
          ) : (
            <div className="space-y-4">
              {filteredResults.map((trip) => {
                const isRequested = requestedIds.has(trip._id);
                const seatsLeft = (trip.seatsTotal || 4) - (trip.seatsBooked || 0);
                const depTimeStr = new Date(trip.departureTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={trip._id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#16A34A]/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Time Badge */}
                      <div className="px-3.5 py-2.5 rounded-xl bg-[#DCFCE7] text-[#14532D] font-extrabold text-xs shrink-0 shadow-xs border border-emerald-300">
                        {depTimeStr}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                          {trip.origin?.address?.split(',')[0] || 'Origin'} <span className="text-[#16A34A]">→</span> {trip.destination?.address?.split(',')[0] || 'Destination'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          💺 {seatsLeft} seats left • 👤 {trip.driverId?.name || 'Driver'} • ★ {trip.driverId?.ratingAverage?.toFixed(1) || '5.0'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-50">
                      <span className="font-heading font-black text-xl text-slate-900">
                        ₹{trip.pricePerSeat || 0}
                      </span>
                      <button
                        disabled={seatsLeft <= 0 || isRequested}
                        onClick={() => setBookingTrip(trip)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus-ring ${
                          isRequested
                            ? 'bg-emerald-100 text-[#16A34A] border border-emerald-200'
                            : seatsLeft > 0
                            ? 'btn-brand shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isRequested ? 'Requested ✓' : seatsLeft > 0 ? 'Book Seat' : 'Full'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Seat Booking Modal */}
      {bookingTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-bounce-once">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">Book Seat Request</h3>
              <button
                onClick={() => setBookingTrip(null)}
                className="text-slate-400 hover:text-slate-900 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">
                Route: {bookingTrip.origin?.address?.split(',')[0]} → {bookingTrip.destination?.address?.split(',')[0]}
              </p>
              <p className="text-slate-500">
                Driver: {bookingTrip.driverId?.name} • Fare: ₹{bookingTrip.pricePerSeat}/seat
              </p>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note to Driver (Optional)
                </label>
                <textarea
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  placeholder="e.g. Waiting near Metro exit Gate 2..."
                  rows={3}
                  className="w-full glass-input rounded-xl p-3 text-xs font-semibold focus-ring resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingTrip(null)}
                  className="w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="w-1/2 py-3 rounded-xl btn-brand text-xs font-extrabold shadow-sm"
                >
                  {booking ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}