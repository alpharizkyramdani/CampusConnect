import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Organization, OrganizationApplication } from '../types';
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
} from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

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

  const isOrgAdmin = hasAnyRole(['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin']);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organizations', {
        params: {
          university_id: activeAssignment?.university_id,
          type: selectedType || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setOrganizations(res.data.data || []);
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

  const handleReviewApp = async (appId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await api.post(`/applications/${appId}/review`, { status });
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
            Empowering student governance, technical clubs, arts, sports, BEM cabinets, and departmental associations
          </p>
        </div>
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
          <p className="text-xs text-slate-500 mt-1">Check back later or register a new campus club.</p>
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

              <div className="p-5 flex gap-2">
                <button
                  onClick={async () => {
                    const res = await api.get(`/organizations/${org.id}`);
                    if (res.data.success) setSelectedOrg(res.data.data);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                >
                  View Profile
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
                  <button
                    onClick={() => openAppQueue(org)}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Applicants
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization Profile Modal */}
      <Modal
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title={selectedOrg?.name || 'Organization Details'}
        maxWidth="xl"
      >
        {selectedOrg && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
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

            {selectedOrg.vision && (
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Vision</span>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedOrg.vision}
                </p>
              </div>
            )}

            {selectedOrg.mission && (
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Mission</span>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedOrg.mission}
                </p>
              </div>
            )}

            {/* Leadership Board */}
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px] mb-2">Executive Officers</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedOrg.members?.slice(0, 4).map((m: any) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <img
                      src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'M')}`}
                      alt={m.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{m.user?.name}</div>
                      <div className="text-[10px] text-brand-600 font-semibold truncate">{m.role_title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
                      NIM: {app.user?.student_profile?.nim || 'Student'} • Division: <strong>{app.department_interest}</strong>
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
                  <div className="pt-2 flex gap-2 justify-end">
                    <button
                      onClick={() => handleReviewApp(app.id, 'approved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Accept Member
                    </button>
                    <button
                      onClick={() => handleReviewApp(app.id, 'rejected')}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

