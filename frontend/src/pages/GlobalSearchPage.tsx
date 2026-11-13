import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import {
  Search,
  Users,
  Sparkles,
  Calendar,
  Building2,
  FileText,
  PackageCheck,
  Briefcase,
  BookOpen,
  Megaphone,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';

export const GlobalSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeSearch = async (q: string, cat: string) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await api.get('/search/global', {
        params: { q, category: cat },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setInputQuery(queryParam);
      executeSearch(queryParam, selectedCategory);
    }
  }, [queryParam, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim(), category: selectedCategory });
      executeSearch(inputQuery.trim(), selectedCategory);
    }
  };

  const results = data?.results || {};
  const totalMatches = data?.total_matches || 0;
  const suggestedSearches = data?.suggested_searches || [
    'Teknik Informatika',
    'Beasiswa Prestasi',
    'Seminar Nasional AI',
    'HIMA',
    'Laboratorium Komputer',
    'Jadwal KRS Ganjil',
    'Magang Full Stack',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header & Big Search Input */}
      <div className="text-center space-y-3 pt-2">
        <h1 className="text-2xl font-black text-navy tracking-tight">Pencarian Terpadu CampusConnect</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Temukan teman civitas, postingan feed, acara kampus, pengumuman, organisasi, lowongan magang, dan koleksi perpustakaan.
        </p>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mt-4">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            required
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ketik nama civitas, judul acara, buku, ormawa, atau kata kunci..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Cari
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Saran Pencarian:</span>
          {suggestedSearches.map((sug: string) => (
            <button
              key={sug}
              type="button"
              onClick={() => {
                setInputQuery(sug);
                setSearchParams({ q: sug, category: selectedCategory });
                executeSearch(sug, selectedCategory);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] rounded-lg transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-2 text-xs font-bold">
        {[
          { id: 'all', label: 'Semua Hasil', icon: Compass },
          { id: 'users', label: 'Civitas & Pengguna', icon: Users, count: results.users?.length },
          { id: 'posts', label: 'Postingan Feed', icon: Sparkles, count: results.posts?.length },
          { id: 'events', label: 'Acara Kampus', icon: Calendar, count: results.events?.length },
          { id: 'organizations', label: 'Ormawa & UKM', icon: Building2, count: results.organizations?.length },
          { id: 'careers', label: 'Karier & Magang', icon: Briefcase, count: results.careers?.length },
          { id: 'library', label: 'Perpustakaan', icon: BookOpen, count: results.library?.length },
          { id: 'facilities', label: 'Fasilitas & Lab', icon: PackageCheck, count: results.facilities?.length },
          { id: 'documents', label: 'Dokumen', icon: FileText, count: results.documents?.length },
          { id: 'announcements', label: 'Pengumuman', icon: Megaphone, count: results.announcements?.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setSelectedCategory(tab.id);
              if (inputQuery.trim()) {
                setSearchParams({ q: inputQuery.trim(), category: tab.id });
                executeSearch(inputQuery.trim(), tab.id);
              }
            }}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results Container */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-400">Mencari di seluruh modul CampusConnect...</p>
        </div>
      ) : !queryParam ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted shadow-xs space-y-2">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-navy text-sm">Mulai pencarian global</p>
          <p className="text-xs text-slate-400">Ketik kata kunci di kolom pencarian atas untuk memulai penelusuran.</p>
        </div>
      ) : totalMatches === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted shadow-xs space-y-2">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-navy text-sm">Tidak ditemukan hasil untuk "{queryParam}"</p>
          <p className="text-xs text-slate-400">Coba gunakan kata kunci yang lebih umum atau periksa ejaan Anda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Users */}
          {results.users && results.users.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-600" />
                  <span>Civitas & Mahasiswa ({results.users.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.users.map((u: any) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 border border-slate-100 group"
                  >
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=2563EB&color=fff`}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-navy group-hover:text-brand-600 transition-colors truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.student_profile?.department?.name || u.email}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section: Events */}
          {results.events && results.events.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>Acara & Seminar Kampus ({results.events.length})</span>
                </h2>
                <Link to="/events" className="text-brand-600 font-bold text-xs hover:underline">Lihat Semua Events</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.events.map((ev: any) => (
                  <Link
                    key={ev.id}
                    to="/events"
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 border border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-navy truncate">{ev.title}</div>
                      <div className="text-[10px] text-slate-400">{ev.location} • {new Date(ev.start_time).toLocaleDateString('id-ID')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section: Posts */}
          {results.posts && results.posts.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Postingan Campus Feed ({results.posts.length})</span>
                </h2>
                <Link to="/feed" className="text-brand-600 font-bold text-xs hover:underline">Buka Timeline</Link>
              </div>
              <div className="space-y-2">
                {results.posts.map((p: any) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy">{p.user?.name}</span>
                      <span className="text-[10px] text-slate-400">• {new Date(p.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{p.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Careers */}
          {results.careers && results.careers.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>Karier & Beasiswa ({results.careers.length})</span>
                </h2>
                <Link to="/career-center" className="text-brand-600 font-bold text-xs hover:underline">Buka Career Center</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.careers.map((c: any) => (
                  <Link
                    key={c.id}
                    to="/career-center"
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-navy truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500">{c.company_name} • {c.location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section: Library */}
          {results.library && results.library.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span>Koleksi Perpustakaan ({results.library.length})</span>
                </h2>
                <Link to="/digital-library" className="text-brand-600 font-bold text-xs hover:underline">Buka Perpustakaan</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.library.map((b: any) => (
                  <Link
                    key={b.id}
                    to="/digital-library"
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 border border-slate-100"
                  >
                    <div className="w-10 h-12 rounded-lg bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-navy truncate">{b.title}</div>
                      <div className="text-[10px] text-slate-400">{b.author} • {b.shelf_location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

