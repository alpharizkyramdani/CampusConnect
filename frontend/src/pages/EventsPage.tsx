import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Event, EventCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  CalendarCheck2,
  Search,
  Plus,
  MapPin,
  Calendar,
  Users,
  QrCode,
  Ticket,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const EventsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Registration feedback modal
  const [ticketModal, setTicketModal] = useState<any>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  // Create Event modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [bannerImage, setBannerImage] = useState('');
  const [saving, setSaving] = useState(false);

  const canCreateEvent = hasAnyRole(['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin', 'lecturer']);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', {
        params: {
          university_id: activeAssignment?.university_id,
          category_id: selectedCategory || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setEvents(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/event-categories').then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, activeAssignment]);

  const handleRegister = async (eventId: number) => {
    setRegisteringId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        setTicketModal(res.data.data);
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register for this event.');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancelRegistration = async (eventId: number) => {
    if (!window.confirm('Yakin ingin membatalkan pendaftaran tiket untuk acara ini? Kursi Anda akan dialihkan ke pendaftar lain.')) return;
    try {
      const res = await api.post(`/events/${eventId}/cancel`);
      if (res.data.success) {
        alert('Pendaftaran berhasil dibatalkan.');
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membatalkan tiket acara.');
    }
  };

  const handleJoinWaitlist = async (eventId: number) => {
    try {
      const res = await api.post(`/events/${eventId}/waitlist`);
      if (res.data.success) {
        alert(res.data.message || 'Anda berhasil masuk ke antrean waitlist!');
        fetchEvents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal masuk daftar tunggu acara.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/events', {
        university_id: activeAssignment?.university_id || 1,
        organization_id: activeAssignment?.organization_id || null,
        department_id: activeAssignment?.department_id || null,
        title,
        description,
        category_id: categoryId ? parseInt(categoryId) : null,
        location,
        event_type: eventType,
        start_time: startTime,
        end_time: endTime,
        max_participants: parseInt(maxParticipants),
        banner_image: bannerImage || null,
        certificate_enabled: true,
      });
      if (res.data.success) {
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setLocation('');
        fetchEvents();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create event');
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
            <CalendarCheck2 className="w-6 h-6 text-brand-600" />
            Campus Event Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse hackathons, symposiums, student workshops, and secure digital entry tickets
          </p>
        </div>

        {canCreateEvent && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
            placeholder="Search events or symposiums..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === '' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events
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

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No campus events found</h3>
          <p className="text-xs text-slate-500 mt-1">Be the first to publish an event or clear active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isFull = ev.current_participants >= ev.max_participants;
            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden bg-slate-100 relative">
                    <img
                      src={ev.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/95 text-brand-700 shadow-xs uppercase">
                        {ev.event_type}
                      </span>
                    </div>
                    {ev.certificate_enabled && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        Certificate
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                      {ev.category?.name || 'Campus Event'}
                    </div>
                    <h3 className="font-bold text-sm text-navy line-clamp-2">{ev.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{ev.description}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(ev.start_time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {ev.current_participants} / {ev.max_participants} registered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  {ev.is_registered ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Tiket Terdaftar ({ev.ticket_code})
                        </span>
                        <button
                          type="button"
                          onClick={() => setTicketModal({ ticket_code: ev.ticket_code, qr_token: ev.ticket_code })}
                          className="text-[11px] font-bold text-brand-600 hover:underline"
                        >
                          Lihat QR
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(ev.id)}
                        className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Batal Daftar
                      </button>
                    </div>
                  ) : isFull ? (
                    ev.is_waitlisted ? (
                      <div className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-2">
                        <span>⏳ Berada di Daftar Tunggu (Waitlist)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoinWaitlist(ev.id)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <span>Kuota Penuh — Gabung Waitlist</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleRegister(ev.id)}
                      disabled={registeringId === ev.id}
                      className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all"
                    >
                      <Ticket className="w-4 h-4" />
                      {registeringId === ev.id ? 'Mendaftar...' : 'Daftar Tiket Acara'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      <Modal
        isOpen={!!ticketModal}
        onClose={() => setTicketModal(null)}
        title="Event Registration Confirmed!"
      >
        {ticketModal && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy">You're Registered!</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your digital entrance pass has been created.</p>
            </div>

            <div className="bg-canvas p-6 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG
                value={ticketModal.qr_token || ticketModal.ticket_code}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="font-mono text-sm font-bold text-brand-600">
              {ticketModal.ticket_code}
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Present this QR code on your mobile device at the event entrance for automatic verification.
            </p>
          </div>
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish Campus Event"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Autonomous Drone Hackathon 2026"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
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
              <label className="font-bold text-slate-700 block uppercase">Type</label>
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="offline">Offline / In-Person</option>
                <option value="online">Online / Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Location / Venue</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auditorium A or Zoom Link"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Max Capacity</label>
              <input
                type="number"
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <ImageUploadField
            label="Banner / Poster Acara"
            value={bannerImage}
            onChange={setBannerImage}
            placeholder="Atau tautan URL poster acara: https://..."
            helperText="Unggah poster promosi acara dari galeri HP atau laptop."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase">Description & Schedule</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline event agenda, prerequisites, and instructions..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? 'Creating...' : 'Publish Event'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

