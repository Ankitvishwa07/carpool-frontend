import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { getNotificationSocket } from '../api/socket';

const TYPE_CONFIG = {
  request_received: { label: 'New ride request', icon: '🙋‍♂️', color: 'text-indigo-400' },
  request_accepted: { label: 'Request accepted!', icon: '✅', color: 'text-emerald-400' },
  request_declined: { label: 'Request declined', icon: '❌', color: 'text-rose-400' },
  request_cancelled: { label: 'Rider cancelled', icon: '⚠️', color: 'text-amber-400' },
  new_message: { label: 'New message', icon: '💬', color: 'text-sky-400' },
  rating_received: { label: 'New rating', icon: '⭐', color: 'text-yellow-400' },
  trip_cancelled: { label: 'Trip cancelled', icon: '🚫', color: 'text-rose-400' },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyNotifications({ limit: 15 });
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // non-fatal
      }
    })();

    const socket = getNotificationSocket();
    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 15));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification', handleNew);

    return () => socket.off('notification', handleNew);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (notification) => {
    if (notification.isRead) return;
    try {
      await markNotificationRead(notification._id);
      setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // non-fatal
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // non-fatal
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/50"
        aria-label="Notifications"
      >
        <span className="text-lg leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-slate-900 animate-badge-pulse shadow-lg shadow-rose-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-sm text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <span className="text-3xl block opacity-40">🔕</span>
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500">We'll alert you here for updates on your rides.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || { label: n.title || 'Notification', icon: '📢', color: 'text-indigo-400' };
                return (
                  <Link
                    key={n._id}
                    to={n.tripId ? `/trips/${n.tripId}` : '#'}
                    onClick={() => {
                      handleItemClick(n);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-colors ${
                      n.isRead ? 'bg-transparent opacity-75 hover:bg-slate-800/40' : 'bg-indigo-950/30 hover:bg-indigo-900/40'
                    }`}
                  >
                    <div className="text-xl shrink-0 p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-semibold ${config.color}`}>{config.label}</p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                        )}
                      </div>
                      {n.body && <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}