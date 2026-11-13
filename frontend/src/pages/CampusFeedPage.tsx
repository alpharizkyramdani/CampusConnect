import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { CampusPost, CampusPostComment, UserSuggestion } from '../types';
import { Modal } from '../components/ui/Modal';
import {
  MessageSquare,
  Repeat2,
  Heart,
  Share2,
  Image as ImageIcon,
  Send,
  Trash2,
  Sparkles,
  TrendingUp,
  Users,
  Hash,
  Upload,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Flame,
  Globe2,
  Bookmark,
  Flag,
  Edit3,
  ShieldAlert,
} from 'lucide-react';

export const CampusFeedPage: React.FC = () => {
  const { user, activeAssignment } = useAuth();

  const [activeTab, setActiveTab] = useState<'for_you' | 'following' | 'trending' | 'saved'>('for_you');
  const [posts, setPosts] = useState<CampusPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer state
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);

  // Comments state: map of postId -> { comments: CampusPostComment[], open: boolean, newComment: string, loading: boolean }
  const [commentsState, setCommentsState] = useState<Record<number, {
    comments: CampusPostComment[];
    open: boolean;
    newComment: string;
    loading: boolean;
  }>>({});

  // Right sidebar suggestions & trending
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);

  // Edit Post Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CampusPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingPost, setReportingPost] = useState<CampusPost | null>(null);
  const [reportCategory, setReportCategory] = useState('inappropriate');
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      if (activeTab === 'saved') {
        const res = await api.get('/feed/saved-posts');
        if (res.data.success) {
          setPosts(res.data.data.data || res.data.data || []);
        }
      } else {
        const res = await api.get('/feed', {
          params: {
            feed_type: activeTab,
            university_id: activeAssignment?.university_id,
          },
        });
        if (res.data.success) {
          setPosts(res.data.data.data || res.data.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/users-suggestions');
      if (res.data.success) {
        setSuggestions(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const res = await api.get('/feed-trending');
      if (res.data.success && res.data.data) {
        setTrendingTags(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab, activeAssignment]);

  useEffect(() => {
    fetchSuggestions();
    fetchTrendingTags();
  }, []);

  const handleUploadMedia = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.url) {
        setMediaUrl(res.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setPosting(true);
    try {
      const res = await api.post('/feed', {
        content: content.trim(),
        media_url: mediaUrl || null,
        university_id: activeAssignment?.university_id,
      });

      if (res.data.success) {
        setContent('');
        setMediaUrl('');
        setPosts((prev) => [res.data.data, ...prev]);
        fetchTrendingTags();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memposting ke timeline');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await api.post(`/feed/${postId}/like`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked_by_me: res.data.is_liked,
                  likes_count: res.data.likes_count,
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = async (postId: number) => {
    try {
      const res = await api.post(`/feed/${postId}/bookmark`);
      if (res.data.success) {
        const isBookmarked = res.data.is_bookmarked;
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, is_bookmarked_by_me: isBookmarked } : p
          )
        );
        if (activeTab === 'saved' && !isBookmarked) {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRepost = async (postId: number) => {
    try {
      const res = await api.post(`/feed/${postId}/repost`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_reposted_by_me: res.data.is_reposted,
                  reposts_count: res.data.reposts_count,
                }
              : p
          )
        );
        if (res.data.is_reposted && res.data.data) {
          setPosts((prev) => [res.data.data, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (post: CampusPost) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editContent.trim()) return;

    setSavingEdit(true);
    try {
      const res = await api.put(`/feed/${editingPost.id}`, {
        content: editContent.trim(),
      });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPost.id
              ? { ...p, content: editContent.trim(), edited_at: new Date().toISOString() }
              : p
          )
        );
        setEditModalOpen(false);
        setEditingPost(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah postingan');
    } finally {
      setSavingEdit(false);
    }
  };

  const openReportModal = (post: CampusPost) => {
    setReportingPost(post);
    setReportCategory('inappropriate');
    setReportReason('');
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost || !reportReason.trim()) {
      alert('Harap berikan alasan laporan.');
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await api.post('/reports', {
        reportable_type: 'post',
        reportable_id: reportingPost.id,
        category: reportCategory,
        reason: reportReason.trim(),
      });

      if (res.data.success) {
        alert('Laporan Anda telah berhasil dikirim ke moderator kampus.');
        setReportModalOpen(false);
        setReportingPost(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim laporan.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const toggleCommentsDrawer = async (postId: number) => {
    const current = commentsState[postId] || { comments: [], open: false, newComment: '', loading: false };

    if (!current.open) {
      // Open and fetch comments
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...current, open: true, loading: true },
      }));

      try {
        const res = await api.get(`/feed/${postId}/comments`);
        if (res.data.success) {
          setCommentsState((prev) => ({
            ...prev,
            [postId]: { ...current, open: true, comments: res.data.data, loading: false },
          }));
        }
      } catch (e) {
        setCommentsState((prev) => ({
          ...prev,
          [postId]: { ...current, open: true, loading: false },
        }));
      }
    } else {
      // Close
      setCommentsState((prev) => ({
        ...prev,
        [postId]: { ...current, open: false },
      }));
    }
  };

  const handleSendComment = async (postId: number) => {
    const current = commentsState[postId];
    if (!current || !current.newComment.trim()) return;

    try {
      const res = await api.post(`/feed/${postId}/comments`, {
        content: current.newComment.trim(),
      });

      if (res.data.success) {
        setCommentsState((prev) => ({
          ...prev,
          [postId]: {
            ...current,
            comments: [...current.comments, res.data.data],
            newComment: '',
          },
        }));

        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comments_count: res.data.comments_count } : p))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim komentar');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Hapus postingan ini dari timeline?')) return;
    try {
      const res = await api.delete(`/feed/${postId}`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus postingan');
    }
  };

  const handleToggleFollow = async (targetUserId: number) => {
    try {
      const res = await api.post(`/users/${targetUserId}/follow`);
      if (res.data.success) {
        setFollowingMap((prev) => ({
          ...prev,
          [targetUserId]: res.data.is_following,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}d yang lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j yang lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const renderContentWithHashtags = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((w, i) => {
      if (w.startsWith('#') && w.length > 1) {
        return (
          <span key={i} className="text-brand-600 font-bold hover:underline cursor-pointer">
            {w}
          </span>
        );
      }
      return w;
    });
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Tabs */}
          <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-extrabold text-navy tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  Campus Social Timeline
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berbagi pemikiran, info kelas, update organisasi, dan berinteraksi dengan sesama mahasiswa & dosen
                </p>
              </div>
            </div>

            {/* Twitter-style Tab Navigation */}
            <div className="flex border-b border-slate-100 -mx-5 px-5 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('for_you')}
                className={`pb-3 flex items-center gap-1.5 transition-all relative ${
                  activeTab === 'for_you'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>Untuk Anda</span>
              </button>

              <button
                onClick={() => setActiveTab('following')}
                className={`pb-3 flex items-center gap-1.5 transition-all relative ${
                  activeTab === 'following'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Mengikuti / Teman</span>
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`pb-3 flex items-center gap-1.5 transition-all relative ${
                  activeTab === 'trending'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Trending Kampus 🔥</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-3 flex items-center gap-1.5 transition-all relative ${
                  activeTab === 'saved'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Tersimpan</span>
              </button>
            </div>
          </div>

          {/* Tweet / Post Composer */}
          <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs">
            <form onSubmit={handleCreatePost}>
              <div className="flex gap-3">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Apa yang sedang terjadi di kampusmu? Bagikan ide, kabar tugas, atau opini... (#tag)"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-hidden"
                  />

                  {/* Attached Media Preview */}
                  {mediaUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-64 flex items-center justify-center">
                      <img src={mediaUrl} alt="Upload preview" className="w-full h-auto max-h-64 object-cover" />
                      <button
                        type="button"
                        onClick={() => setMediaUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full text-xs"
                        title="Hapus foto"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Hashtag Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['#InfoKuliah', '#TeknikInformatika', '#PNLJuara', '#EventKampus', '#TugasAkhir'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setContent((prev) => (prev ? `${prev} ${tag}` : tag))}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Actions & Submit */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer p-2 hover:bg-brand-50 text-slate-500 hover:text-brand-600 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold">
                        <ImageIcon className="w-4 h-4 text-brand-600" />
                        <span className="hidden sm:inline">Foto / Media</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleUploadMedia(e.target.files[0])}
                        />
                      </label>

                      {uploadingImage && (
                        <span className="text-[11px] text-brand-600 font-semibold animate-pulse">
                          Mengunggah gambar...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {content.length}/1000
                      </span>

                      <button
                        type="submit"
                        disabled={posting || (!content.trim() && !mediaUrl)}
                        className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{posting ? 'Memposting...' : 'Posting'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Posts Feed Stream */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Belum ada postingan di timeline ini</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'following'
                  ? 'Ikuti teman atau dosen di sebelah kanan untuk melihat postingan mereka di sini!'
                  : 'Jadilah yang pertama membuat postingan kampus di timeline ini!'}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const commentsInfo = commentsState[post.id] || {
                comments: [],
                open: false,
                newComment: '',
                loading: false,
              };

              const isAuthor = user?.id === post.user_id;

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Repost Header */}
                  {post.repost_of && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mb-1 pl-1">
                      <Repeat2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{post.author.name} me-repost</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/profile/${post.user_id}`}
                      className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                    >
                      <img
                        src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || 'U')}&background=2563EB&color=fff`}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-brand-400 transition-all shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-navy text-xs sm:text-sm group-hover:text-brand-600 transition-colors">
                            {post.author.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            • {formatTimeAgo(post.created_at)}
                          </span>
                          {post.edited_at && (
                            <span className="text-[10px] text-slate-400 italic">
                              (diedit)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {post.author.student_profile?.department?.name || 'Civitas Kampus'}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1">
                      {isAuthor ? (
                        <>
                          <button
                            onClick={() => openEditModal(post)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                            title="Edit postingan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Hapus postingan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openReportModal(post)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="Laporkan konten ini"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pl-1">
                    {renderContentWithHashtags(post.content)}
                  </div>

                  {/* Media Photo */}
                  {post.media_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96 bg-slate-50 flex items-center justify-center">
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Embedded Reposted Card */}
                  {post.repost_of && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.repost_of.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.repost_of.author.name || 'U')}&background=2563EB&color=fff`}
                          alt={post.repost_of.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-bold text-navy text-xs">{post.repost_of.author.name}</span>
                        <span className="text-[10px] text-slate-400">• {formatTimeAgo(post.repost_of.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {renderContentWithHashtags(post.repost_of.content)}
                      </p>
                    </div>
                  )}

                  {/* Action Bar (Comment, Repost, Like, Share) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    {/* Reply / Comment */}
                    <button
                      onClick={() => toggleCommentsDrawer(post.id)}
                      className="flex items-center gap-1.5 hover:text-brand-600 p-1.5 rounded-xl transition-colors group"
                    >
                      <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-bold">{post.comments_count || 0}</span>
                    </button>

                    {/* Repost */}
                    <button
                      onClick={() => handleToggleRepost(post.id)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-colors group ${
                        post.is_reposted_by_me ? 'text-emerald-600' : 'hover:text-emerald-600'
                      }`}
                    >
                      <Repeat2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-bold">{post.reposts_count || 0}</span>
                    </button>

                    {/* Like */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-colors group ${
                        post.is_liked_by_me ? 'text-rose-600' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                          post.is_liked_by_me ? 'fill-rose-600' : ''
                        }`}
                      />
                      <span className="font-bold">{post.likes_count || 0}</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-colors group ${
                        post.is_bookmarked_by_me ? 'text-amber-500' : 'hover:text-amber-500'
                      }`}
                      title={post.is_bookmarked_by_me ? 'Hapus dari bookmark' : 'Simpan postingan'}
                    >
                      <Bookmark
                        className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                          post.is_bookmarked_by_me ? 'fill-amber-500' : ''
                        }`}
                      />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Tautan postingan berhasil disalin!');
                      }}
                      className="flex items-center gap-1.5 hover:text-brand-600 p-1.5 rounded-xl transition-colors group"
                      title="Salin tautan"
                    >
                      <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Collapsible Threaded Comments Drawer */}
                  {commentsInfo.open && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tulis balasan atau komentar..."
                          value={commentsInfo.newComment}
                          onChange={(e) =>
                            setCommentsState((prev) => ({
                              ...prev,
                              [post.id]: { ...commentsInfo, newComment: e.target.value },
                            }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                          className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Kirim
                        </button>
                      </div>

                      {/* Comments List */}
                      {commentsInfo.loading ? (
                        <div className="text-center py-2 text-slate-400 text-xs">Memuat balasan...</div>
                      ) : commentsInfo.comments.length === 0 ? (
                        <div className="text-center py-2 text-slate-400 text-xs">Belum ada balasan. Mulai obrolan pertama!</div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {commentsInfo.comments.map((c) => (
                            <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs">
                              <img
                                src={c.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}&background=2563EB&color=fff`}
                                alt={c.author?.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-navy">{c.author?.name}</span>
                                  <span className="text-[10px] text-slate-400">• {formatTimeAgo(c.created_at)}</span>
                                </div>
                                <p className="text-slate-700 mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Sidebar Widgets (1 Col) */}
        <div className="space-y-4">
          {/* Trending Hashtags Widget */}
          <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs">
            <h3 className="font-extrabold text-navy text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Trending Topik Kampus
            </h3>
            <div className="space-y-2.5">
              {(trendingTags.length > 0
                ? trendingTags.slice(0, 5).map((t) => ({ tag: t.tag, posts: `${t.count} Postingan` }))
                : [
                    { tag: '#TeknikInformatika', posts: '42 Postingan' },
                    { tag: '#InfoKuliah', posts: '38 Postingan' },
                    { tag: '#PNLJuara', posts: '29 Postingan' },
                    { tag: '#Wisuda2026', posts: '24 Postingan' },
                    { tag: '#LombaRobotik', posts: '18 Postingan' },
                  ]
              ).map((item, idx) => (
                <div
                  key={item.tag}
                  onClick={() => setContent((prev) => (prev ? `${prev} ${item.tag}` : item.tag))}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">
                      {idx + 1} • Populer di Kampus
                    </span>
                    <span className="text-xs font-bold text-navy group-hover:text-brand-600 transition-colors">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Who to Follow / Rekomendasi Teman */}
          <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs">
            <h3 className="font-extrabold text-navy text-sm flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-brand-600" />
              Rekomendasi Teman Kampus
            </h3>

            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada rekomendasi akun baru.
              </p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((u) => {
                  const isFollowing = !!followingMap[u.id];

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <Link
                        to={`/profile/${u.id}`}
                        className="flex items-center gap-2.5 min-w-0 group hover:opacity-90"
                      >
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=2563EB&color=fff`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-brand-400 transition-all"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-navy text-xs group-hover:text-brand-600 transition-colors truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {u.student_profile?.department?.name || 'Mahasiswa'}
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={() => handleToggleFollow(u.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all shrink-0 ${
                          isFollowing
                            ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Mengikuti</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campus Etiquette Box */}
          <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-brand-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              Etika Komunitas Kampus
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jaga kesopanan, hindari ujaran kebencian, dan sebarkan informasi akademik yang bermanfaat bagi sesama civitas kampus.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Edit Post */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPost(null);
        }}
        title="Edit Postingan Anda"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">
              Isi Postingan
            </label>
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              placeholder="Tulis pembaruan isi postingan..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingPost(null);
              }}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingEdit || !editContent.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
            >
              {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Report Content / Post */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingPost(null);
        }}
        title="Laporkan Konten / Postingan"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Sistem Moderasi Keamanan Kampus
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              Laporan Anda akan dikirimkan kepada tim moderator kampus untuk ditinjau. Identitas pelapor dirahasiakan untuk perlindungan privasi.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">
              Kategori Pelanggaran <span className="text-rose-500">*</span>
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
            >
              <option value="inappropriate">Konten Tidak Pantas / Asusila</option>
              <option value="harassment">Pelecehan / Perundungan (Harassment)</option>
              <option value="hate_speech">Ujaran Kebencian & SARA</option>
              <option value="spam">Spam / Penipuan Komersial</option>
              <option value="false_information">Misinformasi / Berita Bohong</option>
              <option value="plagiarism">Plagiarisme / Pelanggaran Hak Cipta</option>
              <option value="other">Pelanggaran Etika Akademik Lainnya</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">
              Jelaskan Alasan Laporan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Berikan konteks atau rincian mengapa postingan ini melanggar pedoman kampus..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setReportModalOpen(false);
                setReportingPost(null);
              }}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingReport || !reportReason.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{submittingReport ? 'Mengirim...' : 'Kirim Laporan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

