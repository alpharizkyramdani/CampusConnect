import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserX,
  Filter,
  Clock,
  Sparkles,
  Search,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

interface ContentReport {
  id: number;
  reporter_id: number;
  reported_user_id: number | null;
  university_id: number | null;
  reportable_type: 'post' | 'comment' | 'user';
  reportable_id: number;
  category: string;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  action_taken: string | null;
  moderator_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: { id: number; name: string; email: string; avatar: string };
  reported_user?: { id: number; name: string; email: string; avatar: string };
  moderator?: { id: number; name: string };
}

export const ModerationDashboardPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Resolution Modal
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [actionTaken, setActionTaken] = useState<string>('hidden');
  const [resolveStatus, setResolveStatus] = useState<'resolved' | 'rejected' | 'under_review'>('resolved');
  const [moderatorNotes, setModeratorNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/moderation/reports', {
        params: {
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          type: typeFilter || undefined,
        },
      });
      if (res.data.success) {
        setReports(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load moderation reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter, typeFilter]);

  const handleOpenResolveModal = (report: ContentReport) => {
    setSelectedReport(report);
    setResolveStatus('resolved');
    setActionTaken(report.reportable_type === 'user' ? 'suspended' : 'hidden');
    setModeratorNotes('');
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/moderation/reports/${selectedReport.id}/resolve`, {
        status: resolveStatus,
        action_taken: resolveStatus === 'resolved' ? actionTaken : 'dismissed',
        moderator_notes: moderatorNotes || null,
      });

      if (res.data.success) {
        alert('Tindakan moderasi berhasil disimpan dan dicatat dalam audit log.');
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses tindakan moderasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'spam':
        return <Badge variant="slate" size="sm">Spam / Bot</Badge>;
      case 'harassment':
        return <Badge variant="rose" size="sm">Pelecehan / Bullying</Badge>;
      case 'hate_speech':
        return <Badge variant="rose" size="sm">Ujaran Kebencian</Badge>;
      case 'misinformation':
        return <Badge variant="amber" size="sm">Misinformasi / Hoaks</Badge>;
      case 'academic_fraud':
        return <Badge variant="purple" size="sm">Kecurangan Akademik</Badge>;
      default:
        return <Badge variant="blue" size="sm">{category.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg flex items-center gap-1"><Clock className="w-3 h-3" /> Perlu Ditinjau</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-lg flex items-center gap-1"><Eye className="w-3 h-3" /> Sedang Diselidiki</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Selesai / Ditindak</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-lg flex items-center gap-1"><XCircle className="w-3 h-3" /> Laporan Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Pusat Moderasi & Keamanan Komunitas</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau dan tindaklanjuti laporan pelanggaran konten, komentar, dan akun civitas kampus secara transparan dan terenkripsi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Kewenangan: {activeRole === 'super_admin' ? 'Super Admin (Lintas Kampus)' : 'Campus Admin (Kampus Internal)'}</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: '', label: 'Semua Status' },
            { id: 'pending', label: 'Perlu Ditinjau (Pending)' },
            { id: 'under_review', label: 'Dalam Investigasi' },
            { id: 'resolved', label: 'Selesai / Ditindak' },
            { id: 'rejected', label: 'Ditolak' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === s.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category & Type Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
          >
            <option value="">Semua Tipe Konten</option>
            <option value="post">Postingan Feed</option>
            <option value="comment">Komentar</option>
            <option value="user">Akun Pengguna</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
          >
            <option value="">Semua Kategori</option>
            <option value="spam">Spam / Bot</option>
            <option value="harassment">Pelecehan</option>
            <option value="hate_speech">Ujaran Kebencian</option>
            <option value="misinformation">Misinformasi</option>
            <option value="academic_fraud">Joki Tugas / Curang</option>
          </select>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-400">Memuat antrean laporan moderasi...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-navy text-sm">Tidak ada laporan konten yang menunggu tindakan</p>
            <p className="text-xs text-slate-400">Komunitas kampus dalam keadaan kondusif dan aman.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">ID / Tanggal</th>
                  <th className="p-3.5">Tipe & Kategori</th>
                  <th className="p-3.5">Pelapor</th>
                  <th className="p-3.5">Target / Terlapor</th>
                  <th className="p-3.5">Alasan Laporan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi Moderator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">
                      #{report.id}
                      <span className="block text-[10px] font-sans text-slate-500">
                        {new Date(report.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="p-3.5 space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px] uppercase">
                        {report.reportable_type} #{report.reportable_id}
                      </span>
                      <div>{getCategoryBadge(report.category)}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={report.reporter?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reporter?.name || 'U')}&background=2563EB&color=fff`}
                          alt="Reporter"
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-navy truncate max-w-[130px]">{report.reporter?.name || 'Civitas Kampus'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{report.reporter?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {report.reported_user ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={report.reported_user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reported_user?.name || 'U')}&background=DC2626&color=fff`}
                            alt="Target"
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-rose-700 truncate max-w-[130px]">{report.reported_user?.name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{report.reported_user?.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Konten #{report.reportable_id}</span>
                      )}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                        "{report.reason}"
                      </p>
                    </td>
                    <td className="p-3.5">{getStatusBadge(report.status)}</td>
                    <td className="p-3.5 text-right">
                      {report.status === 'pending' || report.status === 'under_review' ? (
                        <button
                          onClick={() => handleOpenResolveModal(report)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Tindaklanjuti</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Tindakan: <span className="font-bold text-slate-700">{report.action_taken || 'Selesai'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tindaklanjuti Laporan */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={`Tindaklanjuti Laporan Moderasi #${selectedReport?.id}`}
      >
        <form onSubmit={handleResolveReport} className="space-y-4 text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Detail Pelanggaran yang Dilaporkan</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <strong>Kategori:</strong> {selectedReport?.category.toUpperCase()} • <strong>Tipe:</strong> {selectedReport?.reportable_type} #{selectedReport?.reportable_id}
            </p>
            <p className="text-[11px] bg-white/80 p-2 rounded-xl border border-amber-200/60 mt-1 italic">
              "{selectedReport?.reason}"
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Keputusan Status Laporan</label>
            <select
              value={resolveStatus}
              onChange={(e) => setResolveStatus(e.target.value as any)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs"
            >
              <option value="resolved">Laporan Diterima & Konten Ditindak (Resolved)</option>
              <option value="under_review">Dalam Penyelidikan Lanjutan (Under Review)</option>
              <option value="rejected">Tolak Laporan / Tidak Ada Pelanggaran (Rejected)</option>
            </select>
          </div>

          {resolveStatus === 'resolved' && (
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Tindakan Disiplin yang Dikenakan</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs"
              >
                <option value="hidden">Sembunyikan Konten Secara Permanen (Content Hidden)</option>
                <option value="warning">Keluarkan Peringatan Disiplin ke Pengguna (Warning)</option>
                <option value="suspended">Bekukan / Suspend Akun Pelanggar (Suspend User)</option>
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Catatan Audit Moderator (Wajib)</label>
            <textarea
              required
              rows={3}
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              placeholder="Jelaskan dasar hukum/pedoman komunitas yang dilanggar untuk dicatat dalam log sistem..."
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Eksekusi Tindakan Moderasi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
