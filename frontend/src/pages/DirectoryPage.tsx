import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { University, Faculty, Department, User } from '../types';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Users2,
  Search,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const { activeAssignment } = useAuth();
  const [tab, setTab] = useState<'universities' | 'faculties' | 'lecturers'>('universities');
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/universities'),
      api.get(`/universities/${activeAssignment?.university_id || 1}/faculties`),
      api.get('/users', { params: { role: 'lecturer' } }),
    ]).then(([uRes, fRes, lRes]) => {
      if (uRes.data.success) setUniversities(uRes.data.data || []);
      if (fRes.data.success) setFaculties(fRes.data.data || []);
      if (lRes.data.success) setLecturers(lRes.data.data.data || lRes.data.data || []);
    }).finally(() => setLoading(false));
  }, [activeAssignment]);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-brand-600" />
          Campus Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore participating universities, academic faculties, departments, and public faculty profiles
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-borderMuted pb-3">
        <button
          onClick={() => setTab('universities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'universities' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Universities ({universities.length})
        </button>
        <button
          onClick={() => setTab('faculties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'faculties' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Faculties & Departments ({faculties.length})
        </button>
        <button
          onClick={() => setTab('lecturers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'lecturers' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lecturers & Researchers ({lecturers.length})
        </button>
      </div>

      {/* Tab 1: Universities */}
      {tab === 'universities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-bold text-base">
                    {u.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy">{u.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">{u.description}</p>
                <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{u.address}</span>
                </div>
              </div>
              {u.website && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={u.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                  >
                    Official Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Faculties & Departments */}
      {tab === 'faculties' && (
        <div className="space-y-6">
          {faculties.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-navy text-white">
                  {f.code}
                </span>
                <Badge variant="blue">{f.departments?.length || 0} Departments</Badge>
              </div>
              <h3 className="text-base font-bold text-navy">{f.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{f.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {f.departments?.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <span className="font-mono text-[10px] text-brand-600 font-bold block">{d.code}</span>
                    <h4 className="font-bold text-slate-900 mt-0.5">{d.name}</h4>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Lecturers */}
      {tab === 'lecturers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lecturers.map((lec) => (
            <div key={lec.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-start gap-4">
              <img
                src={lec.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lec.name)}&background=2563EB&color=fff`}
                alt={lec.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-navy truncate">{lec.name}</h3>
                <div className="text-xs text-brand-600 font-semibold">{lec.email}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  NIDN: {lec.lecturer_profile?.nidn || (lec as any).nidn || 'Academic Faculty'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
