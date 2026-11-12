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
} from 'lucide-react';

interface UniversityRequest {
  id: number;
  university_name: string;
  email: string;
  website?: string;
  address: string;
  contact_person: string;
  contact_phone?: string;
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export const DirectoryPage: React.FC = () => {
  const { activeRole, activeAssignment } = useAuth();
  const isSuperAdmin = activeRole === 'super_admin';

  const [tab, setTab] = useState<'universities' | 'faculties' | 'lecturers' | 'requests'>('universities');
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [requests, setRequests] = useState<UniversityRequest[]>([]);
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

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const targetFUniv = selectedUnivForFaculties || (activeAssignment?.university_id?.toString() || '1');
      const [uRes, fRes, lRes] = await Promise.all([
        api.get('/universities'),
        api.get(`/universities/${targetFUniv}/faculties`),
        api.get('/users', { params: { role: 'lecturer' } }),
      ]);

      if (uRes.data.success) {
        setUniversities(uRes.data.data || []);
        if (!selectedUnivForFaculties && uRes.data.data?.length > 0) {
          setSelectedUnivForFaculties(uRes.data.data[0].id.toString());
        }
      }
      if (fRes.data.success) setFaculties(fRes.data.data || []);
      if (lRes.data.success) setLecturers(lRes.data.data.data || lRes.data.data || []);

      if (isSuperAdmin) {
        const reqRes = await api.get('/university-requests');
        if (reqRes.data.success) setRequests(reqRes.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchData();
  }, [activeAssignment, isSuperAdmin]);

  const handleApproveRequest = async (id: number) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/university-requests/${id}/approve`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'University approved and activated successfully!' });
        await fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to approve request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (id: number) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post(`/university-requests/${id}/reject`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'University request marked as rejected.' });
        await fetchData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject request.' });
    } finally {
      setActionLoading(false);
    }
  };

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
            Campus Directory & Institutions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore participating universities, academic faculties, departments, and public faculty profiles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin && (
            <button
              onClick={() => { setAddModalOpen(true); setMessage(null); }}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Campus Directly
            </button>
          )}

          <Link
            to="/register-university"
            className="px-4 py-2.5 bg-white text-navy border border-borderMuted hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-brand-600" />
            Register New Institution
          </Link>
        </div>
      </div>

      {/* Global Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-borderMuted pb-3">
        <button
          onClick={() => setTab('universities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'universities'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Universities ({universities.length})
        </button>

        <button
          onClick={() => setTab('faculties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'faculties'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Faculties & Departments ({faculties.length})
        </button>

        <button
          onClick={() => setTab('lecturers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'lecturers'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lecturers & Researchers ({lecturers.length})
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'requests'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Onboarding Requests ({requests.filter((r) => r.status === 'pending').length} Pending)</span>
          </button>
        )}
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
          {/* Controls: Campus Selector & Add Faculty */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Campus:</label>
              <select
                value={selectedUnivForFaculties}
                onChange={(e) => {
                  setSelectedUnivForFaculties(e.target.value);
                  fetchFacultiesForUniv(e.target.value);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setAddFacultyModalOpen(true)}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Faculty</span>
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
                    <Badge variant="blue">{f.departments?.length || 0} Departments</Badge>
                  </div>

                  {isSuperAdmin && (
                    <button
                      onClick={() => setAddDeptModalFaculty(f)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                      <span>+ Add Department</span>
                    </button>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-navy">{f.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{f.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(!f.departments || f.departments.length === 0) ? (
                    <div className="text-xs text-slate-400 col-span-3 py-2 italic">
                      No departments/majors yet. Click '+ Add Department' above to register one.
                    </div>
                  ) : (
                    f.departments.map((d) => (
                      <div key={d.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                        <span className="font-mono text-[10px] text-brand-600 font-bold block">{d.code}</span>
                        <h4 className="font-bold text-slate-900 mt-0.5">{d.name}</h4>
                        <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{d.description || 'Program Studi & Himpunan Mahasiswa'}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lecturers.map((lec) => (
            <div key={lec.id} className="bg-white rounded-3xl border border-borderMuted p-6 shadow-xs flex items-start gap-4">
              <img
                src={lec.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lec.name)}&background=2563EB&color=fff`}
                alt={lec.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
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

      {/* Tab 4: Onboarding Requests (Super Admin Only) */}
      {isSuperAdmin && tab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-borderMuted p-6 shadow-xs">
            <h2 className="text-base font-bold text-navy mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              University Onboarding & Verification Queue
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Review institutional registration submissions and approve them to grant live multi-tenant access
            </p>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  No university registration requests found.
                </div>
              ) : (
                requests.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-navy">{r.university_name}</span>
                        <Badge
                          variant={r.status === 'approved' ? 'emerald' : r.status === 'rejected' ? 'rose' : 'amber'}
                          size="sm"
                        >
                          {r.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Users2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Contact: {r.contact_person} ({r.contact_phone || 'N/A'})</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.address}</span>
                        </div>
                        {r.website && (
                          <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <a href={r.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                              {r.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(r.id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Activate
                          </button>
                          <button
                            onClick={() => handleRejectRequest(r.id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Live on CampusConnect
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
    </div>
  );
};
