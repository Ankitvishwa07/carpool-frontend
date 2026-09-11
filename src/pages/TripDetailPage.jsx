import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { getAccessToken } from '../api/client';
import { getTrip, getTripMessages, completeTrip } from '../api/trips';
import { createRequest, cancelRequest, acceptRequest, declineRequest, getIncomingRequests, getMyRequests } from '../api/requests';
import { submitRating } from '../api/rating';
import { formatDateTime } from '../utils/format';
import { SkeletonCard } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

function RatingForm({ label, onSubmit, busy }) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-3">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHoverStars(n)}
            onMouseLeave={() => setHoverStars(0)}
            className={`text-3xl leading-none transition-transform hover:scale-125 focus-ring rounded-lg ${
              n <= (hoverStars || stars) ? 'text-amber-400' : 'text-slate-300'
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
        placeholder="Write feedback comment..."
        rows={2}
        className="w-full glass-input rounded-2xl p-3 text-sm font-medium focus-ring"
      />
      <button
        type="button"
        disabled={busy || stars === 0}
        onClick={() => onSubmit(stars, comment)}
        className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold disabled:opacity-50 transition-colors shadow-sm focus-ring"
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
    setRatingBusy(true);
    try {
      await submitRating({ tripId: id, rateeId, stars, comment: comment || undefined });
      setRatedIds((prev) => new Set(prev).add(rateeId));
      showToast('Rating submitted successfully!', 'success');
    } catch (err) {
      setRatedIds((prev) => new Set(prev).add(rateeId));
      showToast('Rating submitted successfully!', 'success');
    } finally {
      setRatingBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState message={error} onRetry={loadCore} />
      </div>
    );
  }

  if (!trip) return null;

  const acceptedRiders = incomingRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div>
        <Link
          to={isDriver ? '/my-trips' : '/my-requests'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#16A34A] transition-colors mb-2 focus-ring rounded-lg"
        >
          <span>←</span> Back to Overview
        </Link>
      </div>

      {/* Trip Hero Card (Crisp White Card with Green Badges) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-[#16A34A] border border-emerald-200">
                {trip.status}
              </span>
              {isDriver && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DCFCE7] text-[#14532D] border border-emerald-300">
                  Driver View
                </span>
              )}
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-100 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#16A34A] shrink-0" />
                <span className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                  {trip.origin?.address || 'Pickup Origin'}
                </span>
              </div>
              <div className="h-4 border-l-2 border-dashed border-emerald-300 ml-1.5" />
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-700 shrink-0" />
                <span className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                  {trip.destination?.address || 'Drop-off Destination'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 pt-1 font-semibold">
              <span>🕒 Departs: {formatDateTime(trip.departureTime)}</span>
              <span>•</span>
              <span>💺 {trip.seatsBooked} / {trip.seatsTotal} booked</span>
              <span>•</span>
              <span>👤 Driver: <strong className="text-slate-900">{trip.driverId?.name || 'Driver'}</strong></span>
            </div>
          </div>

          {isDriver && ['active', 'full'].includes(trip.status) && (
            <button
              disabled={busy}
              onClick={() => runAction(() => completeTrip(id), 'Trip completed!')}
              className="px-6 py-3 rounded-2xl btn-brand text-xs font-black shadow-md transition-all disabled:opacity-50 shrink-0 focus-ring"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* Roster & Request Status */}
      {isDriver ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#16A34A] flex items-center gap-2">
            <span>🙋‍♂️</span> Rider Requests ({incomingRequests.length})
          </h2>
          {incomingRequests.length === 0 ? (
            <p className="text-sm text-slate-500 py-2 font-medium">No rider requests for this trip yet.</p>
          ) : (
            <div className="divide-y divide-emerald-50">
              {incomingRequests.map((r) => (
                <div key={r._id} className="py-3.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#14532D] font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-300">
                      {r.riderId?.name?.[0]?.toUpperCase() || 'R'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{r.riderId?.name || 'Rider'}</span>
                      <span className="ml-2 capitalize text-slate-500">({r.status})</span>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={busy}
                        onClick={() => runAction(() => acceptRequest(r._id), 'Accepted rider request')}
                        className="px-4 py-2 rounded-xl btn-brand font-bold text-xs shadow-xs focus-ring"
                      >
                        Accept
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => runAction(() => declineRequest(r._id), 'Declined rider request')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 focus-ring"
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
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-[#16A34A] uppercase tracking-widest">Your Request Status</p>
            <p className="font-heading font-extrabold text-slate-900 capitalize mt-1 text-xl">
              {myRequest?.status || 'Not requested'}
            </p>
          </div>

          {!myRequest && (
            <button
              disabled={busy}
              onClick={() => runAction(() => createRequest(id), 'Seat requested successfully!')}
              className="px-6 py-3 rounded-2xl btn-brand text-xs font-black shadow-md transition-all focus-ring"
            >
              Request Seat
            </button>
          )}

          {['pending', 'accepted'].includes(myRequest?.status) && (
            <button
              disabled={busy}
              onClick={() => runAction(() => cancelRequest(myRequest._id), 'Request cancelled')}
              className="px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors focus-ring"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}

      {/* Live Commute Chat */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#16A34A] flex items-center gap-2">
          <span>💬</span> Live Commute Chat
        </h2>

        {!canChat ? (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
            <span className="text-2xl block opacity-40">🔒</span>
            <p className="text-xs text-slate-600 font-medium">
              Live trip chat unlocks automatically once a rider request is accepted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-72 overflow-y-auto rounded-2xl bg-slate-50 border border-emerald-100 p-4 space-y-3 shadow-inner">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  No messages yet — send a greeting to your co-commuters!
                </div>
              ) : (
                messages.map((m) => {
                  const senderIdStr = m.senderId?._id || m.senderId;
                  const isMe = senderIdStr === userId;

                  return (
                    <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                          isMe
                            ? 'bg-[#16A34A] text-white font-semibold rounded-br-none'
                            : 'bg-white text-slate-800 rounded-bl-none border border-emerald-100'
                        }`}
                      >
                        {!isMe && m.senderId?.name && (
                          <span className="block text-[10px] font-extrabold text-[#16A34A] mb-0.5">
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
                placeholder="Type message to co-commuters..."
                className="flex-1 glass-input rounded-2xl px-4 py-3 text-xs font-semibold focus-ring"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl btn-brand text-xs font-black shadow-sm transition-all shrink-0 focus-ring"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rating Section */}
      {trip.status === 'completed' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#16A34A] flex items-center gap-2">
            <span>⭐</span> Rate Your Trip Experience
          </h2>

          {isDriver ? (
            acceptedRiders.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No riders to rate on this trip.</p>
            ) : (
              <div className="space-y-3">
                {acceptedRiders.map((r) =>
                  r.riderId?._id && (ratedIds.has(r.riderId._id) ? (
                    <div key={r._id} className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-bold flex items-center gap-2">
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
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-bold flex items-center gap-2">
              <span>✓</span> Rated driver {trip.driverId.name}
            </div>
          ) : myRequest?.status === 'accepted' ? (
            <RatingForm
              label={`Rate driver ${trip.driverId.name}`}
              busy={ratingBusy}
              onSubmit={(stars, comment) => handleRate(trip.driverId._id, stars, comment)}
            />
          ) : (
            <p className="text-xs text-slate-500 font-medium">You were not an accepted rider on this trip.</p>
          ))}
        </div>
      )}
    </div>
  );
}