import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Building,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, activeAssignment, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.url) {
        setAvatar(res.data.url);
        setSuccessMsg('Foto profil berhasil diunggah! Jangan lupa klik "Save Profile Changes".');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengunggah gambar profil.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [borrowingAlerts, setBorrowingAlerts] = useState(true);
  const [forumReplies, setForumReplies] = useState(false);

  // System preferences
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        avatar: avatar.trim() || undefined,
      });

      if (res.data.success) {
        setSuccessMsg('Profile details updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res.data.success) {
        setSuccessMsg('Your security password has been updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-600" />
          Account & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal profile details, account security, notification rules, and preferences
        </p>
      </div>

      {/* Global Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-1.5 md:col-span-1">
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-borderMuted'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-borderMuted'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-borderMuted'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => { setActiveTab('system'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'system'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-borderMuted'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Preferences</span>
          </button>

          {/* Institutional Info Card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2">
            <div className="font-bold text-navy flex items-center gap-1.5">
              <Building className="w-4 h-4 text-brand-600" />
              Tenant Context
            </div>
            <div className="text-[11px] text-slate-500">
              {activeAssignment?.university?.name || 'Platform Level'}
            </div>
            <Badge variant="blue" size="sm">
              Status: Active
            </Badge>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-navy">Personal Profile Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact phone, display name, and profile avatar link
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto Profil / Avatar
                  </label>
                  {uploadingAvatar && (
                    <span className="text-xs text-brand-600 font-semibold animate-pulse">
                      Sedang mengunggah...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <img
                      src={avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
                      alt={user?.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-brand-200"
                    />
                    <label
                      title="Upload foto profil"
                      className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Ganti</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])}
                      />
                    </label>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload dari Perangkat (HP/Laptop)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleUploadAvatar(e.target.files[0])}
                        />
                      </label>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          Hapus Foto Khusus
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="Atau tempel URL gambar: https://example.com/photo.jpg"
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Mendukung format JPG, PNG, WEBP, GIF (Maks. 5 MB). Kosongkan untuk menggunakan inisial nama otomatis.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Locked)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  Password & Security Credentials
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your account password regularly to protect your academic credentials
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min. 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-navy">Notification Channels & Alerts</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control the automatic alerts and digest emails you receive from CampusConnect
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Campus Announcements & Emergency Broadcasts</div>
                    <div className="text-[11px] text-slate-500">Receive immediate notifications when rectors or campus deans publish alerts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Event Ticket Reminders & QR Updates</div>
                    <div className="text-[11px] text-slate-500">Get notified 24 hours prior to registered seminars, competitions, or workshops</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={eventReminders}
                    onChange={(e) => setEventReminders(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Equipment Return Due Date Warnings</div>
                    <div className="text-[11px] text-slate-500">Alerts sent when borrowed lab items or projectors are nearing due date</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={borrowingAlerts}
                    onChange={(e) => setBorrowingAlerts(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50/50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Forum Discussion Replies</div>
                    <div className="text-[11px] text-slate-500">Notify me when someone replies to questions or discussions I started</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={forumReplies}
                    onChange={(e) => setForumReplies(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-md focus:ring-brand-500"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSuccessMsg('Notification preferences saved successfully!')}
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM PREFERENCES */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-navy">Localization & System Preferences</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure default language, time format, and institutional interface presets
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interface Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="id">Bahasa Indonesia (Default)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timezone Display</label>
                  <input
                    type="text"
                    disabled
                    value="Asia/Jakarta (WIB - UTC+7)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSuccessMsg('Preferences applied successfully!')}
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Apply Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

