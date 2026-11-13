import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Organization, OrganizationApplication, University } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Users2,
  Search,
  Plus,
  ExternalLink,
  Target,
  Sparkles,
  Award,
  CheckCircle2,
  BookOpen,
  UserPlus,
  Shield,
  Trash2,
  Building2,
  Upload,
  Image as ImageIcon,
  Pencil,
  Camera,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

const PRESET_LOGOS = [
  { label: 'HIMA Informatika / Komputer', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80' },
  { label: 'UKM Robotika & IoT', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&auto=format&fit=crop&q=80' },
  { label: 'BEM / Eksekutif Mahasiswa', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&auto=format&fit=crop&q=80' },
  { label: 'UKM Seni & Musik', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80' },
  { label: 'UKM Olahraga & Atletik', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80' },
  { label: 'UKM Penalaran & Debat', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80' },
];

export const OrganizationsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Add Organization Modal (Campus Admin & Super Admin)
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<Organization['type']>('ukm');
  const [newOrgCategory, setNewOrgCategory] = useState('Technology & Robotics');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [newOrgVision, setNewOrgVision] = useState('');
  const [newOrgMission, setNewOrgMission] = useState('');
  const [newOrgLogo, setNewOrgLogo] = useState('');
  const [newOrgUnivId, setNewOrgUnivId] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Edit Organization Modal
  const [editOrgModalOpen, setEditOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgType, setEditOrgType] = useState<Organization['type']>('ukm');
  const [editOrgCategory, setEditOrgCategory] = useState('');
  const [editOrgDescription, setEditOrgDescription] = useState('');
  const [editOrgVision, setEditOrgVision] = useState('');
  const [editOrgMission, setEditOrgMission] = useState('');
  const [editOrgLogo, setEditOrgLogo] = useState('');
  const [editOrgRecruitment, setEditOrgRecruitment] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Appoint Member Modal
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [appointUserId, setAppointUserId] = useState('');
  const [appointRoleTitle, setAppointRoleTitle] = useState('Ketua Umum');
  const [appointDivision, setAppointDivision] = useState('BPH / Pengurus Inti');
  const [appointing, setAppointing] = useState(false);

  // Apply Modal
  const [applyModalOrg, setApplyModalOrg] = useState<Organization | null>(null);
  const [motivation, setMotivation] = useState('');
  const [divisionInterest, setDivisionInterest] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applying, setApplying] = useState(false);

  // Applications Queue Modal (for Org Admin)
  const [appQueueOrg, setAppQueueOrg] = useState<Organization | null>(null);
  const [applications, setApplications] = useState<OrganizationApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [reviewRoleTitle, setReviewRoleTitle] = useState('Anggota Departemen');
  const [reviewDivision, setReviewDivision] = useState('');

  // Org Detail Sub-Tabs (Profile, Proker, Finances)
  const [orgTab, setOrgTab] = useState<'profile' | 'proker' | 'finances'>('profile');
  const [prokerList, setProkerList] = useState<any[]>([]);
  const [loadingProker, setLoadingProker] = useState(false);
  const [newProkerTitle, setNewProkerTitle] = useState('');
  const [newProkerDesc, setNewProkerDesc] = useState('');
  const [newProkerPeriod, setNewProkerPeriod] = useState('2026/2027');
  const [newProkerOutput, setNewProkerOutput] = useState('');
  const [savingProker, setSavingProker] = useState(false);

  // Finances Sub-Tab State
  const [financesData, setFinancesData] = useState<{
    summary: { total_income: number; total_expense: number; current_balance: number };
    transactions: any[];
  } | null>(null);
  const [loadingFinances, setLoadingFinances] = useState(false);
  const [finType, setFinType] = useState<'income' | 'expense'>('income');
  const [finTitle, setFinTitle] = useState('');
  const [finAmount, setFinAmount] = useState('');
  const [finCategory, setFinCategory] = useState('Iuran Anggota');
  const [finDate, setFinDate] = useState(new Date().toISOString().split('T')[0]);
  const [finNotes, setFinNotes] = useState('');
  const [savingFin, setSavingFin] = useState(false);

  const fetchProker = async (orgId: number) => {
    setLoadingProker(true);
    try {
      const res = await api.get(`/organizations/${orgId}/work-programs`);
      if (res.data.success) {
        setProkerList(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProker(false);
    }
  };

  const fetchFinances = async (orgId: number) => {
    setLoadingFinances(true);
    try {
      const res = await api.get(`/organizations/${orgId}/finances`);
      if (res.data.success) {
        setFinancesData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFinances(false);
    }
  };

  const handleAddProker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !newProkerTitle.trim()) return;

    setSavingProker(true);
    try {
      const res = await api.post(`/organizations/${selectedOrg.id}/work-programs`, {
        name: newProkerTitle.trim(),
        description: newProkerDesc.trim(),
        period: newProkerPeriod,
        target_output: newProkerOutput.trim(),
        status: 'planned',
      });
      if (res.data.success) {
        setNewProkerTitle('');
        setNewProkerDesc('');
        setNewProkerOutput('');
        fetchProker(selectedOrg.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan program kerja');
    } finally {
      setSavingProker(false);
    }
  };

  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !finTitle.trim() || !finAmount) return;

    setSavingFin(true);
    try {
      const res = await api.post(`/organizations/${selectedOrg.id}/finances`, {
        type: finType,
        title: finTitle.trim(),
        amount: parseFloat(finAmount),
        category: finCategory,
        transaction_date: finDate,
        notes: finNotes.trim(),
      });
      if (res.data.success) {
        setFinTitle('');
        setFinAmount('');
        setFinNotes('');
        fetchFinances(selectedOrg.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mencatat transaksi kas');
    } finally {
      setSavingFin(false);
    }
  };

  const isSuperAdmin = hasAnyRole(['super_admin']);
  const canCreateOrg = hasAnyRole(['super_admin', 'campus_admin']);
  const isOrgAdmin = hasAnyRole(['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin']);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const [orgRes, univRes, uRes] = await Promise.all([
        api.get('/organizations', {
          params: {
            university_id: activeAssignment?.university_id,
            type: selectedType || undefined,
            search: search || undefined,
          },
        }),
        api.get('/universities'),
        api.get('/users', { params: { university_id: activeAssignment?.university_id } }),
      ]);

      if (orgRes.data.success) {
        setOrganizations(orgRes.data.data || []);
      }
      if (univRes.data.success) {
        setUniversities(univRes.data.data || []);
        if (!newOrgUnivId && univRes.data.data?.length > 0) {
          newOrgUnivId || setNewOrgUnivId(activeAssignment?.university_id?.toString() || univRes.data.data[0].id.toString());
        }
      }
      if (uRes.data.success) {
        setAvailableUsers(uRes.data.data.data || uRes.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [selectedType, activeAssignment]);

  const handleUploadImageFile = async (file: File, target: 'create' | 'edit') => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.url) {
        if (target === 'create') {
          setNewOrgLogo(res.data.url);
        } else {
          setEditOrgLogo(res.data.url);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload logo image');
    } finally {
      setUploadingLogo(false);
    }
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setEditOrgName(org.name);
    setEditOrgType(org.type);
    setEditOrgCategory(org.category || '');
    setEditOrgDescription(org.description || '');
    setEditOrgVision(org.vision || '');
    setEditOrgMission(org.mission || '');
    setEditOrgLogo(org.logo || '');
    setEditOrgRecruitment(!!org.recruitment_open);
    setEditOrgModalOpen(true);
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setSavingEdit(true);
    try {
      const res = await api.put(`/organizations/${editingOrg.id}`, {
        name: editOrgName,
        type: editOrgType,
        category: editOrgCategory,
        description: editOrgDescription,
        vision: editOrgVision || null,
        mission: editOrgMission || null,
        logo: editOrgLogo || null,
        recruitment_open: editOrgRecruitment,
      });

      if (res.data.success) {
        alert('Organization updated successfully!');
        setEditOrgModalOpen(false);
        setEditingOrg(null);
        if (selectedOrg && selectedOrg.id === editingOrg.id) {
          setSelectedOrg(res.data.data);
        }
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    if (!window.confirm(`Are you sure you want to delete organization "${org.name}"? This action cannot be undone.`)) return;
    try {
      const res = await api.delete(`/organizations/${org.id}`);
      if (res.data.success) {
        alert('Organization deleted successfully.');
        if (selectedOrg?.id === org.id) setSelectedOrg(null);
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrg(true);
    try {
      const targetUniv = isSuperAdmin
        ? (newOrgUnivId ? parseInt(newOrgUnivId) : (activeAssignment?.university_id || 1))
        : (activeAssignment?.university_id || 1);

      const res = await api.post('/organizations', {
        university_id: targetUniv,
        name: newOrgName,
        type: newOrgType,
        category: newOrgCategory,
        description: newOrgDescription,
        vision: newOrgVision || null,
        mission: newOrgMission || null,
        logo: newOrgLogo || null,
        recruitment_open: true,
      });

      if (res.data.success) {
        alert(`Organization "${newOrgName}" created successfully!`);
        setCreateOrgModalOpen(false);
        setNewOrgName('');
        setNewOrgDescription('');
        setNewOrgVision('');
        setNewOrgMission('');
        setNewOrgLogo('');
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleAppointMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !appointUserId) return;
    setAppointing(true);

    try {
      const res = await api.post(`/organizations/${selectedOrg.id}/members`, {
        user_id: parseInt(appointUserId),
        role_title: appointRoleTitle,
        division: appointDivision,
      });

      if (res.data.success) {
        alert(`Member assigned as ${appointRoleTitle} successfully!`);
        setAppointModalOpen(false);
        // Refresh selectedOrg details
        const refreshed = await api.get(`/organizations/${selectedOrg.id}`);
        if (refreshed.data.success) setSelectedOrg(refreshed.data.data);
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign leadership role');
    } finally {
      setAppointing(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedOrg || !window.confirm('Are you sure you want to remove this member from the organization?')) return;
    try {
      const res = await api.delete(`/organizations/${selectedOrg.id}/members/${memberId}`);
      if (res.data.success) {
        const refreshed = await api.get(`/organizations/${selectedOrg.id}`);
        if (refreshed.data.success) setSelectedOrg(refreshed.data.data);
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalOrg) return;
    setApplying(true);

    try {
      const res = await api.post(`/organizations/${applyModalOrg.id}/apply`, {
        motivation,
        department_interest: divisionInterest,
      });

      if (res.data.success) {
        setApplySuccess(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Application submission failed');
    } finally {
      setApplying(false);
    }
  };

  const openAppQueue = async (org: Organization) => {
    setAppQueueOrg(org);
    setAppsLoading(true);
    try {
      const res = await api.get(`/organizations/${org.id}/applications`);
      if (res.data.success) {
        setApplications(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleReviewApp = async (appId: number, status: 'approved' | 'rejected', customRole?: string, customDiv?: string) => {
    try {
      const res = await api.post(`/applications/${appId}/review`, {
        status,
        role_title: customRole || reviewRoleTitle,
        division: customDiv || reviewDivision || undefined,
      });
      if (res.data.success) {
        if (appQueueOrg) openAppQueue(appQueueOrg);
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review action failed');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Users2 className="w-6 h-6 text-brand-600" />
            Student Organizations Hub (UKM & Ormawa)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empowering student governance, UKM clubs, BEM cabinets, departmental associations (HIMA), and leadership boards
          </p>
        </div>

        {canCreateOrg && (
          <button
            onClick={() => setCreateOrgModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Organization / UKM</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {['', 'ukm', 'bem', 'hima', 'dpm'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedType === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === '' ? 'All Organizations' : t}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrganizations()}
            placeholder="Search organizations..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No registered organizations found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or create a new student organization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-6 pb-4 flex items-start gap-4">
                  <img
                    src={org.logo || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80'}
                    alt={org.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-navy text-white uppercase">
                        {org.type}
                      </span>
                      {org.recruitment_open && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Recruitment Open
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-navy line-clamp-1">{org.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{org.description}</p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span><strong>{org.members_count || 1}</strong> Active Members</span>
                  <span><strong>{org.events_count || 1}</strong> Events Held</span>
                </div>
              </div>

              <div className="p-5 flex gap-2 items-center">
                <button
                  onClick={async () => {
                    const res = await api.get(`/organizations/${org.id}`);
                    if (res.data.success) setSelectedOrg(res.data.data);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                >
                  View Profile & Board
                </button>

                {org.recruitment_open && (
                  <button
                    onClick={() => {
                      setApplyModalOrg(org);
                      setApplySuccess(false);
                      setMotivation('');
                      setDivisionInterest('');
                    }}
                    className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    Join / Apply
                  </button>
                )}

                {isOrgAdmin && (
                  <>
                    <button
                      onClick={() => openAppQueue(org)}
                      className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs transition-colors"
                      title="Applicants"
                    >
                      Applicants
                    </button>
                    <button
                      onClick={() => openEditModal(org)}
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit Logo / Info"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                )}

                {canCreateOrg && (
                  <button
                    onClick={() => handleDeleteOrganization(org)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Organization"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Organization (Campus Admin & Super Admin) */}
      <Modal
        isOpen={createOrgModalOpen}
        onClose={() => setCreateOrgModalOpen(false)}
        title="Establish New Student Organization / UKM / Ormawa"
      >
        <form onSubmit={handleCreateOrganization} className="space-y-4 text-xs">
          <p className="text-xs text-slate-500">
            Form an official student organization, UKM club, BEM council, or departmental association on the campus network.
          </p>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Organization Name</label>
            <input
              type="text"
              required
              placeholder="e.g. UKM Robotika & Inovasi Teknologi PNL"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Organization Type</label>
              <select
                value={newOrgType}
                onChange={(e) => setNewOrgType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="ukm">UKM (Unit Kegiatan Mahasiswa)</option>
                <option value="bem">BEM (Badan Eksekutif Mahasiswa)</option>
                <option value="hima">HIMA (Himpunan Mahasiswa Jurusan)</option>
                <option value="dpm">DPM (Dewan Perwakilan Mahasiswa)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Category</label>
              <input
                type="text"
                required
                placeholder="e.g. Technology, Arts, Sports, Academic"
                value={newOrgCategory}
                onChange={(e) => setNewOrgCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          {isSuperAdmin && (
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">University Tenant</label>
              <select
                value={newOrgUnivId}
                onChange={(e) => setNewOrgUnivId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Summary & Description</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the organization's charter, focus, and core activities..."
              value={newOrgDescription}
              onChange={(e) => setNewOrgDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Vision (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Menjadi pelopor inovasi teknologi robotika nasional..."
                value={newOrgVision}
                onChange={(e) => setNewOrgVision(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Mission (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Mengembangkan riset aplikatif dan kejuaraan tingkat dunia..."
                value={newOrgMission}
                onChange={(e) => setNewOrgMission(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          {/* Logo Upload & Selector */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-700 block uppercase text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                Logo Organisasi / HIMA / UKM
              </span>
              {uploadingLogo && <span className="text-[10px] text-brand-600 animate-pulse font-normal">Mengunggah logo...</span>}
            </label>

            <div className="flex items-center gap-3">
              <img
                src={newOrgLogo || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80'}
                alt="Logo Preview"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white shadow-xs"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-brand-200">
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadImageFile(e.target.files[0], 'create')}
                    />
                  </label>
                  {newOrgLogo && (
                    <button
                      type="button"
                      onClick={() => setNewOrgLogo('')}
                      className="text-[11px] text-slate-400 hover:text-rose-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Atau tempel tautan/URL gambar logo..."
                  value={newOrgLogo}
                  onChange={(e) => setNewOrgLogo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase">Pilihan Preset Logo Cepat:</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOGOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setNewOrgLogo(p.url)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingOrg}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingOrg ? 'Creating...' : 'Create Organization'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Organization Profile & Leadership Structure Modal */}
      <Modal
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title={selectedOrg?.name || 'Organization Details'}
        maxWidth="2xl"
      >
        {selectedOrg && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOrg.logo || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedOrg.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-navy text-white uppercase">
                    {selectedOrg.type} • {selectedOrg.category || 'Special Interest'}
                  </span>
                  <h3 className="text-base font-bold text-navy mt-1">{selectedOrg.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedOrg.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOrgAdmin && (
                  <button
                    onClick={() => openEditModal(selectedOrg)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Info & Logo</span>
                  </button>
                )}
                {isOrgAdmin && orgTab === 'profile' && (
                  <button
                    onClick={() => {
                      setAppointModalOpen(true);
                      if (availableUsers.length > 0 && !appointUserId) {
                        setAppointUserId(availableUsers[0].id.toString());
                      }
                    }}
                    className="px-3.5 py-2 bg-brand-600 text-white hover:bg-brand-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Angkat Pengurus</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setOrgTab('profile')}
                className={`pb-2.5 transition-all relative ${
                  orgTab === 'profile'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Profil & Pengurus
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrgTab('proker');
                  fetchProker(selectedOrg.id);
                }}
                className={`pb-2.5 transition-all relative flex items-center gap-1.5 ${
                  orgTab === 'proker'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Program Kerja (Proker)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrgTab('finances');
                  fetchFinances(selectedOrg.id);
                }}
                className={`pb-2.5 transition-all relative flex items-center gap-1.5 ${
                  orgTab === 'finances'
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Laporan Keuangan & Kas</span>
              </button>
            </div>

            {/* Tab 1: Profile & Members */}
            {orgTab === 'profile' && (
              <div className="space-y-4">
                {selectedOrg.vision && (
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Visi</span>
                    <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {selectedOrg.vision}
                    </p>
                  </div>
                )}

                {selectedOrg.mission && (
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Misi</span>
                    <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {selectedOrg.mission}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Struktur Pengurus & Anggota ({selectedOrg.members?.length || 0})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Termasuk BPH (Ketua, Sekretaris, Bendahara) & Staf Divisi
                    </span>
                  </div>

                  {(!selectedOrg.members || selectedOrg.members.length === 0) ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                      Belum ada anggota atau pengurus yang terdaftar.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {selectedOrg.members.map((m: any) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'M')}&background=2563EB&color=fff`}
                              alt={m.user?.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{m.user?.name}</div>
                              <div className="text-[11px] font-semibold text-brand-600 truncate">{m.role_title}</div>
                              <div className="text-[10px] text-slate-400 truncate">{m.division || 'BPH Inti'}</div>
                            </div>
                          </div>

                          {isOrgAdmin && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              title="Hapus dari kepengurusan"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Program Kerja (Proker) */}
            {orgTab === 'proker' && (
              <div className="space-y-4">
                {isOrgAdmin && (
                  <form onSubmit={handleAddProker} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-navy flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-brand-600" />
                      Tambah Program Kerja Baru
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Program Kerja..."
                        value={newProkerTitle}
                        onChange={(e) => setNewProkerTitle(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Periode (e.g. 2026/2027 Semester Ganjil)"
                        value={newProkerPeriod}
                        onChange={(e) => setNewProkerPeriod(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Deskripsi kegiatan & sasaran..."
                      value={newProkerDesc}
                      onChange={(e) => setNewProkerDesc(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Target Output (e.g. 150 Peserta Mahasiswa)"
                        value={newProkerOutput}
                        onChange={(e) => setNewProkerOutput(e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-xl bg-white text-xs"
                      />
                      <button
                        type="submit"
                        disabled={savingProker || !newProkerTitle.trim()}
                        className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 disabled:opacity-50"
                      >
                        {savingProker ? 'Menyimpan...' : '+ Tambah Proker'}
                      </button>
                    </div>
                  </form>
                )}

                {loadingProker ? (
                  <div className="text-center py-6 text-slate-400">Memuat daftar program kerja...</div>
                ) : prokerList.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                    Belum ada program kerja yang tercatat.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {prokerList.map((pk) => (
                      <div key={pk.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs">{pk.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pk.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : pk.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {pk.status}
                          </span>
                        </div>
                        {pk.description && <p className="text-slate-600 text-[11px] leading-relaxed">{pk.description}</p>}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                          <span>Periode: {pk.period}</span>
                          {pk.target_output && <span>Target: {pk.target_output}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Finances */}
            {orgTab === 'finances' && (
              <div className="space-y-4">
                {/* Summary Cards */}
                {financesData && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Pemasukan
                      </div>
                      <div className="text-sm font-extrabold text-emerald-900 mt-1">
                        Rp {Number(financesData.summary.total_income || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                      <div className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Pengeluaran
                      </div>
                      <div className="text-sm font-extrabold text-rose-900 mt-1">
                        Rp {Number(financesData.summary.total_expense || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                      <div className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Saldo Kas
                      </div>
                      <div className="text-sm font-extrabold text-blue-900 mt-1">
                        Rp {Number(financesData.summary.current_balance || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Record New Transaction (Admin only) */}
                {isOrgAdmin && (
                  <form onSubmit={handleAddFinance} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="font-bold text-navy flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-brand-600" />
                      Catat Pemasukan / Pengeluaran Kas
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={finType}
                        onChange={(e: any) => setFinType(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold"
                      >
                        <option value="income">🟢 Pemasukan (+)</option>
                        <option value="expense">🔴 Pengeluaran (-)</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Keterangan / Judul Transaksi..."
                        value={finTitle}
                        onChange={(e) => setFinTitle(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Nominal (Rp)..."
                        value={finAmount}
                        onChange={(e) => setFinAmount(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Kategori (e.g. Kas Anggota, Sponsorship, Konsumsi)"
                        value={finCategory}
                        onChange={(e) => setFinCategory(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs"
                      />
                      <input
                        type="date"
                        value={finDate}
                        onChange={(e) => setFinDate(e.target.value)}
                        className="p-2 border border-slate-200 rounded-xl bg-white text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingFin || !finTitle.trim() || !finAmount}
                        className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 disabled:opacity-50"
                      >
                        {savingFin ? 'Mencatat...' : 'Simpan Transaksi Kas'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Transactions Table */}
                {loadingFinances ? (
                  <div className="text-center py-6 text-slate-400">Memuat catatan kas...</div>
                ) : !financesData || financesData.transactions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                    Belum ada riwayat transaksi kas untuk organisasi ini.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5">Uraian</th>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {financesData.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono text-[11px] text-slate-500">{tx.transaction_date}</td>
                            <td className="p-2.5 font-medium text-slate-800">{tx.title}</td>
                            <td className="p-2.5 text-slate-500 text-[11px]">{tx.category}</td>
                            <td className={`p-2.5 text-right font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Appoint / Add Member (Leadership Roles & Departments) */}
      <Modal
        isOpen={appointModalOpen}
        onClose={() => setAppointModalOpen(false)}
        title={`Appoint Official: ${selectedOrg?.name}`}
      >
        <form onSubmit={handleAppointMember} className="space-y-4 text-xs">
          <p className="text-xs text-slate-500">
            Assign students to executive board positions (Ketua Umum, Sekretaris Umum, Bendahara Umum) or specific departmental divisions.
          </p>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Select Student / Member</label>
            <select
              required
              value={appointUserId}
              onChange={(e) => setAppointUserId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
            >
              <option value="">Choose Student Account...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Official Position / Role</label>
              <select
                value={appointRoleTitle}
                onChange={(e) => setAppointRoleTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="Ketua Umum">Ketua Umum (President)</option>
                <option value="Wakil Ketua Umum">Wakil Ketua Umum (Vice President)</option>
                <option value="Sekretaris Umum">Sekretaris Umum (Secretary General)</option>
                <option value="Bendahara Umum">Bendahara Umum (Treasurer)</option>
                <option value="Kepala Departemen">Kepala Departemen / Koordinator</option>
                <option value="Staff Departemen">Staff Departemen</option>
                <option value="Anggota Aktif">Anggota Aktif</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Division / Departemen</label>
              <input
                type="text"
                required
                value={appointDivision}
                onChange={(e) => setAppointDivision(e.target.value)}
                placeholder="e.g. BPH / Pengurus Inti, Litbang, Kominfo"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAppointModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={appointing}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{appointing ? 'Assigning...' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Modal */}
      <Modal
        isOpen={!!applyModalOrg}
        onClose={() => setApplyModalOrg(null)}
        title={applySuccess ? 'Application Received' : `Apply for Membership: ${applyModalOrg?.name}`}
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Application Submitted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              The recruitment board for {applyModalOrg?.name} will review your application. Check your dashboard for interview schedules and admission decisions.
            </p>
            <button
              onClick={() => setApplyModalOrg(null)}
              className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Division or Committee of Interest</label>
              <input
                type="text"
                required
                value={divisionInterest}
                onChange={(e) => setDivisionInterest(e.target.value)}
                placeholder="e.g. Media & Public Relations, Software Team, Event Logistics"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Motivation & Previous Experience</label>
              <textarea
                required
                rows={4}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Explain why you wish to join this organization and how you plan to contribute..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </Modal>

      {/* Admin Review Applications Queue */}
      <Modal
        isOpen={!!appQueueOrg}
        onClose={() => setAppQueueOrg(null)}
        title={`Membership Applications: ${appQueueOrg?.name}`}
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          {appsLoading ? (
            <div className="text-center py-6 text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-6 text-slate-400">No student applications submitted yet.</div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{app.user?.name}</div>
                    <div className="text-[11px] text-slate-500">
                      NIM: {app.user?.student_profile?.nim || 'Student'} • Division Requested: <strong>{app.department_interest}</strong>
                    </div>
                  </div>
                  <Badge variant={app.status === 'approved' ? 'emerald' : app.status === 'rejected' ? 'rose' : 'amber'}>
                    {app.status}
                  </Badge>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 leading-relaxed">
                  {app.motivation}
                </div>
                {app.status === 'pending' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => setReviewRoleTitle(e.target.value)}
                        className="p-1.5 border border-slate-200 rounded-lg text-[11px] bg-white font-medium"
                      >
                        <option value="Anggota Departemen">Anggota Departemen</option>
                        <option value="Staff Departemen">Staff Departemen</option>
                        <option value="Sekretaris Divisi">Sekretaris Divisi</option>
                        <option value="Bendahara Divisi">Bendahara Divisi</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewApp(app.id, 'approved', reviewRoleTitle, app.department_interest || 'General')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                      >
                        Accept & Approve Member
                      </button>
                      <button
                        onClick={() => handleReviewApp(app.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Modal: Edit Organization / HIMA / UKM */}
      <Modal
        isOpen={editOrgModalOpen}
        onClose={() => setEditOrgModalOpen(false)}
        title={`Edit Organization: ${editingOrg?.name || ''}`}
      >
        <form onSubmit={handleUpdateOrganization} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Organization Name</label>
            <input
              type="text"
              required
              value={editOrgName}
              onChange={(e) => setEditOrgName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Organization Type</label>
              <select
                value={editOrgType}
                onChange={(e) => setEditOrgType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="ukm">UKM (Unit Kegiatan Mahasiswa)</option>
                <option value="bem">BEM (Badan Eksekutif Mahasiswa)</option>
                <option value="hima">HIMA (Himpunan Mahasiswa Jurusan)</option>
                <option value="dpm">DPM (Dewan Perwakilan Mahasiswa)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Category</label>
              <input
                type="text"
                required
                value={editOrgCategory}
                onChange={(e) => setEditOrgCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          {/* Logo Edit Section */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-700 block uppercase text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                Logo Organisasi / HIMA / UKM
              </span>
              {uploadingLogo && <span className="text-[10px] text-brand-600 animate-pulse font-normal">Mengunggah logo...</span>}
            </label>

            <div className="flex items-center gap-3">
              <img
                src={editOrgLogo || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80'}
                alt="Logo Preview"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white shadow-xs"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-brand-200">
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadImageFile(e.target.files[0], 'edit')}
                    />
                  </label>
                  {editOrgLogo && (
                    <button
                      type="button"
                      onClick={() => setEditOrgLogo('')}
                      className="text-[11px] text-slate-400 hover:text-rose-600"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Atau tautan URL gambar..."
                  value={editOrgLogo}
                  onChange={(e) => setEditOrgLogo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase">Pilihan Preset Logo Cepat:</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOGOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setEditOrgLogo(p.url)}
                    className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Summary & Description</label>
            <textarea
              required
              rows={3}
              value={editOrgDescription}
              onChange={(e) => setEditOrgDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Vision</label>
              <textarea
                rows={2}
                value={editOrgVision}
                onChange={(e) => setEditOrgVision(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Mission</label>
              <textarea
                rows={2}
                value={editOrgMission}
                onChange={(e) => setEditOrgMission(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editOrgRecruitment"
              checked={editOrgRecruitment}
              onChange={(e) => setEditOrgRecruitment(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="editOrgRecruitment" className="font-semibold text-slate-700 cursor-pointer">
              Buka Pendaftaran Anggota Baru (Open Recruitment)
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Pencil className="w-4 h-4" />
              <span>{savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

