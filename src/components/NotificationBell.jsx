import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { getNotificationSocket } from '../api/socket';

const TYPE_LABELS = {
  request_received: 'New ride request',
  request_accepted: 'Request accepted',
  request_declined: 'Request declined',
  request_cancelled: 'Rider cancelled',
  new_message: 'New message',
  rating_received: 'New rating',
  trip_cancelled: 'Trip cancelled',
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
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // non-fatal — bell just stays empty
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
      <button onClick={() => setOpen((p) => !p)} className="relative text-gray-600 hover:text-indigo-600" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-400 px-3 py-4 text-center">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n._id}
                to={n.tripId ? `/trips/${n.tripId}` : '#'}
                onClick={() => handleItemClick(n)}
                className={`block px-3 py-2 text-sm border-b last:border-0 hover:bg-gray-50 ${
                  n.isRead ? 'text-gray-500' : 'text-gray-900 bg-indigo-50/50 font-medium'
                }`}
              >
                <p>{TYPE_LABELS[n.type] || n.title}</p>
                {n.body && <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}