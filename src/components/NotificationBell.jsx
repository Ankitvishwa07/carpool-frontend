import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { getNotificationSocket } from '../api/socket';

const TYPE_CONFIG = {
  request_received: { label: 'New ride request', icon: '🙋‍♂️', color: 'text-emerald-700' },
  request_accepted: { label: 'Request accepted!', icon: '✅', color: 'text-emerald-600' },
  request_declined: { label: 'Request declined', icon: '❌', color: 'text-rose-600' },
  request_cancelled: { label: 'Rider cancelled', icon: '⚠️', color: 'text-amber-600' },
  new_message: { label: 'New message', icon: '💬', color: 'text-sky-600' },
  rating_received: { label: 'New rating', icon: '⭐', color: 'text-amber-500' },
  trip_cancelled: { label: 'Trip cancelled', icon: '🚫', color: 'text-rose-600' },
};

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getMyNotifications({ limit: 15 }),
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const socket = getNotificationSocket();
    const handleNew = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };
    socket.on('notification', handleNew);
    return () => socket.off('notification', handleNew);
  }, [queryClient]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (notification) => {
    if (notification.isRead) return;
    markReadMutation.mutate(notification._id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-emerald-50 transition-all border border-emerald-200 focus-ring bg-white"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
      >
        {/* Sleek SVG Bell Line Icon */}
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-emerald-100 rounded-3xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-5 py-4 bg-emerald-50/70 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#16A34A] hover:underline font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-emerald-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <span className="text-3xl block opacity-40">🔕</span>
                <p className="text-sm text-slate-800 font-bold">No notifications yet</p>
                <p className="text-xs text-slate-500">We'll alert you here for updates on your rides.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || { label: n.title || 'Notification', icon: '📢', color: 'text-emerald-700' };
                return (
                  <Link
                    key={n._id}
                    to={n.tripId ? `/trips/${n.tripId}` : '#'}
                    onClick={() => {
                      handleItemClick(n);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3.5 p-4 transition-colors ${
                      n.isRead ? 'bg-transparent opacity-70 hover:bg-emerald-50/50' : 'bg-emerald-50/30 hover:bg-emerald-50/80'
                    }`}
                  >
                    <div className="text-xl shrink-0 p-2 rounded-2xl bg-emerald-100/60 border border-emerald-200">
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold ${config.color}`}>{config.label}</p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0"></span>
                        )}
                      </div>
                      {n.body && <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>}
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