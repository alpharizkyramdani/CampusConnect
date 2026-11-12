import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CampusPost, User } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Shield,
  CheckCircle2,
  Camera,
  Upload,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
  Sparkles,
  ArrowLeft,
  Calendar,
  Heart,
  Repeat2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user: authUser, studentProfile: authStudentProfile, lecturerProfile: authLecturerProfile, roleAssignments: authRoleAssignments, activeAssignment, refreshUser } = useAuth();

  const isOtherUser = Boolean(id && parseInt(id) !== authUser?.id);
  const targetUserId = isOtherUser ? parseInt(id!) : authUser?.id;

  // Other user state
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(isOtherUser);

  // Social & Follow stats
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0, is_following: false });
  const [userPosts, setUserPosts] = useState<CampusPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Followers / Following Modal
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  const [followList, setFollowList] = useState<any[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  // Avatar Modal (for own profile)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch profile user details
  useEffect(() => {
    if (isOtherUser && targetUserId) {
      setLoadingProfile(true);
      api.get(`/users/${targetUserId}`)
        .then((res) => {
          if (res.data.success) {
            setProfileUser(res.data.data);
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingProfile(false));
    } else {
      setProfileUser(authUser);
      setLoadingProfile(false);
    }
  }, [id, authUser]);

  // Fetch follow stats and user posts
  useEffect(() => {
    if (targetUserId) {
      api.get(`/users/${targetUserId}/follow-status`)
        .then((res) => {
          if (res.data.success) {
            setFollowStats(res.data.data);
          }
        })
        .catch(() => {});

      setLoadingPosts(true);
      api.get('/feed', {
        params: { feed_type: 'user', user_id: targetUserId },
      })
        .then((res) => {
          if (res.data.success) {
            setUserPosts(res.data.data.data || res.data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingPosts(false));
    }
  }, [targetUserId]);

  const handleToggleFollow = async () => {
    if (!targetUserId) return;
    try {
      const res = await api.post(`/users/${targetUserId}/follow`);
      if (res.data.success) {
        setFollowStats((prev) => ({
          ...prev,
          is_following: res.data.is_following,
          followers_count: res.data.followers_count,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openFollowListModal = async (type: 'followers' | 'following') => {
    if (!targetUserId) return;
    setFollowModalType(type);
    setFollowModalOpen(true);
    setLoadingFollowList(true);

    try {
      const res = await api.get(`/users/${targetUserId}/${type}`);
      if (res.data.success) {
        setFollowList(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFollowList(false);
    }
  };

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
    if (!authUser) return;
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name: authUser.name,
        phone: authUser.phone,
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

  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400 font-sans">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Memuat profil pengguna...</p>
      </div>
    );
  }

  const currentUser = isOtherUser ? profileUser : authUser;
  const studentProf = isOtherUser ? profileUser?.student_profile : authStudentProfile;
  const lecturerProf = isOtherUser ? profileUser?.lecturer_profile : authLecturerProfile;
  const assignments = isOtherUser ? (profileUser?.assignments || profileUser?.roles || []) : authRoleAssignments;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Back button if viewing another user's profile */}
      {isOtherUser && (
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">
          {isOtherUser ? `Profil Civitas: ${currentUser?.name}` : 'Profil Akun & Kredensial'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isOtherUser
            ? 'Informasi identitas kampus, departemen, dan aktivitas timeline postingan pengguna'
            : 'Kelola identitas terverifikasi, kredensial institusional, dan riwayat peran Anda'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs text-center flex flex-col items-center">
          <div className="relative group">
            <img
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=2563EB&color=fff`}
              alt={currentUser?.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md ring-2 ring-brand-100"
            />
            {!isOtherUser && (
              <button
                onClick={() => {
                  setAvatarUrl(currentUser?.avatar || '');
                  setAvatarModalOpen(true);
                }}
                title="Ganti Foto Profil"
                className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-md transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <h2 className="mt-4 font-extrabold text-lg text-navy">{currentUser?.name}</h2>
          <p className="text-xs text-slate-400">{currentUser?.email}</p>

          {!isOtherUser ? (
            <button
              onClick={() => {
                setAvatarUrl(currentUser?.avatar || '');
                setAvatarModalOpen(true);
              }}
              className="mt-3 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-colors border border-brand-200 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ganti Foto Profil</span>
            </button>
          ) : (
            /* Action Buttons for Other User: Follow & Send Message */
            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={handleToggleFollow}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                  followStats.is_following
                    ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {followStats.is_following ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Mengikuti</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/messages', { state: { partnerId: targetUserId } })}
                className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Pesan</span>
              </button>
            </div>
          )}

          {/* Social Followers & Following Stats (CLICKABLE) */}
          <div className="mt-4 grid grid-cols-2 gap-3 w-full p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <button
              type="button"
              onClick={() => openFollowListModal('followers')}
              className="p-1 hover:bg-white rounded-xl transition-all cursor-pointer group"
              title="Klik untuk melihat daftar pengikut"
            >
              <span className="font-extrabold text-navy text-base block group-hover:text-brand-600 transition-colors">
                {followStats.followers_count}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-brand-600 uppercase font-bold tracking-wider">
                Pengikut
              </span>
            </button>

            <button
              type="button"
              onClick={() => openFollowListModal('following')}
              className="p-1 hover:bg-white rounded-xl transition-all cursor-pointer group"
              title="Klik untuk melihat siapa yang diikuti"
            >
              <span className="font-extrabold text-navy text-base block group-hover:text-brand-600 transition-colors">
                {followStats.following_count}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-brand-600 uppercase font-bold tracking-wider">
                Mengikuti
              </span>
            </button>
          </div>

          {/* Roles Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {assignments.map((a: any, idx: number) => (
              <Badge key={a.id || idx} variant="blue" size="sm">
                {a.role?.name || a.name || 'Member'}
              </Badge>
            ))}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{currentUser?.email}</span>
            </div>
            {currentUser?.phone && (
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{currentUser.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="truncate">
                {(currentUser as any)?.default_university?.name ||
                  activeAssignment?.university?.name ||
                  'CampusConnect System'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Details & Timeline Posts */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Credentials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Kredensial & Jurusan Kampus
            </h3>

            {studentProf && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Student ID (NIM)</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{studentProf.nim}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Program Studi</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProf.study_program || 'Informatika'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Tahun Masuk (Angkatan)</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProf.enrollment_year || 2022}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Jurusan / Departemen</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProf.department?.name || 'Teknologi Informasi & Komputer'}</span>
                </div>
              </div>
            )}

            {lecturerProf && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">NIDN / Kode Dosen</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{lecturerProf.nidn}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Gelar Akademik</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProf.title || 'Dosen Pengajar'}</span>
                </div>
                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Bidang Keahlian / Spesialisasi</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProf.specialization || 'Ilmu Komputer & Sistem Informasi'}</span>
                </div>
              </div>
            )}

            {!studentProf && !lecturerProf && (
              <div className="text-xs text-slate-500 py-2">
                Akun administrator tingkat platform kampus.
              </div>
            )}
          </div>

          {/* User's Campus Posts / Timeline Tweets */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs space-y-4">
            <h3 className="text-base font-bold text-navy flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Postingan & Aktivitas Kampus ({userPosts.length})
              </span>
              <Link to="/feed" className="text-xs text-brand-600 hover:underline font-semibold">
                Lihat di Timeline Penuh →
              </Link>
            </h3>

            {loadingPosts ? (
              <div className="text-center py-6 text-slate-400 text-xs">Memuat postingan...</div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Belum ada postingan yang dibagikan ke timeline kampus.
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{p.content}</p>

                    {p.media_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48">
                        <img src={p.media_url} alt="Media" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {p.likes_count} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="w-3.5 h-3.5 text-emerald-500" />
                        {p.reposts_count} Reposts
                      </span>
                      <span>
                        {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: List of Followers / Following */}
      <Modal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        title={followModalType === 'followers' ? `Daftar Pengikut: ${currentUser?.name}` : `Mengikuti: ${currentUser?.name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            {followModalType === 'followers'
              ? 'Pengguna civitas kampus yang mengikuti akun ini.'
              : 'Akun civitas kampus yang diikuti oleh pengguna ini.'}
          </p>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
            {loadingFollowList ? (
              <div className="text-center py-6 text-slate-400">Memuat daftar...</div>
            ) : followList.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Belum ada data untuk ditampilkan.</div>
            ) : (
              followList.map((item: any) => {
                const person: User = followModalType === 'followers' ? item.follower : item.user;
                if (!person) return null;

                return (
                  <div
                    key={person.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2 transition-colors"
                  >
                    <Link
                      to={`/profile/${person.id}`}
                      onClick={() => setFollowModalOpen(false)}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      <img
                        src={person.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'U')}&background=2563EB&color=fff`}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-brand-400 transition-all"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-navy text-xs group-hover:text-brand-600 transition-colors truncate">
                          {person.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {person.student_profile?.department?.name || person.email}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setFollowModalOpen(false);
                          navigate('/messages', { state: { partnerId: person.id } });
                        }}
                        className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                        title="Kirim Pesan"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span className="hidden sm:inline">Pesan</span>
                      </button>

                      <Link
                        to={`/profile/${person.id}`}
                        onClick={() => setFollowModalOpen(false)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] transition-colors"
                      >
                        Lihat Profil
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Ganti Foto Profil (Own Profile) */}
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
              src={avatarUrl || authUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || 'U')}&background=2563EB&color=fff`}
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
