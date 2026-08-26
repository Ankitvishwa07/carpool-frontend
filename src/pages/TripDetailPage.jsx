import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { getAccessToken } from '../api/client';
import { getTrip, getTripMessages, completeTrip } from '../api/trips';
import { createRequest, cancelRequest, acceptRequest, declineRequest, getIncomingRequests, getMyRequests } from '../api/requests';
import { submitRating } from '../api/rating';
import { formatDateTime } from '../utils/format';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

function RatingForm({ label, onSubmit, busy }) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
      <p className="text-xs font-semibold text-slate-200">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHoverStars(n)}
            onMouseLeave={() => setHoverStars(0)}
            className={`text-2xl leading-none transition-transform hover:scale-125 ${
              n <= (hoverStars || stars) ? 'text-amber-400' : 'text-slate-700'
            }`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a feedback comment (optional)..."
        rows={2}
        className="w-full glass-input rounded-xl px-3 py-2 text-xs"
      />
      <button
        type="button"
        disabled={busy || stars === 0}
        onClick={() => onSubmit(stars, comment)}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20"
      >
        Submit Rating
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

  const userId = user?._id || user?.id;
  const isDriver = (trip?.driverId?._id || trip?.driverId) === userId;

  const loadCore = async () => {
    setLoading(true);
    setError('');
    try {
      const { trip: fetchedTrip } = await getTrip(id);
      setTrip(fetchedTrip);

      const driverIdStr = fetchedTrip.driverId?._id || fetchedTrip.driverId;
      const iAmDriver = driverIdStr === userId;
      if (iAmDriver) {
        const reqData = await getIncomingRequests();
        const reqList = Array.isArray(reqData) ? reqData : reqData.requests || [];
        setIncomingRequests(reqList.filter((r) => (r.tripId?._id || r.tripId) === id));
      } else {
        const reqData = await getMyRequests();
        const reqList = Array.isArray(reqData) ? reqData : reqData.requests || [];
        setMyRequest(reqList.find((r) => (r.tripId?._id || r.tripId) === id) || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { trip: fetchedTrip } = await getTrip(id);
        if (!active) return;
        setTrip(fetchedTrip);

        const driverIdStr = fetchedTrip.driverId?._id || fetchedTrip.driverId;
        const iAmDriver = driverIdStr === userId;
        if (iAmDriver) {
          const reqData = await getIncomingRequests();
          const reqList = Array.isArray(reqData) ? reqData : reqData.requests || [];
          if (active) setIncomingRequests(reqList.filter((r) => (r.tripId?._id || r.tripId) === id));
        } else {
          const reqData = await getMyRequests();
          const reqList = Array.isArray(reqData) ? reqData : reqData.requests || [];
          if (active) setMyRequest(reqList.find((r) => (r.tripId?._id || r.tripId) === id) || null);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load trip');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, userId]);

  const canChat = isDriver
    ? incomingRequests.some((r) => r.status === 'accepted')
    : myRequest?.status === 'accepted';

  useEffect(() => {
    if (!canChat) return;
    let cancelled = false;

    (async () => {
      try {
        const { messages: history } = await getTripMessages(id);
        if (!cancelled) setMessages(history || []);
      } catch {
        // non-fatal
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

  const runAction = async (fn, successMsg) => {
    setActionError('');
    setBusy(true);
    try {
      await fn();
      if (successMsg) showToast(successMsg, 'success');
      await loadCore();
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      setActionError(msg);
      showToast(msg, 'error');
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
      showToast('Rating submitted successfully! Thank you.', 'success');
    } catch (err) {
      if (err.response?.status === 409) {
        setRatedIds((prev) => new Set(prev).add(rateeId));
        showToast('You have already rated this user.', 'info');
      } else {
        const msg = err.response?.data?.message || 'Failed to submit rating';
        setRatingError(msg);
        showToast(msg, 'error');
      }
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-400">Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const acceptedRiders = incomingRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          to={isDriver ? '/my-trips' : '/my-requests'}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors mb-2"
        >
          <span>←</span> Back to Overview
        </Link>
      </div>

      {/* Trip Overview Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {trip.status}
              </span>
              {isDriver && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Driver View
                </span>
              )}
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <span className="truncate">{trip.origin?.address || 'Origin'}</span>
              <span className="text-indigo-400">→</span>
              <span className="truncate">{trip.destination?.address || 'Destination'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span>🕒 Departs: {formatDateTime(trip.departureTime)}</span>
              <span>•</span>
              <span>💺 {trip.seatsBooked} / {trip.seatsTotal} booked</span>
              <span>•</span>
              <span>👤 Driver: <strong className="text-slate-200">{trip.driverId?.name || 'Unknown'}</strong> (⭐ {trip.driverId?.ratingAverage?.toFixed(1) ?? 'N/A'})</span>
            </div>
          </div>

          {isDriver && ['active', 'full'].includes(trip.status) && (
            <button
              disabled={busy}
              onClick={() => runAction(() => completeTrip(id), 'Trip completed!')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 shrink-0"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {actionError}
        </div>
      )}

      {/* Roster & Request Status Card */}
      {isDriver ? (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300">
            🙋‍♂️ Rider Requests ({incomingRequests.length})
          </h2>
          {incomingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No rider requests for this trip yet.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {incomingRequests.map((r) => (
                <div key={r._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {r.riderId?.name?.[0]?.toUpperCase() || 'R'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-100">{r.riderId?.name || 'Rider'}</span>
                      <span className="text-slate-400 ml-2">⭐ {r.riderId?.ratingAverage?.toFixed(1) ?? 'N/A'}</span>
                      <span className="ml-2 capitalize text-slate-400">({r.status})</span>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={busy}
                        onClick={() => runAction(() => acceptRequest(r._id), 'Accepted rider request')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => runAction(() => declineRequest(r._id), 'Declined rider request')}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Request Status</p>
            <p className="font-heading font-bold text-slate-100 capitalize mt-1">
              {myRequest?.status || 'Not requested'}
            </p>
          </div>

          {!myRequest && (
            <button
              disabled={busy}
              onClick={() => runAction(() => createRequest(id), 'Seat requested successfully!')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              Request Seat
            </button>
          )}

          {['pending', 'accepted'].includes(myRequest?.status) && (
            <button
              disabled={busy}
              onClick={() => runAction(() => cancelRequest(myRequest._id), 'Request cancelled')}
              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}

      {/* Real-time Socket Chat */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>💬</span> Live Trip Chat
        </h2>

        {!canChat ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <span className="text-2xl block opacity-40">🔒</span>
            <p className="text-xs text-slate-400">
              Trip chat unlocks automatically once a rider request has been accepted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-72 overflow-y-auto rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 shadow-inner">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                  No messages yet — say hi to your co-commuters!
                </div>
              ) : (
                messages.map((m) => {
                  const senderIdStr = m.senderId?._id || m.senderId;
                  const isMe = senderIdStr === userId;

                  return (
                    <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                        }`}
                      >
                        {!isMe && m.senderId?.name && (
                          <span className="block text-[10px] font-bold text-indigo-300 mb-0.5">
                            {m.senderId.name}
                          </span>
                        )}
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 5-Star Rating Section upon completion */}
      {trip.status === 'completed' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>⭐</span> Rate Your Trip Experience
          </h2>

          {ratingError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
              {ratingError}
            </div>
          )}

          {isDriver ? (
            acceptedRiders.length === 0 ? (
              <p className="text-xs text-slate-400">No riders to rate on this trip.</p>
            ) : (
              <div className="space-y-3">
                {acceptedRiders.map((r) =>
                  r.riderId?._id && (ratedIds.has(r.riderId._id) ? (
                    <div key={r._id} className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                      <span>✓</span> Rated {r.riderId.name}
                    </div>
                  ) : (
                    <RatingForm
                      key={r._id}
                      label={`Rate passenger ${r.riderId.name}`}
                      busy={ratingBusy}
                      onSubmit={(stars, comment) => handleRate(r.riderId._id, stars, comment)}
                    />
                  ))
                )}
              </div>
            )
          ) : trip.driverId?._id && (ratedIds.has(trip.driverId._id) ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <span>✓</span> Rated driver {trip.driverId.name}
            </div>
          ) : myRequest?.status === 'accepted' ? (
            <RatingForm
              label={`Rate driver ${trip.driverId.name}`}
              busy={ratingBusy}
              onSubmit={(stars, comment) => handleRate(trip.driverId._id, stars, comment)}
            />
          ) : (
            <p className="text-xs text-slate-400">You were not an accepted rider on this trip.</p>
          ))}
        </div>
      )}
    </div>
  );
}