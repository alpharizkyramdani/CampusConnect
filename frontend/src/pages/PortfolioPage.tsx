import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Sparkles,
  Download,
  Plus,
  Trophy,
  CalendarCheck2,
  Users2,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  Search,
  CheckCheck,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import jsPDF from 'jspdf';

export const PortfolioPage: React.FC = () => {
  const { user, hasAnyRole } = useAuth();
  const canVerify = hasAnyRole(['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin']);

  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'my_portfolio'>('hall_of_fame');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hall of Fame State
  const [hallAchievements, setHallAchievements] = useState<any[]>([]);
  const [hallLoading, setHallLoading] = useState(false);
  const [hallSearch, setHallSearch] = useState('');
  const [hallLevel, setHallLevel] = useState('');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Add Activity Modal
  const [activityModal, setActivityModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actType, setActType] = useState('event');
  const [actRole, setActRole] = useState('');
  const [actOrganizer, setActOrganizer] = useState('');
  const [actStartDate, setActStartDate] = useState('');
  const [actEndDate, setActEndDate] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [savingAct, setSavingAct] = useState(false);

  // Add Achievement Modal
  const [achievementModal, setAchievementModal] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achLevel, setAchLevel] = useState('national');
  const [achRank, setAchRank] = useState('1st Place / Champion');
  const [achYear, setAchYear] = useState('2026');
  const [achDesc, setAchDesc] = useState('');
  const [savingAch, setSavingAch] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHallAchievements = async () => {
    setHallLoading(true);
    try {
      const res = await api.get('/achievements', {
        params: {
          search: hallSearch || undefined,
          level: hallLevel || undefined,
        },
      });
      if (res.data.success) {
        setHallAchievements(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHallLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchHallAchievements();
  }, []);

  useEffect(() => {
    if (activeTab === 'hall_of_fame') {
      fetchHallAchievements();
    }
  }, [hallLevel, activeTab]);

  const handleVerify = async (id: number) => {
    setVerifyingId(id);
    try {
      const res = await api.put(`/achievements/${id}/verify`);
      if (res.data.success) {
        fetchHallAchievements();
        fetchPortfolio();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAct(true);
    try {
      const res = await api.post('/portfolio/activity', {
        title: actTitle,
        activity_type: actType,
        role: actRole,
        organizer: actOrganizer,
        start_date: actStartDate,
        end_date: actEndDate || null,
        description: actDescription,
      });
      if (res.data.success) {
        setActivityModal(false);
        setActTitle('');
        fetchPortfolio();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAct(false);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAch(true);
    try {
      const res = await api.post('/portfolio/achievement', {
        title: achTitle,
        level: achLevel,
        rank: achRank,
        year: parseInt(achYear),
        description: achDesc,
      });
      if (res.data.success) {
        setAchievementModal(false);
        setAchTitle('');
        fetchPortfolio();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAch(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const studentName = portfolio?.user?.name || user?.name || 'Student';
    const univName = portfolio?.user?.student_profile?.university?.name || 'Universitas Indonesia Raya';
    const nim = portfolio?.user?.student_profile?.nim || 'N/A';
    const major = portfolio?.user?.student_profile?.study_program || 'Informatics Engineering';

    // Header
    doc.setFontSize(20);
    doc.setTextColor(23, 43, 77); // Navy
    doc.text('CAMPUSCONNECT OFFICIAL STUDENT PORTFOLIO', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Institution: ${univName}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

    // Profile Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 182, 25, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Full Name: ${studentName}`, 18, 48);
    doc.text(`Student ID (NIM): ${nim}`, 18, 55);
    doc.text(`Department & Program: ${major}`, 18, 62);

    let y = 75;

    // 1. Achievements
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // Brand Blue
    doc.text('1. COMPETITION ACHIEVEMENTS & AWARDS', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    if (!portfolio?.achievements || portfolio.achievements.length === 0) {
      doc.text('- No achievements recorded.', 18, y);
      y += 6;
    } else {
      portfolio.achievements.forEach((a: any) => {
        doc.text(`• [${a.level.toUpperCase()}] ${a.title} - ${a.rank} (${a.year})`, 18, y);
        y += 6;
      });
    }

    y += 6;
    // 2. Verified Certificates
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('2. VERIFIED DIGITAL ACADEMIC CERTIFICATES', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    if (!portfolio?.certificates || portfolio.certificates.length === 0) {
      doc.text('- No certificates recorded.', 18, y);
      y += 6;
    } else {
      portfolio.certificates.forEach((c: any) => {
        doc.text(`• ${c.title} (ID: ${c.certificate_number}) - Issued on ${c.issue_date}`, 18, y);
        y += 6;
      });
    }

    y += 6;
    // 3. Organization Governance
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('3. STUDENT ORGANIZATIONS & LEADERSHIP', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    if (!portfolio?.organizations || portfolio.organizations.length === 0) {
      doc.text('- No active organization memberships recorded.', 18, y);
      y += 6;
    } else {
      portfolio.organizations.forEach((o: any) => {
        doc.text(`• ${o.organization?.name} - Role: ${o.role_title} (${o.division || 'General'})`, 18, y);
        y += 6;
      });
    }

    // Save
    doc.save(`CampusConnect_Portfolio_${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-brand-600" />
            Student Achievements & Digital Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore national & international student accolades across universities, or generate your official digital CV
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setAchievementModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>+ Submit Achievement</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-borderMuted pb-3">
        <button
          onClick={() => setActiveTab('hall_of_fame')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'hall_of_fame'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Public Hall of Fame & Achievements ({hallAchievements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_portfolio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'my_portfolio'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Personal Digital Portfolio & CV</span>
        </button>
      </div>

      {/* TAB 1: PUBLIC HALL OF FAME */}
      {activeTab === 'hall_of_fame' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hallSearch}
                onChange={(e) => setHallSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchHallAchievements()}
                placeholder="Search by achievement, competition, rank..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={hallLevel}
                onChange={(e) => setHallLevel(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">All Competition Levels</option>
                <option value="international">International Level</option>
                <option value="national">National Level</option>
                <option value="regional">Regional Level</option>
                <option value="campus">Campus Level</option>
              </select>
            </div>
          </div>

          {hallLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading Hall of Fame records...</div>
          ) : hallAchievements.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No achievements found</h3>
              <p className="text-xs text-slate-500 mt-1">Submit your academic or competition awards to appear in the Hall of Fame.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hallAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white rounded-3xl border border-borderMuted overflow-hidden shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Header: Student Info */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                      <img
                        src={ach.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ach.user?.name || 'S')}&background=2563EB&color=fff`}
                        alt={ach.user?.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-navy truncate">{ach.user?.name}</div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span>{ach.user?.student_profile?.university?.code || 'Campus'} • {ach.user?.student_profile?.department?.name || 'Student'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Level & Year */}
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          ach.level === 'international' ? 'purple' : ach.level === 'national' ? 'blue' : 'amber'
                        }
                        size="sm"
                      >
                        {ach.level.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-600">{ach.year}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-navy mt-1 leading-snug">{ach.title}</h3>
                    <div className="text-xs font-bold text-amber-600 mt-1 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{ach.rank || 'Champion / Awardee'}</span>
                    </div>

                    {ach.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {ach.description}
                      </p>
                    )}
                  </div>

                  {/* Verification Status & Admin Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Badge variant={ach.is_verified ? 'emerald' : 'amber'} size="sm">
                      {ach.is_verified ? 'Verified & Endorsed' : 'Pending Verification'}
                    </Badge>

                    {canVerify && !ach.is_verified && (
                      <button
                        onClick={() => handleVerify(ach.id)}
                        disabled={verifyingId === ach.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{verifyingId === ach.id ? 'Verifying...' : 'Verify'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSONAL PORTFOLIO & CV */}
      {activeTab === 'my_portfolio' && (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-navy via-brand-950 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Curriculum Vitae & Verified Activity Portfolio
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {portfolio?.user?.name || user?.name}'s Digital Portfolio
              </h2>
              <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-xl">
                A comprehensive, verified record of your campus competitions, certificates, events attended, and organization leadership positions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={exportPDF}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Export Portfolio PDF
              </button>
              <button
                onClick={() => setAchievementModal(true)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Trophy className="w-4 h-4" />
                Add Award
              </button>
              <button
                onClick={() => setActivityModal(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>
          </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-brand-600">{portfolio?.stats?.total_achievements || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Competitions Won</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-brand-600">{portfolio?.stats?.total_certificates || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Digital Certificates</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-brand-600">{portfolio?.stats?.total_organizations || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Organizations Joined</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-2xl font-extrabold text-brand-600">{portfolio?.stats?.total_events || 0}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Events Attended</div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Competition Achievements
            </h3>
            <Badge variant="amber">{portfolio?.achievements?.length || 0} Awards</Badge>
          </div>
          <div className="space-y-3">
            {(!portfolio?.achievements || portfolio.achievements.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No achievements recorded yet.</div>
            ) : (
              portfolio.achievements.map((ach: any) => (
                <div key={ach.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-800 uppercase text-[10px]">{ach.level} Level</span>
                    <span className="font-bold text-amber-700">{ach.year}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{ach.title}</h4>
                  <div className="font-bold text-amber-600 mt-0.5">{ach.rank}</div>
                  {ach.description && <p className="text-slate-600 mt-1">{ach.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verified Certificates */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-600" />
              Verified Digital Credentials
            </h3>
            <Badge variant="blue">{portfolio?.certificates?.length || 0} Certificates</Badge>
          </div>
          <div className="space-y-3">
            {(!portfolio?.certificates || portfolio.certificates.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No certificates awarded yet.</div>
            ) : (
              portfolio.certificates.map((c: any) => (
                <div key={c.id} className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-brand-700">{c.certificate_number}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(c.issue_date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-1">Recipient: {c.recipient_name}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Organization Memberships */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <Users2 className="w-5 h-5 text-purple-600" />
              Organization Leadership & Units
            </h3>
            <Badge variant="purple">{portfolio?.organizations?.length || 0} Positions</Badge>
          </div>
          <div className="space-y-3">
            {(!portfolio?.organizations || portfolio.organizations.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No organization memberships.</div>
            ) : (
              portfolio.organizations.map((org: any) => (
                <div key={org.id} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{org.organization?.name}</h4>
                    <div className="text-[11px] text-purple-700 font-bold mt-0.5">
                      {org.role_title} • {org.division || 'General Division'}
                    </div>
                  </div>
                  <Badge variant="purple">{org.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attended Events */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
              Attended Campus Events
            </h3>
            <Badge variant="emerald">{portfolio?.events_attended?.length || 0} Checked In</Badge>
          </div>
          <div className="space-y-3">
            {(!portfolio?.events_attended || portfolio.events_attended.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400">No attended events recorded yet.</div>
            ) : (
              portfolio.events_attended.map((reg: any) => (
                <div key={reg.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{reg.event?.title}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Checked in on {new Date(reg.checked_in_at || reg.registered_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {reg.ticket_code}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Add Award Modal */}
      <Modal
        isOpen={achievementModal}
        onClose={() => setAchievementModal(false)}
        title="Record Competition Award"
      >
        <form onSubmit={handleAddAchievement} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Competition Title</label>
            <input
              type="text"
              required
              value={achTitle}
              onChange={(e) => setAchTitle(e.target.value)}
              placeholder="e.g. National Smart City Hackathon 2026"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Level</label>
              <select
                value={achLevel}
                onChange={(e) => setAchLevel(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="campus">Campus Level</option>
                <option value="regional">Regional / Provincial</option>
                <option value="national">National Level</option>
                <option value="international">International Level</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Rank / Placement</label>
              <input
                type="text"
                required
                value={achRank}
                onChange={(e) => setAchRank(e.target.value)}
                placeholder="1st Place Champion / Gold Medal"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Year</label>
            <input
              type="number"
              required
              value={achYear}
              onChange={(e) => setAchYear(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={savingAch}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {savingAch ? 'Saving...' : 'Add Award'}
          </button>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        isOpen={activityModal}
        onClose={() => setActivityModal(false)}
        title="Add Co-Curricular Activity"
      >
        <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Activity Name</label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="e.g. Lead Technical Organizer at Tech Fair"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Activity Type</label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="event">Campus Event</option>
                <option value="organization">Organization Project</option>
                <option value="volunteering">Volunteering / Community Service</option>
                <option value="competition">Competition Delegate</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Role Title</label>
              <input
                type="text"
                required
                value={actRole}
                onChange={(e) => setActRole(e.target.value)}
                placeholder="Team Leader / Developer"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Start Date</label>
              <input
                type="date"
                required
                value={actStartDate}
                onChange={(e) => setActStartDate(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Organizer</label>
              <input
                type="text"
                value={actOrganizer}
                onChange={(e) => setActOrganizer(e.target.value)}
                placeholder="BEM FT / IEEE Chapter"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingAct}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {savingAct ? 'Saving...' : 'Add Activity'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

