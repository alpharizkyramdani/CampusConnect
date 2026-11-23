import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Facility, FacilityCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  PackageCheck,
  Search,
  Plus,
  MapPin,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacilitiesPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Borrow Modal
  const [borrowModal, setBorrowModal] = useState<Facility | null>(null);
  const [borrowQty, setBorrowQty] = useState('1');
  const [borrowPurpose, setBorrowPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDueDate, setReturnDueDate] = useState('');
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  // Add Equipment Modal (Department Admin)
  const [addModal, setAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'damaged' | 'in_repair'>('good');
  const [totalQty, setTotalQty] = useState('1');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const canManageInventory = hasAnyRole(['super_admin', 'campus_admin', 'department_admin']);

  const fetchCategories = async () => {
    try {
      const univId = activeAssignment?.university_id || 5;
      const res = await api.get(`/facility-categories/${univId}`);
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facilities', {
        params: {
          university_id: activeAssignment?.university_id || 5,
          category_id: selectedCategory || undefined,
          condition: selectedCondition || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setFacilities(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeAssignment]);

  useEffect(() => {
    fetchFacilities();
  }, [selectedCondition, selectedCategory, activeAssignment]);

  const openBorrowModal = (fac?: Facility | null) => {
    const target = fac || facilities.find((f) => f.available_quantity > 0) || facilities[0] || null;
    setBorrowModal(target);
    setBorrowSuccess(false);
    setBorrowQty('1');
    setBorrowPurpose('');

    const today = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    setBorrowDate(today);
    setReturnDueDate(threeDaysLater);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowModal) return;
    setBorrowLoading(true);

    try {
      const res = await api.post('/borrowings', {
        facility_id: borrowModal.id,
        quantity: parseInt(borrowQty),
        purpose: borrowPurpose,
        borrow_date: borrowDate,
        return_due_date: returnDueDate,
      });

      if (res.data.success) {
        setBorrowSuccess(true);
        fetchFacilities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengajukan peminjaman alat');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/facilities', {
        university_id: activeAssignment?.university_id || 5,
        department_id: activeAssignment?.department_id || 44,
        name,
        code,
        condition,
        total_quantity: parseInt(totalQty),
        location,
        description,
        photo_url: photoUrl || null,
      });

      if (res.data.success) {
        setAddModal(false);
        setName('');
        setCode('');
        fetchFacilities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan alat laboratorium');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <PackageCheck className="w-6 h-6 text-brand-600" />
            Peminjaman Alat & Fasilitas Laboratorium PNL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Katalog peralatan laboratorium, perangkat IoT, proyektor, kamera multimedia, dan instrumen teknik terintegrasi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main User Borrow Button with + Sign */}
          <button
            onClick={() => openBorrowModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Pinjam Alat Baru
          </button>

          <Link
            to="/borrowings"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-600" />
            Catatan Peminjaman
          </Link>

          {canManageInventory && (
            <button
              onClick={() => setAddModal(true)}
              className="px-4 py-2.5 bg-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Alat (Admin)
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFacilities()}
            placeholder="Cari nama alat, kode aset, atau spesifikasi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="">Semua Kategori Lab ({facilities.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-wrap items-center gap-1">
            {['', 'excellent', 'good', 'fair', 'in_repair'].map((cond) => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  selectedCondition === cond
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cond === '' ? 'Semua Kondisi' : cond.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Tidak ada peralatan yang ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => {
            const isAvailable = fac.available_quantity > 0;
            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img
                      src={
                        fac.photo_url ||
                        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-navy/90 text-white shadow-xs backdrop-blur-xs">
                        {fac.code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={fac.condition === 'excellent' || fac.condition === 'good' ? 'emerald' : 'amber'}
                        size="sm"
                      >
                        {fac.condition}
                      </Badge>
                    </div>

                    {/* Quick Floating + Button on Image */}
                    {isAvailable && (
                      <button
                        type="button"
                        onClick={() => openBorrowModal(fac)}
                        title="Klik untuk langsung meminjam alat ini"
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                      <span>{fac.category?.name || fac.department?.name || 'Laboratorium PNL'}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        {fac.department?.code || 'PNL'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-navy line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{fac.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> Lokasi
                        </span>
                        <span className="font-semibold text-slate-800 text-right">{fac.location || 'Gedung Lab PNL'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Ketersediaan</span>
                        <span className="font-bold">
                          <span className={isAvailable ? 'text-emerald-600' : 'text-rose-600'}>
                            {fac.available_quantity}
                          </span>{' '}
                          / {fac.total_quantity} unit siap pakai
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Button with + Sign */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => openBorrowModal(fac)}
                    disabled={!isAvailable}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                      isAvailable
                        ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.99]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    {isAvailable ? 'Pinjam Alat Ini' : 'Stok Habis / Tidak Tersedia'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Request Modal */}
      <Modal
        isOpen={!!borrowModal}
        onClose={() => setBorrowModal(null)}
        title={borrowSuccess ? 'Pengajuan Peminjaman Berhasil' : `Formulir Peminjaman Alat: ${borrowModal?.name}`}
      >
        {borrowSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Pengajuan Telah Diterima</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Permohonan peminjaman peralatan laboratorium Anda telah diteruskan ke Admin Jurusan/Laboratorium untuk verifikasi. Anda dapat memantau status persetujuan pada menu Catatan Peminjaman.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/borrowings"
                className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Lihat Catatan Peminjaman
              </Link>
              <button
                onClick={() => setBorrowModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Ketentuan Peminjaman:</strong> Wajib melampirkan tujuan akademik atau kegiatan kampus. Stok tersedia saat ini: <strong>{borrowModal?.available_quantity}</strong> unit.
              </div>
            </div>

            {/* Select Equipment Dropdown */}
            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider">
                Peralatan Yang Dipinjam
              </label>
              <select
                value={borrowModal?.id || ''}
                onChange={(e) => {
                  const sel = facilities.find((f) => f.id.toString() === e.target.value);
                  if (sel) setBorrowModal(sel);
                }}
                className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.available_quantity <= 0}>
                    {f.name} ({f.code}) — {f.available_quantity > 0 ? `${f.available_quantity} unit tersedia` : 'Stok Habis'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase tracking-wider">
                Jumlah Unit (Maks: {borrowModal?.available_quantity || 1})
              </label>
              <input
                type="number"
                min="1"
                max={borrowModal?.available_quantity || 1}
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
                Keperluan / Tujuan Peminjaman
              </label>
              <textarea
                required
                rows={3}
                value={borrowPurpose}
                onChange={(e) => setBorrowPurpose(e.target.value)}
                placeholder="Jelaskan mata kuliah praktikum, judul riset/tugas akhir, atau kegiatan ormawa..."
                className="mt-1.5 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={borrowLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {borrowLoading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Peminjaman'}
            </button>
          </form>
        )}
      </Modal>

      {/* Add Equipment Modal (Department Admin) */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Tambah Peralatan ke Inventaris Lab PNL"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Nama Peralatan</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Total Station Topcon GM-55"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Kode Aset / Inventaris</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PNL-SIP-TTS01"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Kondisi</label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="excellent">Sangat Baik (Excellent)</option>
                <option value="good">Baik (Good)</option>
                <option value="fair">Cukup (Fair)</option>
                <option value="damaged">Rusak (Damaged)</option>
                <option value="in_repair">Sedang Servis (In Repair)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Total Stok</label>
              <input
                type="number"
                min="1"
                required
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Lokasi Ruang / Lab</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gedung TIK Lt. 2 Lab IoT"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Foto Peralatan</label>
            <div className="mt-1">
              <ImageUploadField
                value={photoUrl}
                onChange={setPhotoUrl}
                label="Unggah Foto Alat"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Deskripsi & Spesifikasi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian kelengkapan, aksesori, spesifikasi teknis..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? 'Menyimpan...' : 'Simpan Peralatan'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
