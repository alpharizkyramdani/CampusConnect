import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No notifications yet. You're completely up to date!
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = !!n.read_at;
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors text-xs flex items-start gap-3 ${
                        !isRead ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!isRead ? 'bg-brand-600' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800">{n.data?.title || 'System Notification'}</div>
                        <div className="text-slate-600 mt-0.5 leading-relaxed">{n.data?.message || 'New activity in your campus.'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
