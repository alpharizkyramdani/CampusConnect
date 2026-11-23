import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FacilityBorrowing, Facility } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  History,
  CheckCircle,
  XCircle,
  ArrowRight,
  PackageCheck,
  Calendar,
  User,
  AlertTriangle,
  RotateCcw,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BorrowingsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [borrowings, setBorrowings] = useState<FacilityBorrowing[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Pickup Handover Modal (Admin)
  const [pickupModal, setPickupModal] = useState<FacilityBorrowing | null>(null);
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [pickupLoading, setPickupLoading] = useState(false);

  // Return modal (Admin)
  const [returnModal, setReturnModal] = useState<FacilityBorrowing | null>(null);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'fair' | 'damaged'>('good');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // New Borrow Modal (User / Student / Any Civitas)
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [borrowQty, setBorrowQty] = useState('1');
  const [borrowPurpose, setBorrowPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDueDate, setReturnDueDate] = useState('');
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  const isDeptAdmin = hasAnyRole(['super_admin', 'campus_admin', 'department_admin', 'sarpras_admin']);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrowings', {
        params: {
          department_id: isDeptAdmin ? activeAssignment?.department_id : undefined,
          status: selectedStatus || undefined,
          my_borrowings: !isDeptAdmin ? 'true' : undefined,
        },
      });
      if (res.data.success) {
        setBorrowings(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [selectedStatus, activeAssignment]);

  const openNewBorrowModal = async () => {
    setBorrowSuccess(false);
    const today = new Date().toISOString().split('T')[0];
    const threeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    setBorrowDate(today);
    setReturnDueDate(threeDays);
    setBorrowQty('1');
    setBorrowPurpose('');

    setBorrowModalOpen(true);
    try {
      const res = await api.get('/facilities', {
        params: { university_id: activeAssignment?.university_id || 5 },
      });
      if (res.data.success) {
        const items = res.data.data.data || res.data.data || [];
        setFacilitiesList(items);
        const firstAvail = items.find((f: Facility) => f.available_quantity > 0) || items[0];
        if (firstAvail) setSelectedFacilityId(firstAvail.id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityId) return;
    setBorrowSubmitting(true);

    try {
      const res = await api.post('/borrowings', {
        facility_id: parseInt(selectedFacilityId),
        quantity: parseInt(borrowQty),
        purpose: borrowPurpose,
        borrow_date: borrowDate,
        return_due_date: returnDueDate,
      });

      if (res.data.success) {
        setBorrowSuccess(true);
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengajukan peminjaman alat');
    } finally {
      setBorrowSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('Setujui pengajuan peminjaman peralatan ini?')) return;
    try {
      const res = await api.post(`/borrowings/${id}/approve`);
      if (res.data.success) {
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui peminjaman');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Masukkan alasan penolakan:');
    if (reason === null) return;
    try {
      const res = await api.post(`/borrowings/${id}/reject`, { admin_notes: reason });
      if (res.data.success) {
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak peminjaman');
    }
  };

  const handleRecordPickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupModal) return;
    setPickupLoading(true);
    try {
      const res = await api.post(`/borrowings/${pickupModal.id}/pickup`, {
        pickup_photo_url: pickupPhotoUrl.trim() || undefined,
        pickup_notes: pickupNotes.trim() || undefined,
      });
      if (res.data.success) {
        setPickupModal(null);
        setPickupPhotoUrl('');
        setPickupNotes('');
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mencatat serah terima barang');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleRecordReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModal) return;
    setActionLoading(true);

    try {
      const res = await api.post(`/borrowings/${returnModal.id}/return`, {
        return_condition: returnCondition,
        return_photo_url: returnPhotoUrl.trim() || undefined,
        admin_notes: adminNotes,
      });

      if (res.data.success) {
        setReturnModal(null);
        setReturnCondition('good');
        setReturnPhotoUrl('');
        setAdminNotes('');
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mencatat pengembalian alat');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="emerald">Disetujui / Siap Diambil</Badge>;
      case 'borrowed':
        return <Badge variant="blue">Sedang Dipinjam</Badge>;
      case 'returned':
        return <Badge variant="slate">Selesai Dikembalikan</Badge>;
      case 'rejected':
        return <Badge variant="rose">Ditolak</Badge>;
      case 'overdue':
        return <Badge variant="rose">Terlambat (Overdue)</Badge>;
      case 'pending':
      default:
        return <Badge variant="amber">Menunggu Persetujuan</Badge>;
    }
  };

  const selectedFacility = facilitiesList.find((f) => f.id.toString() === selectedFacilityId);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-600" />
            Manajemen Peminjaman Peralatan Kampus PNL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isDeptAdmin
              ? 'Verifikasi pengajuan peminjaman mahasiswa, catat serah terima fisik peralatan lab, dan audit kondisi pengembalian.'
              : 'Pantau histori permohonan peminjaman peralatan lab, batas waktu pengembalian, dan ajukan peminjaman baru.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* User + Button to Borrow Equipment */}
          <button
            onClick={() => openNewBorrowModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Pinjam Alat Baru
          </button>

          <Link
            to="/facilities"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-slate-500" />
            Katalog Fasilitas
          </Link>
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-2xl border border-borderMuted shadow-xs">
        {[
          { key: '', label: 'Semua Status' },
          { key: 'pending', label: 'Menunggu Persetujuan' },
          { key: 'approved', label: 'Disetujui' },
          { key: 'borrowed', label: 'Sedang Dipinjam' },
          { key: 'returned', label: 'Telah Kembali' },
        ].map((st) => (
          <button
            key={st.key}
            onClick={() => setSelectedStatus(st.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStatus === st.key
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Borrowings Table / Cards */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Memuat catatan peminjaman peralatan...
          </div>
        ) : borrowings.length === 0 ? (
          <div className="p-12 text-center">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Belum ada riwayat peminjaman alat</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Anda belum memiliki permohonan peminjaman aktif. Silakan ajukan peminjaman peralatan laboratorium menggunakan tombol di bawah ini.
            </p>
            <button
              onClick={() => openNewBorrowModal()}
              className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              + Pinjam Alat Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Peminjam</th>
                  <th className="py-3.5 px-4">Peralatan Lab</th>
                  <th className="py-3.5 px-4">Jumlah</th>
                  <th className="py-3.5 px-4">Jadwal Pinjam</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{b.user?.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{b.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy">{b.facility?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.facility?.code}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                        "{b.purpose}"
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{b.quantity} unit</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Pinjam: {new Date(b.borrow_date).toLocaleDateString('id-ID')}</div>
                      <div className="text-[11px] text-slate-400">
                        Batas: {new Date(b.return_due_date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {isDeptAdmin && b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {isDeptAdmin && b.status === 'approved' && (
                        <button
                          onClick={() => {
                            setPickupModal(b);
                            setPickupPhotoUrl(b.pickup_photo_url || '');
                            setPickupNotes(b.pickup_notes || '');
                          }}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Serahkan Barang
                        </button>
                      )}

                      {isDeptAdmin && b.status === 'borrowed' && (
                        <button
                          onClick={() => {
                            setReturnModal(b);
                            setReturnCondition('good');
                            setReturnPhotoUrl(b.return_photo_url || '');
                            setAdminNotes(b.admin_notes || '');
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 inline-flex transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Catat Pengembalian
                        </button>
                      )}

                      {!isDeptAdmin && (
                        <span className="text-slate-400 text-[11px] italic">
                          {b.status === 'pending'
                            ? 'Menunggu Review Admin'
                            : b.status === 'approved'
                            ? 'Siap Diambil di Lab'
                            : b.status === 'borrowed'
                            ? 'Sedang Anda Gunakan'
                            : 'Tersimpan'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Borrow Modal (+ Pinjam Alat) */}
      <Modal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        title={borrowSuccess ? 'Permohonan Peminjaman Berhasil' : 'Formulir Permohonan Pinjam Alat Laboratorium'}
      >
        {borrowSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Pengajuan Telah Dikirim</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Pengajuan peminjaman peralatan laboratorium Anda telah berhasil dicatat ke antrean sistem. Admin Jurusan/Laboratorium akan memvalidasi jadwal sebelum peralatan dapat diambil.
            </p>
            <button
              onClick={() => setBorrowModalOpen(false)}
              className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleNewBorrowSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>SOP Peminjaman PNL:</strong> Seluruh alat laboratorium wajib dikembalikan tepat waktu dan dalam kondisi bersih serta berfungsi baik.
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider">
                Pilih Alat Laboratorium
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => {
                  setSelectedFacilityId(e.target.value);
                  setBorrowQty('1');
                }}
                required
                className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              >
                {facilitiesList.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.available_quantity <= 0}>
                    {f.name} ({f.code}) — {f.available_quantity > 0 ? `${f.available_quantity} unit siap pinjam` : 'Stok Kosong'}
                  </option>
                ))}
              </select>
              {selectedFacility && (
                <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Lokasi: {selectedFacility.location || 'Laboratorium PNL'}</span>
                  <span className="font-bold text-emerald-600">
                    Stok Tersedia: {selectedFacility.available_quantity} unit
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider">
                Jumlah Unit (Maks: {selectedFacility?.available_quantity || 1})
              </label>
              <input
                type="number"
                min="1"
                max={selectedFacility?.available_quantity || 1}
                required
                value={borrowQty}
                onChange={(e) => setBorrowQty(e.target.value)}
                className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block uppercase tracking-wider">
                  Tanggal Pinjam
                </label>
                <input
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block uppercase tracking-wider">
                  Batas Pengembalian
                </label>
                <input
                  type="date"
                  required
                  value={returnDueDate}
                  onChange={(e) => setReturnDueDate(e.target.value)}
                  className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider">
                Tujuan & Keperluan Peminjaman
              </label>
              <textarea
                required
                rows={3}
                value={borrowPurpose}
                onChange={(e) => setBorrowPurpose(e.target.value)}
                placeholder="Jelaskan mata kuliah praktikum, kegiatan ormawa, atau riset tugas akhir..."
                className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={borrowSubmitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {borrowSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Peminjaman'}
            </button>
          </form>
        )}
      </Modal>

      {/* Handover Pickup Modal (Admin) */}
      <Modal
        isOpen={!!pickupModal}
        onClose={() => setPickupModal(null)}
        title={`Serah Terima Fisik Alat: ${pickupModal?.facility?.name}`}
      >
        <form onSubmit={handleRecordPickupSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
            Konfirmasi bahwa pemohon (<strong>{pickupModal?.user?.name}</strong>) telah hadir di laboratorium dan menerima <strong>{pickupModal?.quantity} unit</strong> peralatan dalam kondisi siap pakai.
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase tracking-wider">
              Foto Bukti Kondisi Fisik Saat Pengambilan (URL / Path)
            </label>
            <input
              type="text"
              value={pickupPhotoUrl}
              onChange={(e) => setPickupPhotoUrl(e.target.value)}
              placeholder="Contoh: https://... atau uploads/facilities/pickup_01.jpg"
              className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dokumentasi foto awal serah terima sebelum barang dibawa keluar lab.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase tracking-wider">
              Catatan Serah Terima / Kondisi Awal
            </label>
            <textarea
              rows={3}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Catatan serial number, kondisi fisik awal, charger/kabel lengkap..."
              className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={pickupLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {pickupLoading ? 'Menyimpan...' : 'Konfirmasi Serah Terima Barang'}
          </button>
        </form>
      </Modal>

      {/* Record Return Modal (Admin) */}
      <Modal
        isOpen={!!returnModal}
        onClose={() => setReturnModal(null)}
        title={`Audit & Pengembalian: ${returnModal?.facility?.name}`}
      >
        <form onSubmit={handleRecordReturn} className="space-y-4 text-xs">
          {returnCondition === 'damaged' ? (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 leading-relaxed font-medium">
              <strong className="text-rose-700 block mb-1">Perhatian Aturan Stok Kritis:</strong>
              Karena kondisi dipilih <strong>Rusak (Damaged)</strong>, stok unit <strong>TIDAK AKAN</strong> ditambahkan kembali ke inventaris siap pinjam. Sistem secara otomatis menandai unit dalam perbaikan dan menerbitkan tiket servis ke Unit Sarana & Prasarana (Sarpras).
            </div>
          ) : (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
              Mencatat pengembalian ini akan mengembalikan stok ketersediaan barang sebanyak <strong>{returnModal?.quantity} unit</strong> ke inventaris laboratorium.
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block uppercase tracking-wider">
              Kondisi Fisik Saat Dikembalikan
            </label>
            <select
              value={returnCondition}
              onChange={(e: any) => setReturnCondition(e.target.value)}
              className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold focus:bg-white"
            >
              <option value="excellent">Sangat Baik (Excellent) — mulus seperti semula</option>
              <option value="good">Baik (Good) — pemakaian wajar</option>
              <option value="fair">Cukup (Fair) — ada lecet pemakaian minor</option>
              <option value="damaged">Rusak (Damaged) — pecah/mati total/perlu servis Sarpras</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase tracking-wider">
              Foto Bukti Kondisi Fisik Pengembalian (URL / Path)
            </label>
            <input
              type="text"
              value={returnPhotoUrl}
              onChange={(e) => setReturnPhotoUrl(e.target.value)}
              placeholder="Contoh: https://... atau uploads/facilities/return_01.jpg"
              className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dokumentasi foto kondisi fisik saat dikembalikan oleh peminjam.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase tracking-wider">
              Catatan Pemeriksaan Admin Lab
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Pemeriksaan fungsi, kelengkapan kabel, aksesori, charger, dan tas pelindung..."
              className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {actionLoading ? 'Menyimpan...' : 'Konfirmasi Audit Pengembalian Barang'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
