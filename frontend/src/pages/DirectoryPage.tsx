import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { University, Faculty, User } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Users2,
  Search,
  Mail,
  MapPin,
  ExternalLink,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Globe,
  Phone,
  FileText,
  Pencil,
  Trash2,
  Power,
  AlertTriangle,
  X,
  MessageSquare,
} from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const { activeRole, activeAssignment } = useAuth();
  const isSuperAdmin = activeRole === 'super_admin';

  const [tab, setTab] = useState<'universities' | 'faculties' | 'lecturers'>('faculties');
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for Direct University Creation (Super Admin)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Modal State for Edit University (Super Admin)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUniv, setEditingUniv] = useState<University | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');

  // Modal State for Delete University (Super Admin)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUniv, setDeletingUniv] = useState<University | null>(null);

  // Faculty & Department Creation State
  const [selectedUnivForFaculties, setSelectedUnivForFaculties] = useState<string>('1');
  const [addFacultyModalOpen, setAddFacultyModalOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [facultyDesc, setFacultyDesc] = useState('');

  const [addDeptModalFaculty, setAddDeptModalFaculty] = useState<Faculty | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Faculty Edit State
  const [editFacultyModalOpen, setEditFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editFacultyCode, setEditFacultyCode] = useState('');
  const [editFacultyDesc, setEditFacultyDesc] = useState('');

  // Department Edit State
  const [editDeptModalOpen, setEditDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptCode, setEditDeptCode] = useState('');
  const [editDeptDesc, setEditDeptDesc] = useState('');

  const isCampusAdmin = activeRole === 'campus_admin';
  const isDeptAdmin = activeRole === 'department_admin';
  const canManageLecturers = isSuperAdmin || isCampusAdmin || isDeptAdmin;

  // Lecturer State & Management
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUnivForLecturers, setSelectedUnivForLecturers] = useState<string>('');
  const [lecturerSearch, setLecturerSearch] = useState<string>('');
  const [lecturerStatusFilter, setLecturerStatusFilter] = useState<string>('');
  const [addLecturerModalOpen, setAddLecturerModalOpen] = useState(false);
  const [newLecName, setNewLecName] = useState('');
  const [newLecEmail, setNewLecEmail] = useState('');
  const [newLecPassword, setNewLecPassword] = useState('Password123!');
  const [newLecNidn, setNewLecNidn] = useState('');
  const [newLecTitle, setNewLecTitle] = useState('Dosen Pengajar / Lektor');
  const [newLecUnivId, setNewLecUnivId] = useState('');
  const [newLecDeptId, setNewLecDeptId] = useState('');
  const [creatingLecturer, setCreatingLecturer] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const targetFUniv = selectedUnivForFaculties || (activeAssignment?.university_id?.toString() || '1');
      const targetLUniv = isSuperAdmin
        ? (selectedUnivForLecturers ? selectedUnivForLecturers : undefined)
        : activeAssignment?.university_id?.toString();

      const [uRes, fRes, lRes, rRes] = await Promise.all([
        api.get('/universities'),
        api.get(`/universities/${targetFUniv}/faculties`),
        api.get('/users', {
          params: {
            role: 'lecturer',
            university_id: targetLUniv,
          },
        }),
        api.get('/roles'),
      ]);

      if (uRes.data.success) {
        setUniversities(uRes.data.data || []);
        const pnl = uRes.data.data?.find((u: any) => u.code === 'PNL') || uRes.data.data?.[0];
        if (pnl) {
          setSelectedUnivForFaculties(pnl.id.toString());
          setNewLecUnivId(pnl.id.toString());
          fetchFacultiesForUniv(pnl.id.toString());
        }
      }
      if (fRes.data.success) setFaculties(fRes.data.data || []);
      if (lRes.data.success) setLecturers(lRes.data.data.data || lRes.data.data || []);
      if (rRes.data.success) setRoles(rRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLecturerStatus = async (lec: any) => {
    const newStatus = lec.status === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'suspended' ? 'menonaktifkan (suspend)' : 'mengaktifkan kembali';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} akun dosen "${lec.name}"?`)) return;

    try {
      const res = await api.put(`/users/${lec.id}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Status dosen ${lec.name} berhasil diubah menjadi ${newStatus}.`,
        });
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal mengubah status dosen.',
      });
    }
  };

  const handleDeleteLecturer = async (lec: any) => {
    if (
      !window.confirm(
        `⚠️ PERINGATAN HAPUS DOSEN:\nApakah Anda yakin ingin menghapus akun dosen "${lec.name}" (${lec.email}) secara permanen?\n\nProfil akademik, NIDN, penugasan mata kuliah, dan hak akses dosen ini akan dihapus dari sistem!`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/users/${lec.id}`);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Akun dosen ${lec.name} (${lec.email}) berhasil dihapus secara permanen.`,
        });
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menghapus akun dosen.',
      });
    }
  };

  const handleCreateLecturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLecturer(true);
    setMessage(null);

    try {
      const lecturerRole = roles.find((r) => r.slug === 'lecturer');
      const targetUniv = isSuperAdmin
        ? (newLecUnivId ? parseInt(newLecUnivId) : null)
        : (activeAssignment?.university_id || null);

      const res = await api.post('/users', {
        name: newLecName,
        email: newLecEmail,
        password: newLecPassword,
        role_id: lecturerRole ? lecturerRole.id : 6,
        university_id: targetUniv,
        department_id: newLecDeptId ? parseInt(newLecDeptId) : null,
        nidn: newLecNidn,
        title: newLecTitle,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Akun dosen ${newLecName} (${newLecEmail}) berhasil didaftarkan!`,
        });
        setAddLecturerModalOpen(false);
        setNewLecName('');
        setNewLecEmail('');
        setNewLecNidn('');
        setNewLecTitle('Dosen Pengajar / Lektor');
        fetchData();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menambahkan data dosen.',
      });
    } finally {
      setCreatingLecturer(false);
    }
  };

  const fetchFacultiesForUniv = async (univId: string) => {
    try {
      const res = await api.get(`/universities/${univId}/faculties`);
      if (res.data.success) setFaculties(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/universities/${selectedUnivForFaculties}/faculties`, {
        name: facultyName,
        code: facultyCode,
        description: facultyDesc,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Faculty "${facultyName}" added successfully!` });
        setAddFacultyModalOpen(false);
        setFacultyName('');
        setFacultyCode('');
        setFacultyDesc('');
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create faculty.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDeptModalFaculty) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/faculties/${addDeptModalFaculty.id}/departments`, {
        name: deptName,
        code: deptCode,
        description: deptDesc,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Department/Major "${deptName}" created successfully!` });
        setAddDeptModalFaculty(null);
        setDeptName('');
        setDeptCode('');
        setDeptDesc('');
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create department.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditFaculty = (f: Faculty) => {
    setEditingFaculty(f);
    setEditFacultyName(f.name);
    setEditFacultyCode(f.code || '');
    setEditFacultyDesc(f.description || '');
    setEditFacultyModalOpen(true);
    setMessage(null);
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.put(`/faculties/${editingFaculty.id}`, {
        name: editFacultyName,
        code: editFacultyCode,
        description: editFacultyDesc,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Faculty / Jurusan "${editFacultyName}" updated successfully!` });
        setEditFacultyModalOpen(false);
        setEditingFaculty(null);
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update faculty');
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update faculty.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFaculty = async (f: Faculty) => {
    if (!window.confirm(`Are you sure you want to delete Faculty / Jurusan "${f.name}" and all its departments?`)) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.delete(`/faculties/${f.id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Faculty / Jurusan "${f.name}" deleted successfully!` });
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete faculty');
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete faculty.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDepartment = (d: any) => {
    setEditingDept(d);
    setEditDeptName(d.name);
    setEditDeptCode(d.code || '');
    setEditDeptDesc(d.description || '');
    setEditDeptModalOpen(true);
    setMessage(null);
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.put(`/departments/${editingDept.id}`, {
        name: editDeptName,
        code: editDeptCode,
        description: editDeptDesc,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: `Department / Prodi "${editDeptName}" updated successfully!` });
        setEditDeptModalOpen(false);
        setEditingDept(null);
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update department');
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update department.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDepartment = async (d: any) => {
    if (!window.confirm(`Are you sure you want to delete Department / Program Studi "${d.name}"?`)) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.delete(`/departments/${d.id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Department / Prodi "${d.name}" deleted successfully!` });
        fetchFacultiesForUniv(selectedUnivForFaculties);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete department');
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete department.' });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeAssignment, isSuperAdmin]);

  const handleCreateUniversityDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/universities', {
        name,
        code,
        email,
        website,
        address,
        description,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: `Campus ${name} added and activated successfully!` });
        setAddModalOpen(false);
        setName('');
        setCode('');
        setEmail('');
        setWebsite('');
        setAddress('');
        setDescription('');
        await fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create university.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (univ: University) => {
    setEditingUniv(univ);
    setEditName(univ.name);
    setEditCode(univ.code);
    setEditEmail(univ.email);
    setEditWebsite(univ.website || '');
    setEditAddress(univ.address || '');
    setEditDescription(univ.description || '');
    setEditStatus(univ.status === 'suspended' ? 'suspended' : 'active');
    setEditModalOpen(true);
    setMessage(null);
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniv) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.put(`/universities/${editingUniv.id}`, {
        name: editName,
        code: editCode,
        email: editEmail,
        website: editWebsite || null,
        address: editAddress,
        description: editDescription || null,
        status: editStatus,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: `University "${editName}" updated successfully!` });
        setEditModalOpen(false);
        setEditingUniv(null);
        await fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update university.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (univ: University) => {
    const nextStatus = univ.status === 'active' ? 'suspended' : 'active';
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.put(`/universities/${univ.id}`, {
        name: univ.name,
        code: univ.code,
        email: univ.email,
        website: univ.website || null,
        address: univ.address || 'Campus Headquarters',
        description: univ.description || null,
        status: nextStatus,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `University "${univ.name}" status updated to ${nextStatus.toUpperCase()}!`,
        });
        await fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (univ: University) => {
    setDeletingUniv(univ);
    setDeleteModalOpen(true);
    setMessage(null);
  };

  const handleDeleteUniversity = async () => {
    if (!deletingUniv) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.delete(`/universities/${deletingUniv.id}`);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `University "${deletingUniv.name}" has been removed successfully!`,
        });
        setDeleteModalOpen(false);
        setDeletingUniv(null);
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete university.');
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete university.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUniversities = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.code.toLowerCase().includes(search.toLowerCase()) ||
      (u.address && u.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-brand-600" />
            Jurusan & Direktori Kampus PNL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data 6 Jurusan, Program Studi, Dosen & Peneliti Politeknik Negeri Lhokseumawe
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin && (
            <button
              onClick={() => { setAddFacultyModalOpen(true); setMessage(null); }}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Jurusan PNL
            </button>
          )}

          {canManageLecturers && (
            <button
              onClick={() => { setAddLecturerModalOpen(true); setMessage(null); }}
              className="px-4 py-2.5 bg-white text-navy border border-borderMuted hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
            >
              <Users2 className="w-4 h-4 text-brand-600" />
              Tambah Dosen PNL
            </button>
          )}
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-500 hover:text-slate-800 shrink-0"
            title="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-borderMuted pb-3">
        <button
          onClick={() => setTab('faculties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'faculties'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Jurusan & Program Studi ({faculties.length})
        </button>

        <button
          onClick={() => setTab('lecturers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'lecturers'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dosen & Peneliti ({lecturers.length})
        </button>

        <button
          onClick={() => setTab('universities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'universities'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Profil Kampus PNL
        </button>
      </div>

      {/* Tab 1: Universities Catalog */}
      {tab === 'universities' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search universities by name, code, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-3xl border border-borderMuted overflow-hidden shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      {u.code}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-navy truncate">{u.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono truncate block">{u.email}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">
                    {u.description || 'Premier higher education institution committed to excellence in academic research and student innovation.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px]">{u.address || 'Campus Headquarters'}</span>
                    </div>
                    {u.faculties_count !== undefined && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>{u.faculties_count} Faculties • {u.departments_count || 0} Departments</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    {u.website ? (
                      <a
                        href={u.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                      >
                        Official Portal <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No web link provided</span>
                    )}

                    <Badge variant={u.status === 'suspended' ? 'rose' : 'emerald'} size="sm">
                      {u.status === 'suspended' ? 'Suspended' : 'Active Tenancy'}
                    </Badge>
                  </div>

                  {isSuperAdmin && (
                    <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 ${
                            u.status === 'active'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(u)}
                        disabled={actionLoading}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Faculties & Departments */}
      {tab === 'faculties' && (
        <div className="space-y-6">
          {/* Controls: Campus Badge & Add Faculty */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="px-3.5 py-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                Politeknik Negeri Lhokseumawe (PNL)
              </span>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setAddFacultyModalOpen(true)}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Jurusan PNL</span>
              </button>
            )}
          </div>

          {faculties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No faculties registered yet for this campus</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Newly provisioned universities require academic faculties and departments to be registered.
              </p>
              {isSuperAdmin && (
                <button
                  onClick={() => setAddFacultyModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Faculty</span>
                </button>
              )}
            </div>
          ) : (
            faculties.map((f) => (
              <div key={f.id} className="bg-white rounded-3xl border border-borderMuted p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-navy text-white">
                      {f.code}
                    </span>
                    <Badge variant="blue">{f.departments?.length || 0} Departments / Prodi</Badge>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAddDeptModalFaculty(f)}
                        className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Prodi</span>
                      </button>

                      <button
                        onClick={() => openEditFaculty(f)}
                        title="Edit Faculty / Jurusan"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      </button>

                      <button
                        onClick={() => handleDeleteFaculty(f)}
                        title="Delete Faculty / Jurusan"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-navy">{f.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{f.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(!f.departments || f.departments.length === 0) ? (
                    <div className="text-xs text-slate-400 col-span-3 py-2 italic">
                      No departments/majors yet. Click '+ Add Prodi' above to register one.
                    </div>
                  ) : (
                    f.departments.map((d) => (
                      <div key={d.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-brand-600 font-bold block">{d.code}</span>
                            {isSuperAdmin && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditDepartment(d)}
                                  title="Edit Department / Prodi"
                                  className="p-1 text-slate-400 hover:text-brand-600 rounded hover:bg-white transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDepartment(d)}
                                  title="Delete Department / Prodi"
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900">{d.name}</h4>
                          <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{d.description || 'Program Studi & Himpunan Mahasiswa'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Lecturers */}
      {tab === 'lecturers' && (
        <div className="space-y-6">
          {/* Toolbar: Search, Filter, and Add Lecturer */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari dosen berdasarkan nama, email, NIDN..."
                value={lecturerSearch}
                onChange={(e) => setLecturerSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {isSuperAdmin && (
                <select
                  value={selectedUnivForLecturers}
                  onChange={(e) => setSelectedUnivForLecturers(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:bg-white"
                >
                  <option value="">Semua Universitas</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={lecturerStatusFilter}
                onChange={(e) => setLecturerStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:bg-white"
              >
                <option value="">Semua Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended (Non-Aktif)</option>
              </select>

              {canManageLecturers && (
                <button
                  onClick={() => {
                    setAddLecturerModalOpen(true);
                    setMessage(null);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ml-auto md:ml-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Dosen</span>
                </button>
              )}
            </div>
          </div>

          {/* Lecturers Grid */}
          {lecturers.filter((lec) => {
            const q = lecturerSearch.toLowerCase();
            const matchesSearch =
              !q ||
              lec.name.toLowerCase().includes(q) ||
              lec.email.toLowerCase().includes(q) ||
              Boolean(lec.lecturer_profile?.nidn && lec.lecturer_profile.nidn.toLowerCase().includes(q));

            const matchesStatus = !lecturerStatusFilter || lec.status === lecturerStatusFilter;

            const matchesUniv =
              !selectedUnivForLecturers ||
              lec.default_university_id?.toString() === selectedUnivForLecturers ||
              lec.lecturer_profile?.university_id?.toString() === selectedUnivForLecturers ||
              (lec as any).role_assignments?.some(
                (ra: any) => ra.university_id?.toString() === selectedUnivForLecturers
              );

            return matchesSearch && matchesStatus && matchesUniv;
          }).length === 0 ? (
            <div className="bg-white rounded-3xl border border-borderMuted p-12 text-center text-slate-400">
              <Users2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-xs">Tidak ada data dosen yang ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturers
                .filter((lec) => {
                  const q = lecturerSearch.toLowerCase();
                  const matchesSearch =
                    !q ||
                    lec.name.toLowerCase().includes(q) ||
                    lec.email.toLowerCase().includes(q) ||
                    Boolean(lec.lecturer_profile?.nidn && lec.lecturer_profile.nidn.toLowerCase().includes(q));

                  const matchesStatus = !lecturerStatusFilter || lec.status === lecturerStatusFilter;

                  const matchesUniv =
                    !selectedUnivForLecturers ||
                    lec.default_university_id?.toString() === selectedUnivForLecturers ||
                    lec.lecturer_profile?.university_id?.toString() === selectedUnivForLecturers ||
                    (lec as any).role_assignments?.some(
                      (ra: any) => ra.university_id?.toString() === selectedUnivForLecturers
                    );

                  return matchesSearch && matchesStatus && matchesUniv;
                })
                .map((lec) => {
                  const isSuspended = lec.status === 'suspended';
                  const univName =
                    lec.lecturer_profile?.university?.name ||
                    universities.find((u) => u.id === lec.default_university_id)?.name ||
                    (lec as any).role_assignments?.[0]?.university?.name;
                  const deptName =
                    (lec.lecturer_profile as any)?.department?.name ||
                    (lec as any).role_assignments?.[0]?.department?.name;

                  return (
                    <div
                      key={lec.id}
                      className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between hover:shadow-md ${
                        isSuspended ? 'border-rose-200 bg-rose-50/20' : 'border-borderMuted'
                      }`}
                    >
                      <div>
                        {/* Card Header: Avatar, Name, Email, Status Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                lec.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  lec.name
                                )}&background=2563EB&color=fff`
                              }
                              alt={lec.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-navy truncate" title={lec.name}>
                                {lec.name}
                              </h3>
                              <div className="text-xs text-brand-600 font-semibold truncate">
                                {lec.email}
                              </div>
                            </div>
                          </div>
                          <Badge variant={isSuspended ? 'rose' : 'emerald'} size="sm">
                            {isSuspended ? 'Suspended' : 'Active'}
                          </Badge>
                        </div>

                        {/* Lecturer Details */}
                        <div className="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">NIDN:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {lec.lecturer_profile?.nidn || (lec as any).nidn || '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Jabatan:</span>
                            <span className="font-semibold text-slate-700">
                              {lec.lecturer_profile?.title || 'Dosen Pengajar'}
                            </span>
                          </div>
                          {deptName && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Jurusan / Prodi:</span>
                              <span className="font-semibold text-slate-700 truncate max-w-[160px]" title={deptName}>
                                {deptName}
                              </span>
                            </div>
                          )}
                          {univName && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Kampus:</span>
                              <span className="font-semibold text-brand-700 truncate max-w-[160px]" title={univName}>
                                {univName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions: Kirim Pesan & Admin Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to="/messages"
                          state={{ partnerId: lec.id }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors flex items-center gap-1.5"
                          title="Kirim pesan langsung ke dosen ini"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Kirim Pesan</span>
                        </Link>

                        {canManageLecturers && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleLecturerStatus(lec)}
                              title={isSuspended ? 'Aktifkan kembali dosen ini' : 'Nonaktifkan (suspend) dosen ini'}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                                isSuspended
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>{isSuspended ? 'Aktifkan' : 'Suspend'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteLecturer(lec)}
                              title="Hapus akun dosen secara permanen"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Campus Directly (Super Admin) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add & Provision New Campus"
      >
        <form onSubmit={handleCreateUniversityDirectly} className="space-y-4">
          <p className="text-xs text-slate-500">
            Create and immediately provision a new university tenant on the CampusConnect network.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official University Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Politeknik Negeri Lhokseumawe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Code (Acronym)</label>
              <input
                type="text"
                required
                placeholder="e.g. PNL"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                placeholder="info@pnl.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Portal Website</label>
            <input
              type="url"
              placeholder="https://pnl.ac.id"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              required
              placeholder="e.g. Jl. Banda Aceh-Medan Km. 280, Buketrata, Lhokseumawe, Aceh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Description</label>
            <textarea
              rows={3}
              placeholder="Politeknik negeri unggul vokasi rekayasa dan teknologi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {actionLoading ? 'Creating Campus...' : 'Create & Activate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit University (Super Admin) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Institution: ${editingUniv?.name || ''}`}
      >
        <form onSubmit={handleUpdateUniversity} className="space-y-4">
          <p className="text-xs text-slate-500">
            Update institutional records, metadata, and tenancy operational status.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official University Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Code</label>
              <input
                type="text"
                required
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tenancy Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="active">Active (Full Access)</option>
                <option value="suspended">Suspended (Access Locked)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              required
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete University Confirmation (Super Admin) */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete University Confirmation"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-bold">Are you sure you want to delete this university?</p>
              <p className="text-rose-700">
                You are about to remove <strong>{deletingUniv?.name}</strong> ({deletingUniv?.code}).
                This will soft-delete the institution from the active CampusConnect directory while safely preserving historical records and audit logs.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteUniversity}
              disabled={actionLoading}
              className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {actionLoading ? 'Deleting...' : 'Yes, Delete University'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Faculty */}
      <Modal
        isOpen={addFacultyModalOpen}
        onClose={() => setAddFacultyModalOpen(false)}
        title="Add Academic Faculty"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Faculty Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Fakultas Teknik / Jurusan Teknik Elektro & Informatika"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Faculty Code (Acronym)</label>
            <input
              type="text"
              required
              placeholder="e.g. FT / JTEI"
              value={facultyCode}
              onChange={(e) => setFacultyCode(e.target.value.toUpperCase())}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Fakultas keilmuan sains dan teknologi terapan..."
              value={facultyDesc}
              onChange={(e) => setFacultyDesc(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddFacultyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLoading ? 'Adding...' : 'Add Faculty'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Department / Prodi */}
      <Modal
        isOpen={!!addDeptModalFaculty}
        onClose={() => setAddDeptModalFaculty(null)}
        title={`Add Department / Major to ${addDeptModalFaculty?.name}`}
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Department / Study Program Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Teknik Informatika"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Department Code</label>
            <input
              type="text"
              required
              placeholder="e.g. TIF"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description & Focus</label>
            <textarea
              rows={3}
              placeholder="Program studi unggulan rekayasa perangkat lunak, sistem informasi, dan kecerdasan buatan..."
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddDeptModalFaculty(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLoading ? 'Adding...' : 'Add Department'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Faculty */}
      <Modal
        isOpen={editFacultyModalOpen}
        onClose={() => setEditFacultyModalOpen(false)}
        title={`Edit Faculty / Jurusan: ${editingFaculty?.name || ''}`}
      >
        <form onSubmit={handleUpdateFaculty} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Faculty / Jurusan Name</label>
            <input
              type="text"
              required
              value={editFacultyName}
              onChange={(e) => setEditFacultyName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Code (Acronym)</label>
            <input
              type="text"
              required
              value={editFacultyCode}
              onChange={(e) => setEditFacultyCode(e.target.value.toUpperCase())}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={editFacultyDesc}
              onChange={(e) => setEditFacultyDesc(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditFacultyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Department */}
      <Modal
        isOpen={editDeptModalOpen}
        onClose={() => setEditDeptModalOpen(false)}
        title={`Edit Department / Program Studi: ${editingDept?.name || ''}`}
      >
        <form onSubmit={handleUpdateDepartment} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Department / Prodi Name</label>
            <input
              type="text"
              required
              value={editDeptName}
              onChange={(e) => setEditDeptName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Code</label>
            <input
              type="text"
              required
              value={editDeptCode}
              onChange={(e) => setEditDeptCode(e.target.value.toUpperCase())}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={editDeptDesc}
              onChange={(e) => setEditDeptDesc(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditDeptModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Lecturer */}
      <Modal
        isOpen={addLecturerModalOpen}
        onClose={() => setAddLecturerModalOpen(false)}
        title="Daftarkan Dosen & Peneliti Baru"
      >
        <form onSubmit={handleCreateLecturerSubmit} className="space-y-4 text-xs">
          <p className="text-xs text-slate-500">
            Tambahkan akun dosen baru ke pangkalan data perguruan tinggi, lengkap dengan NIDN dan penugasan jurusan.
          </p>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              placeholder="contoh: Dr. Eng. Rahmad Hidayat, S.T., M.T."
              value={newLecName}
              onChange={(e) => setNewLecName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Email Resmi Dosen</label>
              <input
                type="email"
                required
                placeholder="contoh: rahmad@pnl.ac.id"
                value={newLecEmail}
                onChange={(e) => setNewLecEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Password Akun</label>
              <input
                type="password"
                required
                value={newLecPassword}
                onChange={(e) => setNewLecPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Nomor Induk Dosen (NIDN)</label>
              <input
                type="text"
                required
                placeholder="contoh: 0012058801"
                value={newLecNidn}
                onChange={(e) => setNewLecNidn(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Jabatan Fungsional</label>
              <input
                type="text"
                placeholder="contoh: Lektor Kepala / Dosen Peneliti"
                value={newLecTitle}
                onChange={(e) => setNewLecTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          {isSuperAdmin && (
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Pilih Kampus / Perguruan Tinggi</label>
              <select
                required
                value={newLecUnivId}
                onChange={(e) => {
                  setNewLecUnivId(e.target.value);
                  fetchFacultiesForUniv(e.target.value);
                }}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="">Pilih Universitas...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Jurusan / Program Studi</label>
            <select
              value={newLecDeptId}
              onChange={(e) => setNewLecDeptId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
            >
              <option value="">Pilih Jurusan / Departemen (Opsional)...</option>
              {faculties.flatMap((f) =>
                (f.departments || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {f.name} — {d.name} ({d.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddLecturerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creatingLecturer}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingLecturer ? 'Mendaftarkan...' : 'Simpan Data Dosen'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
