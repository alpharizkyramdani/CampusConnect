import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import {
  Shield,
  Lock,
  Eye,
  MessageSquare,
  Bell,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  LogOut,
  Save,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlockedUser {
  id: number;
  blocked_id: number;
  blocked: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
}

export const PrivacySettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [profileVisibility, setProfileVisibility] = useState<'public' | 'campus' | 'followers' | 'private'>('campus');
  const [dmPermission, setDmPermission] = useState<'everyone' | 'followers' | 'nobody'>('everyone');

  // Notifications
  const [notifyFollow, setNotifyFollow] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState(true);
  const [notifyLike, setNotifyLike] = useState(true);
  const [notifyComment, setNotifyComment] = useState(true);
  const [notifyEvent, setNotifyEvent] = useState(true);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/privacy/settings');
      if (res.data.success) {
        const s = res.data.data.settings;
        setProfileVisibility(s.profile_visibility);
        setDmPermission(s.dm_permission);
        setNotifyFollow(s.notify_follow);
        setNotifyMessage(s.notify_message);
        setNotifyLike(s.notify_like);
        setNotifyComment(s.notify_comment);
        setNotifyEvent(s.notify_event);
        setBlockedUsers(res.data.data.blocked_users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/privacy/settings', {
        profile_visibility: profileVisibility,
        dm_permission: dmPermission,
        notify_follow: notifyFollow,
        notify_message: notifyMessage,
        notify_like: notifyLike,
        notify_comment: notifyComment,
        notify_event: notifyEvent,
      });

      if (res.data.success) {
        setSuccessMsg('Pengaturan privasi dan keamanan akun berhasil diperbarui di server.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockUser = async (targetId: number, name: string) => {
    if (!window.confirm(`Buka blokir untuk ${name}? Akun ini akan dapat melihat profil Anda kembali.`)) return;

    try {
      const res = await api.delete(`/users/${targetId}/block`);
      if (res.data.success) {
        setBlockedUsers((prev) => prev.filter((b) => b.blocked.id !== targetId));
        alert(`Pemblokiran untuk ${name} berhasil dicabut.`);
      }
    } catch (e) {
      alert('Gagal membuka blokir.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Memuat konfigurasi privasi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Pengaturan Privasi & Keamanan Akun</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kontrol siapa yang dapat melihat profil Anda, mengirim pesan langsung (DM), serta kelola daftar akun yang diblokir.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Visibility */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Eye className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-extrabold text-navy">Visibilitas Profil & Aktivitas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              {
                id: 'campus',
                title: 'Khusus Civitas Kampus (Direkomendasikan)',
                desc: 'Hanya mahasiswa dan dosen dari universitas Anda yang dapat melihat profil lengkap.',
              },
              {
                id: 'public',
                title: 'Publik (Lintas Universitas)',
                desc: 'Profil Anda dapat ditemukan oleh seluruh civitas kampus yang terdaftar di CampusConnect.',
              },
              {
                id: 'followers',
                title: 'Hanya Pengikut (Followers Only)',
                desc: 'Hanya orang yang sudah mengikuti akun Anda yang dapat melihat informasi bio dan timeline.',
              },
              {
                id: 'private',
                title: 'Privat Tertutup',
                desc: 'Profil disembunyikan dari hasil pencarian publik.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  profileVisibility === opt.id
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-xs text-navy leading-snug">{opt.title}</span>
                  <input
                    type="radio"
                    name="profile_visibility"
                    value={opt.id}
                    checked={profileVisibility === opt.id}
                    onChange={(e) => setProfileVisibility(e.target.value as any)}
                    className="mt-0.5 text-brand-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{opt.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Direct Messages Permissions */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-extrabold text-navy">Izin Pesan Langsung (Direct Messages)</h2>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                id: 'everyone',
                title: 'Semua Civitas Kampus',
                desc: 'Setiap mahasiswa atau dosen yang terverifikasi dapat memulai obrolan dengan Anda.',
              },
              {
                id: 'followers',
                title: 'Hanya Orang yang Saling Mengikuti',
                desc: 'Hanya civitas yang Anda ikuti atau mengikuti Anda yang dapat mengirimkan DM.',
              },
              {
                id: 'nobody',
                title: 'Nonaktifkan Pesan Privat',
                desc: 'Tidak ada yang dapat memulai pesan privat baru dengan akun Anda.',
              },
            ].map((dm) => (
              <label
                key={dm.id}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  dmPermission === dm.id
                    ? 'border-purple-600 bg-purple-50/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-navy">{dm.title}</div>
                  <div className="text-[11px] text-slate-500">{dm.desc}</div>
                </div>
                <input
                  type="radio"
                  name="dm_permission"
                  value={dm.id}
                  checked={dmPermission === dm.id}
                  onChange={(e) => setDmPermission(e.target.value as any)}
                  className="text-purple-600"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-extrabold text-navy">Preferensi Notifikasi Lonceng</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Notifikasi Pengikut Baru', state: notifyFollow, set: setNotifyFollow },
              { label: 'Notifikasi Pesan Chat Masuk', state: notifyMessage, set: setNotifyMessage },
              { label: 'Notifikasi Like Postingan', state: notifyLike, set: setNotifyLike },
              { label: 'Notifikasi Balasan Komentar', state: notifyComment, set: setNotifyComment },
              { label: 'Pengingat Acara & Webinar', state: notifyEvent, set: setNotifyEvent },
            ].map((notif, idx) => (
              <label
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <span className="font-semibold text-slate-700">{notif.label}</span>
                <input
                  type="checkbox"
                  checked={notif.state}
                  onChange={(e) => notif.set(e.target.checked)}
                  className="rounded-md text-brand-600 w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Privasi'}</span>
          </button>
        </div>
      </form>

      {/* Blocked Users Section */}
      <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-extrabold text-navy">Daftar Akun yang Diblokir ({blockedUsers.length})</h2>
          </div>
        </div>

        {blockedUsers.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Anda belum memblokir pengguna mana pun.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedUsers.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.blocked?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.blocked?.name || 'U')}&background=DC2626&color=fff`}
                    alt={item.blocked?.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-navy">{item.blocked?.name}</div>
                    <div className="text-[10px] text-slate-400">{item.blocked?.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnblockUser(item.blocked?.id, item.blocked?.name)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Buka Blokir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Security Shortcuts */}
      <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-3 text-xs">
        <h2 className="text-sm font-extrabold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kredensial & Sesi Autentikasi</span>
        </h2>
        <p className="text-slate-500">
          Untuk mengganti kata sandi atau memperbarui informasi profil legal institusional, silakan kunjungi halaman pengaturan umum.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Buka Pengaturan Akun & Password</span>
        </Link>
      </div>
    </div>
  );
};

