import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { AcademicEvent } from '../types';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const AcademicCalendarPage: React.FC = () => {
  const { activeAssignment, hasAnyRole } = useAuth();
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Nov 2026

  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'academic' | 'holiday' | 'exam' | 'registration'>('academic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = hasAnyRole(['super_admin', 'campus_admin']);

  const fetchCalendar = async () => {
    try {
      const res = await api.get('/academic-calendar', {
        params: {
          university_id: activeAssignment?.university_id,
          category: selectedCategory || undefined,
        },
      });
      if (res.data.success) {
        setEvents(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedCategory, activeAssignment]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/academic-calendar', {
        university_id: activeAssignment?.university_id || 1,
        title,
        description,
        category,
        start_date: startDate,
        end_date: endDate,
      });
      if (res.data.success) {
        setCreateModal(false);
        setTitle('');
        setDescription('');
        fetchCalendar();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-brand-600" />
            University Academic Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official university timetable, examination schedules, registration periods, and holidays
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setCreateModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Academic Event
          </button>
        )}
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-extrabold text-navy min-w-[140px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['', 'academic', 'exam', 'registration', 'holiday'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === '' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => {
          const catColors: any = {
            exam: 'border-l-rose-500 bg-rose-50/30',
            registration: 'border-l-brand-500 bg-brand-50/30',
            holiday: 'border-l-amber-500 bg-amber-50/30',
            academic: 'border-l-emerald-500 bg-emerald-50/30',
          };

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl p-5 border border-slate-200 border-l-4 ${catColors[ev.category] || 'border-l-brand-500'} shadow-xs hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant={ev.category === 'exam' ? 'rose' : ev.category === 'registration' ? 'blue' : 'emerald'} size="sm">
                  {ev.category}
                </Badge>
                <span className="text-[11px] text-slate-400 font-medium">All Day</span>
              </div>
              <h3 className="font-bold text-sm text-navy">{ev.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  {ev.start_date} → {ev.end_date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Academic Event Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Schedule Academic Event"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Event Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Examination Period"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Category</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="academic">Academic Activity</option>
              <option value="exam">Examination Period</option>
              <option value="registration">Study Plan / Registration (KRS)</option>
              <option value="holiday">University Holiday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Description & Guidelines</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or remarks for students and faculty..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? 'Scheduling...' : 'Save to Academic Calendar'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

