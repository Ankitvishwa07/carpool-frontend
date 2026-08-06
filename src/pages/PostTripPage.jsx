import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../api/trips';
import LocationPicker from '../components/LocationPicker';

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
      setError('Please set both an origin and a destination on the map');
      return;
    }
    if (form.isRecurring && selectedDays.length === 0) {
      setError('Pick at least one day of the week for a recurring trip');
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
      navigate('/my-trips');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Post a trip</h1>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <LocationPicker label="Origin" value={origin} onChange={setOrigin} />
        <LocationPicker label="Destination" value={destination} onChange={setDestination} />

        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required
            className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Departure time</label>
            <input name="departureTime" type="time" value={form.departureTime} onChange={handleChange} required
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Return time (optional)</label>
            <input name="returnTime" type="time" value={form.returnTime} onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="isRecurring" name="isRecurring" type="checkbox" checked={form.isRecurring} onChange={handleChange} />
          <label htmlFor="isRecurring" className="text-sm text-gray-600">This trip repeats weekly</label>
        </div>

        {form.isRecurring && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Repeats on</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      selectedDays.includes(day.value)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Repeat until (optional)</label>
              <input name="until" type="date" value={form.until} onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Seats available</label>
          <input name="seatsTotal" type="number" min="1" max="10" value={form.seatsTotal}
            onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Posting...' : 'Post trip'}
        </button>
      </form>
    </div>
  );
}