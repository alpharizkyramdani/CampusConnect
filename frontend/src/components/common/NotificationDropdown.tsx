import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Bell,
  CheckCheck,
  UserPlus,
  UserCheck,
  MessageSquare,
  Heart,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [followedMap, setFollowedMap] = useState<Record<number, boolean>>({});

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

  // Poll for notifications every 6 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
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

  const markSingleRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const handleFollowBack = async (e: React.MouseEvent, senderId: number, notifId: string) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/users/${senderId}/follow`);
      if (res.data.success) {
        setFollowedMap((prev) => ({
          ...prev,
          [senderId]: res.data.is_following,
        }));
        markSingleRead(notifId);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengikuti pengguna');
    }
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="font-extrabold text-sm text-navy flex items-center gap-2">
                Notifikasi Kampus
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-bold rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-40 text-slate-300" />
                  <p>Belum ada notifikasi baru.</p>
                  <p className="text-[11px] text-slate-400">Aktivitas teman, follow, dan pesan akan muncul di sini!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = !!n.read_at;
                  const data = n.data || {};
                  const isFollowNotif = data.type === 'follow';
                  const isMsgNotif = data.type === 'message';
                  const isLikeNotif = data.type === 'like';
                  const isCommentNotif = data.type === 'comment';
                  const isFollowedBack = !!followedMap[data.sender_id];

                  return (
                    <div
                      key={n.id}
                      onClick={() => !isRead && markSingleRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors text-xs flex items-start gap-3 cursor-pointer ${
                        !isRead ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      {/* Avatar or Icon */}
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={
                            data.sender_avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              data.sender_name || 'U'
                            )}&background=2563EB&color=fff`
                          }
                          alt={data.sender_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        {isFollowNotif && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-brand-600 text-white rounded-full">
                            <UserPlus className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {isMsgNotif && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-purple-600 text-white rounded-full">
                            <MessageSquare className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {isLikeNotif && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-rose-500 text-white rounded-full">
                            <Heart className="w-2.5 h-2.5 fill-white" />
                          </span>
                        )}
                        {isCommentNotif && (
                          <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full">
                            <MessageSquare className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-extrabold text-navy truncate">
                            {data.title || 'Pemberitahuan Sistem'}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {data.message || 'Ada aktivitas baru di kampus Anda.'}
                        </p>

                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {/* Interactive Follow-Back Action */}
                        {isFollowNotif && data.sender_id && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleFollowBack(e, data.sender_id, n.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                                isFollowedBack
                                  ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                                  : 'bg-brand-600 text-white hover:bg-brand-700'
                              }`}
                            >
                              {isFollowedBack ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Mengikuti ✓</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Ikuti Balik</span>
                                </>
                              )}
                            </button>

                            <Link
                              to={`/profile/${data.sender_id}`}
                              onClick={() => {
                                setOpen(false);
                                markSingleRead(n.id);
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              <span>Profil</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                          </div>
                        )}

                        {/* Direct Message Action */}
                        {isMsgNotif && data.sender_id && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                markSingleRead(n.id);
                                navigate('/messages', { state: { partnerId: data.sender_id } });
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Balas Pesan</span>
                            </button>
                          </div>
                        )}

                        {/* Post Like or Comment Action */}
                        {(isLikeNotif || isCommentNotif) && (
                          <div className="mt-2 flex items-center gap-2">
                            <Link
                              to="/feed"
                              onClick={() => {
                                setOpen(false);
                                markSingleRead(n.id);
                              }}
                              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                            >
                              <span>Buka Timeline Feed</span>
                              <ExternalLink className="w-3 h-3 text-brand-500" />
                            </Link>
                          </div>
                        )}
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
