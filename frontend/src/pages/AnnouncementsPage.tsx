import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Announcement, AnnouncementCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import { Megaphone, Search, Plus, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<AnnouncementCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Read Modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const canPublish = hasAnyRole(['super_admin', 'campus_admin', 'department_admin', 'lecturer']);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements', {
        params: {
          university_id: activeAssignment?.university_id,
          category_id: selectedCategory || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setAnnouncements(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/announcement-categories').then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory, activeAssignment]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/announcements', {
        university_id: activeAssignment?.university_id || 1,
        title,
        content,
        category_id: categoryId ? parseInt(categoryId) : null,
        priority,
        image_url: imageUrl || null,
      });
      if (res.data.success) {
        setCreateModalOpen(false);
        setTitle('');
        setContent('');
        setImageUrl('');
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-brand-600" />
            Campus Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official scholastic updates, administrative notices, and university-wide releases
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAnnouncements()}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === '' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === c.id.toString()
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No announcements found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedAnnouncement(a)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {a.image_url && (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: `${a.category?.color || '#2563EB'}15`, color: a.category?.color || '#2563EB' }}
                    >
                      {a.category?.name || 'Notice'}
                    </span>
                    <Badge variant={a.priority === 'urgent' ? 'rose' : a.priority === 'high' ? 'amber' : 'slate'} size="sm">
                      {a.priority}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-navy line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{a.content}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {a.user?.name || 'Administration'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(a.published_at || a.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read Detail Modal */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.category?.name || 'Campus Announcement'}
        maxWidth="xl"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            {selectedAnnouncement.image_url && (
              <img
                src={selectedAnnouncement.image_url}
                alt={selectedAnnouncement.title}
                className="w-full h-56 object-cover rounded-xl"
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Posted by <strong>{selectedAnnouncement.user?.name}</strong> •{' '}
                {new Date(selectedAnnouncement.published_at || selectedAnnouncement.created_at).toLocaleDateString()}
              </span>
              <Badge variant={selectedAnnouncement.priority === 'urgent' ? 'rose' : selectedAnnouncement.priority === 'high' ? 'amber' : 'blue'}>
                {selectedAnnouncement.priority} priority
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-navy">{selectedAnnouncement.title}</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Campus Announcement"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement headline"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <ImageUploadField
            label="Banner / Foto Pengumuman"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="Atau tautan URL gambar pengumuman: https://..."
            helperText="Unggah gambar header pengumuman dari perangkat."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase">Content</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the detailed announcement body here..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

