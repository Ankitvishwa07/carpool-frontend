import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrip } from '../api/trips';
import LocationPicker from '../components/LocationPicker';
import ErrorState from '../components/ErrorState';
import { showToast } from '../utils/toast';
import { postTripSchema, validateWithZod } from '../utils/validation';

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [form, setForm] = useState({
    date: '',
    departureTime: '',
    returnTime: '',
    seatsTotal: 3,
    pricePerSeat: 150,
    isRecurring: false,
    until: '',
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState('');

  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      showToast('Trip published successfully!', 'success');
      navigate('/my-trips');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to post trip';
      setError(msg);
      showToast(msg, 'error');
    },
  });

  const submitting = createTripMutation.isPending;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleDay = (value) => {
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const combineDateTime = (date, time) => (date && time ? new Date(`${date}T${time}`).toISOString() : undefined);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const { isValid, errors: validationErrs } = validateWithZod(postTripSchema, {
      origin,
      destination,
      date: form.date,
      departureTime: form.departureTime,
      seatsTotal: form.seatsTotal,
      pricePerSeat: form.pricePerSeat,
    });

    if (!isValid) {
      const firstMsg = Object.values(validationErrs)[0] || 'Please fix errors before submitting';
      setError(firstMsg);
      showToast(firstMsg, 'error');
      return;
    }

    createTripMutation.mutate({
      origin: { lat: origin.lat, lng: origin.lng, address: origin.address },
      destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
      departureTime: combineDateTime(form.date, form.departureTime),
      returnTime: combineDateTime(form.date, form.returnTime),
      seatsTotal: Number(form.seatsTotal),
      pricePerSeat: Number(form.pricePerSeat),
      isRecurring: form.isRecurring,
      recurrence: form.isRecurring
        ? { daysOfWeek: selectedDays, until: form.until ? new Date(form.until).toISOString() : undefined }
        : undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
        {/* Section 1: Route */}
        <div className="space-y-4">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
            <span>📍</span> 1. Pick-Up & Drop-Off Route
          </h2>
          <div className="space-y-4">
            <LocationPicker label="Departure Point (Origin)" id="post-origin" value={origin} onChange={setOrigin} />
            <LocationPicker label="Destination Point" id="post-destination" value={destination} onChange={setDestination} />
          </div>
        </div>

        {/* Section 2: Timing */}
        <div className="space-y-4">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
            <span aria-hidden="true">🕒</span> 2. Departure Time & Schedule
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="post-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 cursor-pointer">
                Trip Date
              </label>
              <input
                id="post-date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus-ring"
              />
            </div>
            <div>
              <label htmlFor="post-dept-time" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 cursor-pointer">
                Departure Time
              </label>
              <input
                id="post-dept-time"
                name="departureTime"
                type="time"
                value={form.departureTime}
                onChange={handleChange}
                required
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus-ring"
              />
            </div>
            <div>
              <label htmlFor="post-return-time" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 cursor-pointer">
                Return Time (Optional)
              </label>
              <input
                id="post-return-time"
                name="returnTime"
                type="time"
                value={form.returnTime}
                onChange={handleChange}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus-ring"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                checked={form.isRecurring}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#16A34A] bg-white border-emerald-300 focus:ring-[#16A34A]"
              />
              <label htmlFor="isRecurring" className="text-xs font-bold text-slate-800 cursor-pointer">
                🔁 Repeat this commute weekly
              </label>
            </div>

            {form.isRecurring && (
              <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                <span className="block text-[11px] font-semibold text-slate-600 mb-2">Repeats On</span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      type="button"
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={selectedDays.includes(day.value)}
                      aria-label={`Repeat on ${day.label}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border focus-ring ${
                        selectedDays.includes(day.value)
                          ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                          : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Seats & Fare */}
        <div className="space-y-4">
          <h2 className="font-heading text-xs font-black uppercase tracking-wider text-[#16A34A] border-b border-emerald-100 pb-2 flex items-center gap-2">
            <span aria-hidden="true">💺</span> 3. Seats & Pricing
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="post-seats" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 cursor-pointer">
                Available Car Seats
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, seatsTotal: Math.max(1, form.seatsTotal - 1) })}
                  aria-label="Decrease seat count"
                  className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-slate-800 font-extrabold text-lg flex items-center justify-center focus-ring"
                >
                  -
                </button>
                <input
                  id="post-seats"
                  name="seatsTotal"
                  type="number"
                  min="1"
                  max="10"
                  value={form.seatsTotal}
                  onChange={handleChange}
                  required
                  className="w-20 glass-input rounded-xl px-3 py-2 text-center text-xs font-extrabold focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, seatsTotal: Math.min(10, form.seatsTotal + 1) })}
                  aria-label="Increase seat count"
                  className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-slate-800 font-extrabold text-lg flex items-center justify-center focus-ring"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 font-medium">seats</span>
              </div>
            </div>

            <div>
              <label htmlFor="post-price" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 cursor-pointer">
                Price per Seat (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#16A34A]" aria-hidden="true">₹</span>
                <input
                  id="post-price"
                  name="pricePerSeat"
                  type="number"
                  min="0"
                  max="5000"
                  value={form.pricePerSeat}
                  onChange={handleChange}
                  required
                  className="w-full glass-input rounded-xl pl-8 pr-4 py-2.5 text-xs font-extrabold focus-ring"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl btn-brand text-xs font-black shadow-md transition-all focus-ring"
        >
          {submitting ? 'Publishing Route...' : 'Publish Route'}
        </button>
      </form>
    </div>
  );
}