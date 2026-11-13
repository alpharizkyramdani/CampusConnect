import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  BookOpen,
  Search,
  Bookmark,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  BookMarked,
  RotateCcw,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface LibraryItem {
  id: number;
  title: string;
  author: string;
  isbn_issn: string | null;
  publisher: string | null;
  publication_year: number | null;
  category: string;
  description: string | null;
  cover_image: string | null;
  file_url: string | null;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
  is_digital_access: boolean;
  borrow_count: number;
}

interface LoanItem {
  id: number;
  loan_code: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  fine_amount: number;
  item: LibraryItem;
}

export const DigitalLibraryPage: React.FC = () => {
  const { user, activeRole, activeAssignment } = useAuth();
  const isAdmin = activeRole === 'super_admin' || activeRole === 'campus_admin' || activeRole === 'department_admin';

  const [activeTab, setActiveTab] = useState<'catalog' | 'my_loans'>('catalog');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [myLoans, setMyLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Borrow Modal
  const [borrowModalItem, setBorrowModalItem] = useState<LibraryItem | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  // Add Item Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newYear, setNewYear] = useState(2024);
  const [newCategory, setNewCategory] = useState('academic_book');
  const [newDescription, setNewDescription] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newTotalCopies, setNewTotalCopies] = useState(5);
  const [newShelf, setNewShelf] = useState('Lantai 2 - Rak B-01');
  const [adding, setAdding] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('/library/items', {
        params: {
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setItems(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLoans = async () => {
    try {
      const res = await api.get('/library/my-loans');
      if (res.data.success) {
        setMyLoans(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchCatalog();
    } else {
      fetchMyLoans();
    }
  }, [activeTab, categoryFilter, search]);

  const handleBorrowBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowModalItem || borrowing) return;

    setBorrowing(true);
    try {
      const res = await api.post(`/library/items/${borrowModalItem.id}/borrow`);
      if (res.data.success) {
        alert(res.data.message);
        setBorrowModalItem(null);
        fetchCatalog();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal meminjam koleksi.');
    } finally {
      setBorrowing(false);
    }
  };

  const handleReturnBook = async (loanId: number) => {
    if (!window.confirm('Konfirmasi pengembalian buku ini ke meja sirkulasi perpustakaan?')) return;

    try {
      const res = await api.post(`/library/loans/${loanId}/return`);
      if (res.data.success) {
        alert(res.data.message);
        fetchMyLoans();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian.');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await api.post('/library/items', {
        university_id: activeAssignment?.university_id || 1,
        title: newTitle,
        author: newAuthor,
        isbn_issn: newIsbn || null,
        publisher: newPublisher || null,
        publication_year: newYear,
        category: newCategory,
        description: newDescription || null,
        cover_image: newCover || null,
        total_copies: newTotalCopies,
        shelf_location: newShelf,
        is_digital_access: true,
      });

      if (res.data.success) {
        alert('Buku/Jurnal baru berhasil didaftarkan ke katalog perpustakaan!');
        setAddModalOpen(false);
        fetchCatalog();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan koleksi.');
    } finally {
      setAdding(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'academic_book':
        return <Badge variant="blue" size="sm">Buku Teks Akademik</Badge>;
      case 'journal':
        return <Badge variant="emerald" size="sm">Jurnal Ilmiah</Badge>;
      case 'thesis':
        return <Badge variant="purple" size="sm">Skripsi & Tugas Akhir</Badge>;
      case 'lab_module':
        return <Badge variant="amber" size="sm">Modul Praktikum</Badge>;
      case 'general_reference':
        return <Badge variant="slate" size="sm">Referensi Umum</Badge>;
      default:
        return <Badge variant="blue" size="sm">{cat}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Perpustakaan Digital & Repository</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Akses katalog buku teks akademik, repositori skripsi/tugas akhir, modul laboratorium, dan jurnal ilmiah terakreditasi.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setNewTitle('');
              setNewAuthor('');
              setNewDescription('');
              setNewCover('');
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Koleksi Buku</span>
          </button>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'catalog' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Katalog Koleksi ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_loans')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'my_loans' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Peminjaman Saya ({myLoans.length})</span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Semua Koleksi' },
                { id: 'academic_book', label: 'Buku Teks Akademik' },
                { id: 'journal', label: 'Jurnal Ilmiah' },
                { id: 'thesis', label: 'Skripsi / Tugas Akhir' },
                { id: 'lab_module', label: 'Modul Praktikum' },
                { id: 'general_reference', label: 'Referensi Umum' },
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

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul, pengarang, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          {/* Catalog Items Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-400">Memuat katalog perpustakaan...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted shadow-xs space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-navy text-sm">Tidak ditemukan buku atau karya ilmiah yang cocok</p>
              <p className="text-xs text-slate-400">Silakan periksa ejaan atau ubah pilihan kategori Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-borderMuted shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-20 h-28 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                    />

                    <div className="space-y-1.5 min-w-0">
                      <div>{getCategoryBadge(item.category)}</div>
                      <h3 className="font-extrabold text-sm text-navy line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        Oleh: {item.author}
                      </p>
                      {item.publisher && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.publisher} ({item.publication_year || 'Tahun N/A'})
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.description || 'Tidak ada sinopsis ringkas untuk koleksi ini.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ketersediaan Fisik:</span>
                      <span className={`font-bold font-mono ${item.available_copies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.available_copies} dari {item.total_copies} Tersedia
                      </span>
                    </div>

                    <button
                      onClick={() => setBorrowModalItem(item)}
                      disabled={item.available_copies < 1}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs disabled:opacity-50"
                    >
                      Pinjam Koleksi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Loans Tab */
        <div className="bg-white rounded-3xl border border-borderMuted shadow-xs overflow-hidden">
          {myLoans.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-navy text-sm">Tidak ada riwayat peminjaman buku yang aktif</p>
              <p className="text-xs text-slate-400">Jelajahi tab katalog untuk meminjam buku atau literatur studi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Kode Tiket</th>
                    <th className="p-4">Koleksi Buku / Jurnal</th>
                    <th className="p-4">Tgl Pinjam</th>
                    <th className="p-4">Batas Pengembalian</th>
                    <th className="p-4">Lokasi Rak</th>
                    <th className="p-4">Status & Denda</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-brand-600">{loan.loan_code}</td>
                      <td className="p-4">
                        <div className="font-bold text-navy text-xs">{loan.item?.title}</div>
                        <div className="text-[11px] text-slate-400">Oleh: {loan.item?.author}</div>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(loan.borrow_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-4 font-bold font-mono text-slate-700">
                        {new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">{loan.item?.shelf_location || '-'}</td>
                      <td className="p-4">
                        {loan.status === 'returned' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">
                            Dikembalikan
                          </span>
                        ) : loan.status === 'overdue' ? (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-xs">
                            Terlambat (Denda: Rp {loan.fine_amount?.toLocaleString()})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
                            Aktif Dipinjam
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {loan.status === 'borrowed' && (
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Pinjam Buku */}
      <Modal
        isOpen={!!borrowModalItem}
        onClose={() => setBorrowModalItem(null)}
        title={`Konfirmasi Peminjaman Buku`}
      >
        <form onSubmit={handleBorrowBook} className="space-y-4 text-xs">
          <div className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <img
              src={borrowModalItem?.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80'}
              alt={borrowModalItem?.title}
              className="w-16 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="font-extrabold text-sm text-navy">{borrowModalItem?.title}</h3>
              <p className="text-xs text-slate-500">Penulis: {borrowModalItem?.author}</p>
              <p className="text-[11px] text-slate-400 mt-1">Lokasi Rak: <strong>{borrowModalItem?.shelf_location}</strong></p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Ketentuan Peminjaman Perpustakaan:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
              <li>Masa peminjaman standar adalah <strong>14 hari kalender</strong>.</li>
              <li>Buku wajib dijaga dalam kondisi utuh dan tidak dicoret.</li>
              <li>Denda keterlambatan berlaku Rp 1.000 / hari jika melewati batas tempo.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBorrowModalItem(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={borrowing}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              {borrowing ? 'Mencatat...' : 'Konfirmasi Peminjaman (14 Hari)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Library Item (Admin) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Daftarkan Koleksi Baru ke Perpustakaan"
      >
        <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Judul Buku / Jurnal / Karya Ilmiah</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Clean Architecture: A Craftsman's Guide"
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Nama Pengarang / Penulis</label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="e.g. Robert C. Martin"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Kategori Koleksi</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-xs"
              >
                <option value="academic_book">Buku Teks Akademik</option>
                <option value="journal">Jurnal Ilmiah</option>
                <option value="thesis">Skripsi & Tugas Akhir</option>
                <option value="lab_module">Modul Praktikum</option>
                <option value="general_reference">Referensi Umum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">ISBN / ISSN / No. Arsip</label>
              <input
                type="text"
                value={newIsbn}
                onChange={(e) => setNewIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Penerbit</label>
              <input
                type="text"
                value={newPublisher}
                onChange={(e) => setNewPublisher(e.target.value)}
                placeholder="Pearson, IEEE, etc."
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Jumlah Eksemplar</label>
              <input
                type="number"
                min="1"
                value={newTotalCopies}
                onChange={(e) => setNewTotalCopies(parseInt(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <ImageUploadField
            label="Foto Sampul Buku (Cover Image)"
            value={newCover}
            onChange={(url) => setNewCover(url)}
            placeholder="Unggah cover buku dari galeri atau tempel URL..."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Lokasi Rak Fisik</label>
            <input
              type="text"
              value={newShelf}
              onChange={(e) => setNewShelf(e.target.value)}
              placeholder="e.g. Lantai 2 - Rak Pemrograman B-01"
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Sinopsis / Abstrak Singkat</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              {adding ? 'Mendaftarkan...' : 'Simpan Koleksi Buku'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
