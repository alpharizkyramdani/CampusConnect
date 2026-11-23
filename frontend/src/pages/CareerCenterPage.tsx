import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  Send,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Award,
  DollarSign,
  Plus,
  Users,
  CheckCircle2,
  ExternalLink,
  FileText,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface CareerOpportunity {
  id: number;
  company_name: string;
  company_logo: string | null;
  title: string;
  category: string;
  location: string;
  type: 'remote' | 'on_site' | 'hybrid';
  description: string;
  requirements: string | null;
  benefits: string | null;
  deadline: string;
  salary_range: string | null;
  contact_email: string | null;
  external_url: string | null;
  is_verified: boolean;
  status: 'open' | 'closed';
  views_count: number;
  applications_count?: number;
  is_bookmarked?: boolean;
  has_applied?: boolean;
}

interface ApplicationItem {
  id: number;
  opportunity_id: number;
  cv_url: string;
  cover_letter: string | null;
  status: 'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';
  feedback: string | null;
  submitted_at: string;
  opportunity: CareerOpportunity;
}

export const CareerCenterPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const isAdmin = activeRole === 'super_admin' || activeRole === 'campus_admin';

  const [activeTab, setActiveTab] = useState<'explore' | 'my_applications'>('explore');
  const [opportunities, setOpportunities] = useState<CareerOpportunity[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected Detail Modal
  const [selectedOpp, setSelectedOpp] = useState<CareerOpportunity | null>(null);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyCvUrl, setApplyCvUrl] = useState('');
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applyPortfolio, setApplyPortfolio] = useState('');
  const [applying, setApplying] = useState(false);

  // Create Opportunity Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newLogo, setNewLogo] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('internship');
  const [newLocation, setNewLocation] = useState('Jakarta / Hybrid');
  const [newType, setNewType] = useState<'remote' | 'on_site' | 'hybrid'>('hybrid');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newBenefits, setNewBenefits] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/career/opportunities', {
        params: {
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setOpportunities(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/career/my-applications');
      if (res.data.success) {
        setMyApplications(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') {
      fetchOpportunities();
    } else {
      fetchMyApplications();
    }
  }, [activeTab, categoryFilter, typeFilter, search]);

  const handleToggleBookmark = async (oppId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/career/opportunities/${oppId}/bookmark`);
      if (res.data.success) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, is_bookmarked: res.data.is_bookmarked } : o))
        );
      }
    } catch (e) {
      alert('Gagal memperbarui simpanan.');
    }
  };

  const handleOpenApplyModal = (opp: CareerOpportunity) => {
    setSelectedOpp(opp);
    setApplyModalOpen(true);
    setApplyCvUrl('');
    setApplyCoverLetter('');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || applying) return;

    setApplying(true);
    try {
      const res = await api.post(`/career/opportunities/${selectedOpp.id}/apply`, {
        cv_url: applyCvUrl,
        cover_letter: applyCoverLetter || null,
        portfolio_link: applyPortfolio || null,
      });

      if (res.data.success) {
        alert('Lamaran Anda berhasil dikirim! Silakan cek menu "Lamaran Saya" untuk melihat status.');
        setApplyModalOpen(false);
        fetchOpportunities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim lamaran.');
    } finally {
      setApplying(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/career/opportunities', {
        company_name: newCompany,
        company_logo: newLogo || null,
        title: newTitle,
        category: newCategory,
        location: newLocation,
        type: newType,
        description: newDescription,
        requirements: newRequirements || null,
        benefits: newBenefits || null,
        deadline: newDeadline,
        salary_range: newSalary || null,
        contact_email: newEmail || null,
      });

      if (res.data.success) {
        alert('Kesempatan karier baru berhasil dipublikasikan!');
        setCreateModalOpen(false);
        fetchOpportunities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mempublikasikan kesempatan.');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'internship':
        return <Badge variant="blue" size="sm">Magang (Internship)</Badge>;
      case 'full_time':
        return <Badge variant="emerald" size="sm">Full-Time Job</Badge>;
      case 'part_time':
        return <Badge variant="slate" size="sm">Part-Time</Badge>;
      case 'scholarship':
        return <Badge variant="amber" size="sm">Beasiswa Prestasi</Badge>;
      case 'competition':
        return <Badge variant="purple" size="sm">Lomba & Hackathon</Badge>;
      default:
        return <Badge variant="blue" size="sm">{cat}</Badge>;
    }
  };

  const getAppStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">Terkirim (Submitted)</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg text-xs">Sedang Ditinjau HRD</span>;
      case 'interview_scheduled':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg text-xs">Jadwal Wawancara</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">Diterima (Accepted) 🎉</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-xs">Belum Berhasil</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Pusat Karier, Magang & Beasiswa</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Eksplorasi lowongan magang industri, beasiswa digital, dan kompetisi nasional terverifikasi untuk mahasiswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => {
                setNewCompany('');
                setNewTitle('');
                setNewDescription('');
                setNewDeadline(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Pasang Lowongan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'explore' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Eksplorasi Kesempatan ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_applications')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'my_applications' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Lamaran Saya ({myApplications.length})</span>
        </button>
      </div>

      {activeTab === 'explore' ? (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'internship', label: 'Magang (Internship)' },
                { id: 'scholarship', label: 'Beasiswa' },
                { id: 'competition', label: 'Lomba / Hackathon' },
                { id: 'full_time', label: 'Full-Time' },
                { id: 'part_time', label: 'Part-Time' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    categoryFilter === c.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="all">Semua Tipe Kerja</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote (WFA)</option>
                <option value="on_site">On-Site Kantor</option>
              </select>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari posisi, perusahaan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-400">Memuat lowongan karier & magang...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted shadow-xs space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-navy text-sm">Tidak ditemukan lowongan sesuai kriteria pencarian</p>
              <p className="text-xs text-slate-400">Coba atur ulang filter kategori atau kata kunci Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={opp.company_logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=100&auto=format&fit=crop&q=80'}
                          alt={opp.company_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-700 block truncate max-w-[160px]">{opp.company_name}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {opp.location}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(opp.id, e)}
                        className={`p-2 rounded-xl transition-colors ${
                          opp.is_bookmarked ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-100 text-slate-400'
                        }`}
                        title={opp.is_bookmarked ? 'Disimpan' : 'Simpan Lowongan'}
                      >
                        {opp.is_bookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-navy group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {opp.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {getCategoryBadge(opp.category)}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md text-[10px] uppercase">
                        {opp.type}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Batas Lamaran:</span>
                      <span className="font-bold text-slate-700 font-mono">
                        {new Date(opp.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {opp.has_applied ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                        ✓ Sudah Melamar
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenApplyModal(opp);
                        }}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                      >
                        Lamar Sekarang
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Applications Tab */
        <div className="bg-white rounded-3xl border border-borderMuted shadow-xs overflow-hidden">
          {myApplications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-navy text-sm">Belum ada lamaran yang Anda ajukan</p>
              <p className="text-xs text-slate-400">Temukan posisi magang atau beasiswa yang cocok di tab Eksplorasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Perusahaan & Posisi</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Tanggal Kirim</th>
                    <th className="p-4">Dokumen CV</th>
                    <th className="p-4">Status Lamaran</th>
                    <th className="p-4">Catatan Balik / Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-extrabold text-navy text-xs">{app.opportunity?.title}</div>
                        <div className="text-[11px] text-slate-500">{app.opportunity?.company_name}</div>
                      </td>
                      <td className="p-4">{getCategoryBadge(app.opportunity?.category)}</td>
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(app.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline font-bold flex items-center gap-1 text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Buka Berkas CV</span>
                        </a>
                      </td>
                      <td className="p-4">{getAppStatusBadge(app.status)}</td>
                      <td className="p-4 max-w-xs text-slate-600 italic">
                        {app.feedback || 'Menunggu peninjauan berkas oleh panitia.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedOpp && !applyModalOpen}
        onClose={() => setSelectedOpp(null)}
        title={selectedOpp?.title || 'Detail Kesempatan'}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={selectedOpp?.company_logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=100&auto=format&fit=crop&q=80'}
              alt={selectedOpp?.company_name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <h3 className="font-bold text-sm text-navy">{selectedOpp?.company_name}</h3>
              <p className="text-xs text-slate-500">{selectedOpp?.location} • Tipe: {selectedOpp?.type}</p>
              {selectedOpp?.salary_range && (
                <p className="text-emerald-700 font-bold text-xs mt-0.5">{selectedOpp.salary_range}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 uppercase mb-1 text-[11px]">Deskripsi Pekerjaan / Kesempatan</h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              {selectedOpp?.description}
            </p>
          </div>

          {selectedOpp?.requirements && (
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-1 text-[11px]">Persyaratan Kualifikasi</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {selectedOpp.requirements}
              </p>
            </div>
          )}

          {selectedOpp?.benefits && (
            <div>
              <h4 className="font-bold text-slate-700 uppercase mb-1 text-[11px]">Benefit & Fasilitas</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {selectedOpp.benefits}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setSelectedOpp(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                if (selectedOpp) handleOpenApplyModal(selectedOpp);
              }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              Lanjut ke Formulir Lamaran
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Kirim Lamaran */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Kirim Lamaran: ${selectedOpp?.title}`}
      >
        <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-2xl text-brand-900">
            Melamar posisi <strong>{selectedOpp?.title}</strong> di <strong>{selectedOpp?.company_name}</strong>.
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">Portofolio Kampus Terverifikasi PNL Terlampir Otomatis</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Riwayat presensi tiket event kampus ({user?.name}) dan keanggotaan Ormawa aktif Anda otomatis disertakan sebagai bukti kredensial digital resmi.
              </p>
            </div>
          </div>

          <ImageUploadField
            label="Unggah Berkas CV / Dokumen Portofolio (PDF/Image)"
            value={applyCvUrl}
            onChange={(url) => setApplyCvUrl(url)}
            placeholder="Unggah berkas CV atau tempel tautan cloud file..."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Tautan Portofolio / GitHub / LinkedIn</label>
            <input
              type="url"
              placeholder="https://..."
              value={applyPortfolio}
              onChange={(e) => setApplyPortfolio(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Surat Pengantar Singkat (Cover Letter)</label>
            <textarea
              rows={3}
              value={applyCoverLetter}
              onChange={(e) => setApplyCoverLetter(e.target.value)}
              placeholder="Ceritakan motivasi dan keunggulan Anda yang relevan dengan posisi ini..."
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={applying || !applyCvUrl}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {applying ? 'Mengirim...' : 'Kirim Berkas Lamaran'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Pasang Lowongan Baru (Admin) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Pasang Kesempatan Karier / Magang Baru"
      >
        <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Nama Perusahaan / Penyelenggara</label>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g. Tokopedia"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Judul Posisi / Program</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Kategori</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs"
              >
                <option value="internship">Magang (Internship)</option>
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="scholarship">Beasiswa</option>
                <option value="competition">Lomba / Hackathon</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Tipe Kerja</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs"
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote (WFA)</option>
                <option value="on_site">On-Site</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Batas Akhir Lamaran</label>
              <input
                type="date"
                required
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <ImageUploadField
            label="Logo Perusahaan / Penyelenggara"
            value={newLogo}
            onChange={(url) => setNewLogo(url)}
            placeholder="Unggah logo dari galeri atau tempel URL..."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Deskripsi Lengkap Posisi</label>
            <textarea
              required
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Kisaran Uang Saku / Gaji (Opsional)</label>
              <input
                type="text"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder="e.g. Rp 4.500.000 / bln"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Email Kontak Resmi</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="recruitment@company.com"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              {creating ? 'Mempublikasikan...' : 'Publikasikan Lowongan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
