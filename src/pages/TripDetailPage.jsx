import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { getAccessToken } from '../api/client';
import { getTrip, getTripMessages, updateTrip, completeTrip } from '../api/trips';
import { createRequest, cancelRequest, acceptRequest, declineRequest, getIncomingRequests, getMyRequests } from '../api/requests';
import { submitRating } from '../api/rating';
import { formatDateTime } from '../utils/format';

const SOCKET_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

function RatingForm({ label, onSubmit, busy }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="border rounded-md p-3 space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            className={`text-xl leading-none ${n <= stars ? 'text-yellow-500' : 'text-gray-300'}`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment"
        rows={2}
        className="w-full border rounded-md px-2 py-1 text-sm"
      />
      <button
        type="button"
        disabled={busy || stars === 0}
        onClick={() => onSubmit(stars, comment)}
        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        Submit rating
      </button>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);

  const [trip, setTrip] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [ratedIds, setRatedIds] = useState(new Set());
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState('');

  const isDriver = trip?.driverId?._id === user?.id;

  const loadCore = async () => {
    setLoading(true);
    setError('');
    try {
      const { trip: fetchedTrip } = await getTrip(id);
      setTrip(fetchedTrip);

      const iAmDriver = fetchedTrip.driverId?._id === user.id;
      if (iAmDriver) {
        const { requests } = await getIncomingRequests();
        setIncomingRequests(requests.filter((r) => r.tripId._id === id));
      } else {
        const { requests } = await getMyRequests();
        setMyRequest(requests.find((r) => r.tripId._id === id) || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canChat = isDriver
    ? incomingRequests.some((r) => r.status === 'accepted')
    : myRequest?.status === 'accepted';

  useEffect(() => {
    if (!canChat) return;
    let cancelled = false;

    (async () => {
      try {
        const { messages: history } = await getTripMessages(id);
        if (!cancelled) setMessages(history);
      } catch {
        // non-fatal — chat will just start empty
      }
    })();

    const socket = io(`${SOCKET_URL}/chat`, { auth: { token: getAccessToken() } });
    socketRef.current = socket;

    socket.emit('join_trip', id);
    socket.on('new_message', (msg) => {
      if (msg.tripId === id) setMessages((prev) => [...prev, msg]);
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [canChat, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { tripId: id, text: draft.trim() });
    setDraft('');
  };

  const runAction = async (fn) => {
    setActionError('');
    setBusy(true);
    try {
      await fn();
      await loadCore();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRate = async (rateeId, stars, comment) => {
    setRatingError('');
    setRatingBusy(true);
    try {
      await submitRating({ tripId: id, rateeId, stars, comment: comment || undefined });
      setRatedIds((prev) => new Set(prev).add(rateeId));
    } catch (err) {
      if (err.response?.status === 409) {
        // already rated in an earlier visit — just reflect that in the UI
        setRatedIds((prev) => new Set(prev).add(rateeId));
      } else {
        setRatingError(err.response?.data?.message || 'Failed to submit rating');
      }
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-8 text-red-600">{error}</div>;
  if (!trip) return null;

  const acceptedRiders = incomingRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link to={isDriver ? '/my-trips' : '/my-requests'} className="text-sm text-gray-500 hover:underline">
          ← Back
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {trip.origin.address || 'Origin'} → {trip.destination.address || 'Destination'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Departs {formatDateTime(trip.departureTime)} · {trip.seatsBooked}/{trip.seatsTotal} seats booked ·{' '}
              <span className="capitalize">{trip.status}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Driver: {trip.driverId?.name || 'Unknown'} · ★ {trip.driverId?.ratingAverage?.toFixed(1) ?? 'N/A'}
            </p>
          </div>
          {isDriver && ['active', 'full'].includes(trip.status) && (
            <button
              disabled={busy}
              onClick={() => runAction(() => completeTrip(id))}
              className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 disabled:opacity-50 shrink-0"
            >
              Mark completed
            </button>
          )}
        </div>
      </div>

      {actionError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{actionError}</div>}

      {isDriver ? (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">Requests</h2>
          {incomingRequests.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
          <div className="space-y-2">
            {incomingRequests.map((r) => (
              <div key={r._id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span>
                  {r.riderId.name} · ★ {r.riderId.ratingAverage?.toFixed(1) ?? 'N/A'} ·{' '}
                  <span className="capitalize text-gray-500">{r.status}</span>
                </span>
                {r.status === 'pending' && (
                  <div className="flex gap-3">
                    <button disabled={busy} onClick={() => runAction(() => acceptRequest(r._id))} className="text-green-600 hover:underline">
                      Accept
                    </button>
                    <button disabled={busy} onClick={() => runAction(() => declineRequest(r._id))} className="text-gray-500 hover:underline">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Your request status</p>
            <p className="capitalize font-medium">{myRequest?.status || 'Not requested'}</p>
          </div>
          {!myRequest && (
            <button disabled={busy} onClick={() => runAction(() => createRequest(id))}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              Request seat
            </button>
          )}
          {['pending', 'accepted'].includes(myRequest?.status) && (
            <button disabled={busy} onClick={() => runAction(() => cancelRequest(myRequest._id))}
              className="text-sm text-red-600 hover:underline">
              Cancel request
            </button>
          )}
        </div>
      )}

      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">Chat</h2>
        {!canChat ? (
          <p className="text-sm text-gray-500">Chat unlocks once a request is accepted.</p>
        ) : (
          <>
            <div className="h-64 overflow-y-auto border rounded-md p-3 space-y-2 mb-3">
              {messages.length === 0 && <p className="text-sm text-gray-400">No messages yet — say hi.</p>}
              {messages.map((m) => (
                <div key={m._id} className={`text-sm ${m.senderId === user.id || m.senderId?._id === user.id ? 'text-right' : ''}`}>
                  <span className="inline-block bg-gray-100 rounded-lg px-3 py-1">
                    {m.senderId?.name && <span className="block text-xs text-gray-400">{m.senderId.name}</span>}
                    {m.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-md px-3 py-2 text-sm"
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {trip.status === 'completed' && (
        <div className="bg-white border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase">Rate your trip</h2>
          {ratingError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{ratingError}</div>}

          {isDriver ? (
            acceptedRiders.length === 0 ? (
              <p className="text-sm text-gray-500">No riders to rate on this trip.</p>
            ) : (
              acceptedRiders.map((r) =>
                ratedIds.has(r.riderId._id) ? (
                  <p key={r._id} className="text-sm text-green-600">✓ Rated {r.riderId.name}</p>
                ) : (
                  <RatingForm
                    key={r._id}
                    label={`Rate ${r.riderId.name}`}
                    busy={ratingBusy}
                    onSubmit={(stars, comment) => handleRate(r.riderId._id, stars, comment)}
                  />
                )
              )
            )
          ) : ratedIds.has(trip.driverId._id) ? (
            <p className="text-sm text-green-600">✓ Rated {trip.driverId.name}</p>
          ) : myRequest?.status === 'accepted' ? (
            <RatingForm
              label={`Rate ${trip.driverId.name}`}
              busy={ratingBusy}
              onSubmit={(stars, comment) => handleRate(trip.driverId._id, stars, comment)}
            />
          ) : (
            <p className="text-sm text-gray-500">You weren't an accepted rider on this trip.</p>
          )}
        </div>
      )}
    </div>
  );
}