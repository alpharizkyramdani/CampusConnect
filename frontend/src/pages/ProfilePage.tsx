import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Shield,
  Calendar,
  CheckCircle2,
  Camera,
  Upload,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, studentProfile, lecturerProfile, roleAssignments, activeAssignment, refreshUser } = useAuth();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });

  React.useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}/follow-status`).then((res) => {
        if (res.data.success) {
          setFollowStats(res.data.data);
        }
      }).catch(() => {});
    }
  }, [user?.id]);

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.url) {
        setAvatarUrl(res.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto profil');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name: user.name,
        phone: user.phone,
        avatar: avatarUrl.trim() || null,
      });
      if (res.data.success) {
        await refreshUser();
        setAvatarModalOpen(false);
        alert('Foto profil berhasil diperbarui!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan foto profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Account Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your verified identity, institutional credentials, and assigned platform roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs text-center flex flex-col items-center">
          <div className="relative group">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md ring-2 ring-brand-100"
            />
            <button
              onClick={() => {
                setAvatarUrl(user?.avatar || '');
                setAvatarModalOpen(true);
              }}
              title="Ganti Foto Profil"
              className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-md transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="mt-4 font-extrabold text-lg text-navy">{user?.name}</h2>
          <p className="text-xs text-slate-400">{user?.email}</p>

          <button
            onClick={() => {
              setAvatarUrl(user?.avatar || '');
              setAvatarModalOpen(true);
            }}
            className="mt-3 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-colors border border-brand-200 flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ganti Foto Profil</span>
          </button>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {roleAssignments.map((a) => (
              <Badge key={a.id} variant="blue" size="sm">
                {a.role?.name}
              </Badge>
            ))}
          </div>

          {/* Social Followers & Following Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 w-full p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <span className="font-extrabold text-navy text-base block">{followStats.followers_count}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pengikut</span>
            </div>
            <div>
              <span className="font-extrabold text-navy text-base block">{followStats.following_count}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mengikuti</span>
            </div>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone || 'No phone set'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="truncate">{activeAssignment?.university?.name || 'CampusConnect System'}</span>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Academic Credentials
            </h3>

            {studentProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Student ID (NIM)</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{studentProfile.nim}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Study Program</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.study_program || 'Informatics'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Enrollment Year</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.enrollment_year || 2022}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Department</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.department?.name || 'Informatics Engineering'}</span>
                </div>
              </div>
            )}

            {lecturerProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Lecturer ID (NIDN)</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{lecturerProfile.nidn}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Academic Title</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProfile.title || 'Dr.'}</span>
                </div>
                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Specialization</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProfile.specialization || 'Computer Science'}</span>
                </div>
              </div>
            )}

            {!studentProfile && !lecturerProfile && (
              <div className="text-xs text-slate-500 py-4">
                Platform-level administrator account.
              </div>
            )}
          </div>

          {/* Active Contextual Assignments */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              Active Scoped Role Assignments
            </h3>

            <div className="space-y-3">
              {roleAssignments.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {a.role?.name}
                      {a.id === activeAssignment?.id && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-600 text-white font-bold">
                          Current Active
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Scope: {a.organization?.name || a.department?.name || a.university?.name || 'Platform Wide'}
                    </div>
                  </div>
                  <Badge variant={a.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Ganti Foto Profil */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Ganti Foto Profil Akun"
      >
        <form onSubmit={handleSaveAvatar} className="space-y-5 text-xs">
          <p className="text-slate-500">
            Unggah foto profil baru dari galeri/penyimpanan perangkat Anda atau masukkan tautan URL gambar secara langsung.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-brand-200 shrink-0"
            />

            <div className="flex-1 w-full space-y-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto dari Perangkat</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
                />
              </label>

              {uploading && (
                <div className="text-xs text-brand-600 font-semibold animate-pulse">
                  Mengunggah gambar... Mohon tunggu.
                </div>
              )}

              {avatarUrl && (
                <div>
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-rose-600 hover:underline text-[11px] font-semibold"
                  >
                    Gunakan avatar inisial nama standar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Atau Tempel Tautan Gambar (URL)</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAvatarModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Foto Profil'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

