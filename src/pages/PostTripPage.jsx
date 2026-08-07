import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../api/trips';
import LocationPicker from '../components/LocationPicker';
import { showToast } from '../components/Toast';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function PostTripPage() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [form, setForm] = useState({
    date: '', departureTime: '', returnTime: '',
    seatsTotal: 3,
    isRecurring: false,
    until: '',
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleDay = (value) => {
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const combineDateTime = (date, time) => (date && time ? new Date(`${date}T${time}`).toISOString() : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!origin || !destination) {
      const msg = 'Please set both an origin and a destination on the map';
      setError(msg);
      showToast(msg, 'error');
      return;
    }
    if (form.isRecurring && selectedDays.length === 0) {
      const msg = 'Pick at least one day of the week for a recurring trip';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createTrip({
        origin: { lat: origin.lat, lng: origin.lng, address: origin.address },
        destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
        departureTime: combineDateTime(form.date, form.departureTime),
        returnTime: combineDateTime(form.date, form.returnTime),
        seatsTotal: Number(form.seatsTotal),
        isRecurring: form.isRecurring,
        recurrence: form.isRecurring
          ? { daysOfWeek: selectedDays, until: form.until ? new Date(form.until).toISOString() : undefined }
          : undefined,
      });
      showToast('Trip posted successfully!', 'success');
      navigate('/my-trips');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post trip';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>➕</span> Post a New Trip
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Share your daily commute route with co-workers and riders to split travel costs.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <span className="text-base shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-2xl">
        {/* Route Details Section */}
        <div className="space-y-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
            1. Route Locations
          </h2>
          <div className="space-y-6">
            <LocationPicker label="Departure Point (Origin)" value={origin} onChange={setOrigin} />
            <LocationPicker label="Destination Point" value={destination} onChange={setDestination} />
          </div>
        </div>

        {/* Schedule & Timing */}
        <div className="space-y-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
            2. Schedule & Timing
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Trip Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Departure Time
              </label>
              <input
                name="departureTime"
                type="time"
                value={form.departureTime}
                onChange={handleChange}
                required
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Return Time <span className="text-slate-500 font-normal text-[10px]">(Optional)</span>
              </label>
              <input
                name="returnTime"
                type="time"
                value={form.returnTime}
                onChange={handleChange}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                checked={form.isRecurring}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
              <label htmlFor="isRecurring" className="text-xs font-semibold text-slate-200 cursor-pointer">
                🔁 Repeat this trip weekly
              </label>
            </div>

            {form.isRecurring && (
              <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Repeats On</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          selectedDays.includes(day.value)
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Repeat Until (Optional)</label>
                  <input
                    name="until"
                    type="date"
                    value={form.until}
                    onChange={handleChange}
                    className="w-full max-w-xs glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
            3. Seat Availability
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Available Seats
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, seatsTotal: Math.max(1, form.seatsTotal - 1) })}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                name="seatsTotal"
                type="number"
                min="1"
                max="10"
                value={form.seatsTotal}
                onChange={handleChange}
                required
                className="w-20 glass-input rounded-xl px-3 py-2 text-center text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, seatsTotal: Math.min(10, form.seatsTotal + 1) })}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
              <span className="text-xs text-slate-400">passengers max</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl py-3.5 text-sm font-semibold shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Posting Trip...</span>
            </>
          ) : (
            <span>Publish Commute Trip</span>
          )}
        </button>
      </form>
    </div>
  );
}