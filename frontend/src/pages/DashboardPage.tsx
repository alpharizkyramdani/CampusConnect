import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  GraduationCap,
  Building2,
  CalendarCheck2,
  PackageCheck,
  Wrench,
  Users2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CheckCircle,
  XCircle,
  QrCode,
  Sparkles,
  History,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Activity, Compass, Layers, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, activeRole, activeAssignment } = useAuth();
  const location = useLocation();
  const isAnalytics = location.pathname.includes('analytics');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal for ticket QR preview
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard', {
        params: {
          role: activeRole,
          university_id: activeAssignment?.university_id,
          department_id: activeAssignment?.department_id,
          organization_id: activeAssignment?.organization_id,
        },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeRole, activeAssignment]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // 1. SUPER ADMIN: ANALYTICS VIEW
  if (activeRole === 'super_admin' && isAnalytics) {
    const stats = data?.stats || {};
    const campusBreakdown = data?.campus_breakdown || [];
    const roleDistribution = data?.role_distribution || [];

    return (
      <div className="space-y-8 font-sans">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-widest">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Platform Strategic Intelligence & Analytics
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cross-Campus Network Analytics
          </h1>
          <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
            In-depth multi-university telemetry, organizational density, user demographic distribution, and activity benchmarking across all connected campuses.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Participating Campuses" value={stats.total_universities || 0} icon={Building2} color="blue" />
          <StatCard title="Total Network Users" value={stats.total_users || 0} icon={Users2} color="indigo" />
          <StatCard title="Campus Events" value={stats.total_events || 0} icon={CalendarCheck2} color="purple" />
          <StatCard title="Active Borrowings" value={stats.total_borrowings || 0} icon={PackageCheck} color="rose" />
          <StatCard title="Approved Campuses" value={stats.active_universities || 0} icon={CheckCircle} color="emerald" />
          <StatCard title="Registration Pipeline" value={stats.pending_requests || 0} icon={Clock} color="amber" />
        </div>

        {/* Analytical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Cross-Campus Activity Comparison */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-600" />
                  Cross-Campus Resource Comparison
                </h3>
                <p className="text-xs text-slate-500">Distribution of users, events, and student clubs by campus</p>
              </div>
              <Badge variant="blue">Real-time Telemetry</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campusBreakdown.length > 0 ? campusBreakdown : [{ name: 'PNL', users_count: 2, events_count: 1, organizations_count: 1 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users_count" name="Users" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="events_count" name="Events" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="organizations_count" name="Clubs & Ormawa" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: User Growth Trend */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Platform Adoption & User Trajectory
                </h3>
                <p className="text-xs text-slate-500">Monthly cumulative platform user volume</p>
              </div>
              <Badge variant="emerald">Growth Rate</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.user_growth || [{ month: 'Nov 2026', count: stats.total_users || 5 }]}>
                  <defs>
                    <linearGradient id="analyticsUserColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#analyticsUserColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Demographic & Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Demographics */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-purple-600" />
              Role & Access Demographics
            </h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown of assigned platform responsibilities</p>

            <div className="space-y-3">
              {roleDistribution.map((r: any) => {
                const total = stats.total_users || 1;
                const pct = Math.min(100, Math.round((r.count / total) * 100));
                return (
                  <div key={r.slug} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{r.name}</span>
                      <span className="text-slate-500 font-mono">{r.count} users ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time System Telemetry Feed */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-600" />
                  Live Platform Telemetry Feed
                </h3>
                <p className="text-xs text-slate-500">Chronological security and administrative action logs</p>
              </div>
              <Link to="/audit-logs" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View Full Audit Log
              </Link>
            </div>

            <div className="space-y-2.5">
              {(!data?.recent_activities || data.recent_activities.length === 0) ? (
                <div className="text-xs text-slate-400 py-6 text-center">No recent telemetry events recorded.</div>
              ) : (
                data.recent_activities.slice(0, 5).map((act: any) => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <div className="font-bold text-slate-900 truncate">
                        {act.action}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        By {act.user?.name || 'System Operator'} • Campus: {act.university?.name || 'Platform Core'}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 1. SUPER ADMIN: OPERATIONAL GOVERNANCE DASHBOARD
  if (activeRole === 'super_admin') {
    const stats = data?.stats || {};
    return (
      <div className="space-y-8 font-sans">
        <div className="bg-gradient-to-r from-navy to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Platform Governance Console
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, Platform Super Administrator
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-xl">
              Pusat kendali operasional platform: provisioning universitas, tata kelola akun administrator, dan tinjauan permohonan onboarding.
            </p>
          </div>

          {/* Quick Operational Shortcuts */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/universities"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Kelola Kampus</span>
            </Link>
            <Link
              to="/users"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Kelola User</span>
            </Link>
            <Link
              to="/analytics"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Buka Analytics</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Universities" value={stats.total_universities || 0} icon={Building2} color="blue" />
          <StatCard title="Active Campuses" value={stats.active_universities || 0} icon={CheckCircle} color="emerald" />
          <StatCard title="Pending Requests" value={stats.pending_requests || 0} icon={Clock} color="amber" />
          <StatCard title="Total Users" value={stats.total_users || 0} icon={Users2} color="indigo" />
          <StatCard title="Campus Events" value={stats.total_events || 0} icon={CalendarCheck2} color="purple" />
          <StatCard title="Equipment Loans" value={stats.total_borrowings || 0} icon={PackageCheck} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-navy">Platform User Growth</h3>
                <p className="text-xs text-slate-500">Registered student & faculty volume across universities</p>
              </div>
              <Badge variant="blue">Real-time DB</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.user_growth || [{ month: 'Nov 2026', count: stats.total_users || 9 }]}>
                  <defs>
                    <linearGradient id="userColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#userColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending University Requests */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-navy">University Inquiries</h3>
                <Link to="/universities" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  Manage All
                </Link>
              </div>
              <div className="space-y-3">
                {(!data?.recent_requests || data.recent_requests.length === 0) ? (
                  <div className="text-xs text-slate-400 py-6 text-center">No pending institutional requests.</div>
                ) : (
                  data.recent_requests.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="font-bold text-slate-900">{r.university_name}</div>
                      <div className="text-slate-500 mt-0.5">{r.contact_person} • {r.email}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant={r.status === 'approved' ? 'emerald' : r.status === 'rejected' ? 'rose' : 'amber'}>
                          {r.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CAMPUS ADMIN DASHBOARD
  if (activeRole === 'campus_admin') {
    const stats = data?.stats || {};
    return (
      <div className="space-y-8 font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-600 uppercase tracking-widest">University Administration</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy">
              {activeAssignment?.university?.name || 'Campus Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centralized administrative command for academic units, student bodies, events, and maintenance reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/announcements"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              + Post Announcement
            </Link>
            <Link
              to="/scanner"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-brand-600" />
              Ticket Scanner
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Enrolled Students" value={stats.total_students || 0} icon={GraduationCap} color="blue" />
          <StatCard title="Lecturers" value={stats.total_lecturers || 0} icon={Users2} color="emerald" />
          <StatCard title="Organizations" value={stats.total_organizations || 0} icon={Building2} color="purple" />
          <StatCard title="Events Held" value={stats.total_events || 0} icon={CalendarCheck2} color="indigo" />
          <StatCard title="Facility Tickets" value={stats.total_reports || 0} icon={Wrench} color="rose" />
          <StatCard title="Pending Tickets" value={stats.pending_reports || 0} icon={AlertCircle} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-navy">Recent University Announcements</h3>
                <p className="text-xs text-slate-500">Official campus updates and scholarly notices</p>
              </div>
              <Link to="/announcements" className="text-xs font-bold text-brand-600">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {data?.recent_announcements?.map((a: any) => (
                <div key={a.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                      {a.category?.name || 'General'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{a.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.content}</p>
                  </div>
                  <Badge variant={a.priority === 'urgent' ? 'rose' : a.priority === 'high' ? 'amber' : 'slate'} size="sm">
                    {a.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4">Urgent Maintenance Tickets</h3>
            <div className="space-y-3">
              {data?.recent_reports?.slice(0, 4).map((r: any) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{r.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.location}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={r.priority === 'critical' || r.priority === 'high' ? 'rose' : 'blue'} size="sm">
                      {r.priority}
                    </Badge>
                    <span className="text-[10px] text-slate-400 capitalize">{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEPARTMENT ADMIN DASHBOARD (MODULE 05)
  if (activeRole === 'department_admin') {
    const stats = data?.stats || {};
    return (
      <div className="space-y-8 font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-brand-600 uppercase tracking-widest">Department Unit Inventory</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy">
              Laboratory & Equipment Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authorized management of equipment inventory, student loan approvals, and hardware condition logs.
            </p>
          </div>
          <Link
            to="/borrowings"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            Review Borrowing Requests ({stats.borrowing_requests || 0})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Equipment" value={stats.total_equipment || 0} icon={PackageCheck} color="blue" />
          <StatCard title="Available Stock" value={stats.available_equipment || 0} icon={CheckCircle} color="emerald" />
          <StatCard title="Pending Requests" value={stats.borrowing_requests || 0} icon={Clock} color="amber" />
          <StatCard title="Active Loans" value={stats.active_borrowings || 0} icon={History} color="indigo" />
          <StatCard title="Overdue Items" value={stats.overdue_equipment || 0} icon={AlertCircle} color="rose" />
          <StatCard title="Unit Damage Reports" value={stats.maintenance_reports || 0} icon={Wrench} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Borrowing Requests */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy">Incoming Borrowing Requests</h3>
              <Link to="/borrowings" className="text-xs font-bold text-brand-600">Full Queue</Link>
            </div>
            <div className="space-y-3">
              {(!data?.recent_requests || data.recent_requests.length === 0) ? (
                <div className="text-xs text-slate-400 py-6 text-center">No pending equipment requests.</div>
              ) : (
                data.recent_requests.map((b: any) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{b.facility?.name}</div>
                      <div className="text-slate-500 mt-0.5">
                        By {b.user?.name} • Qty: {b.quantity} • Due: {new Date(b.return_due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={b.status === 'pending' ? 'amber' : b.status === 'borrowed' ? 'blue' : 'emerald'}>
                      {b.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Inventory Summary */}
          <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy">Department Hardware Catalog</h3>
              <Link to="/facilities" className="text-xs font-bold text-brand-600">Manage Catalog</Link>
            </div>
            <div className="space-y-2.5">
              {data?.inventory_summary?.map((f: any) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{f.code} • {f.location}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-600">{f.available_quantity}</span>
                    <span className="text-slate-400"> / {f.total_quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. STUDENT DASHBOARD
  const stats = data?.stats || {};
  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-200 uppercase tracking-widest">
            <GraduationCap className="w-4 h-4 text-brand-300" />
            {activeAssignment?.university?.name || 'CampusConnect Student Portal'}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-slate-200 text-xs sm:text-sm max-w-xl">
            Here is your daily campus overview: upcoming registered events, equipment loan status, announcements, and digital credentials.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/events"
            className="px-5 py-2.5 bg-white text-brand-700 font-bold rounded-xl text-xs shadow-md hover:bg-slate-100 transition-all"
          >
            Browse Events
          </Link>
          <Link
            to="/facilities"
            className="px-5 py-2.5 bg-brand-500/30 hover:bg-brand-500/40 border border-white/20 text-white font-bold rounded-xl text-xs transition-all"
          >
            Borrow Equipment
          </Link>
        </div>
      </div>

      {/* Student Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Events" value={stats.registered_events || 0} icon={CalendarCheck2} color="blue" />
        <StatCard title="Events Attended" value={stats.attended_events || 0} icon={CheckCircle} color="emerald" />
        <StatCard title="Active Borrowings" value={stats.active_borrowings || 0} icon={PackageCheck} color="indigo" />
        <StatCard title="Active Reports" value={stats.active_reports || 0} icon={Wrench} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registered Events with Ticket QR modal */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy">My Upcoming Event Tickets</h3>
              <p className="text-xs text-slate-500">Show your digital ticket QR code at campus check-in</p>
            </div>
            <Link to="/events" className="text-xs font-bold text-brand-600">Discover More</Link>
          </div>

          <div className="space-y-3">
            {(!data?.registered_events || data.registered_events.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You haven't registered for any events yet. Check out the Event Center!
              </div>
            ) : (
              data.registered_events.map((reg: any) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-2xl bg-canvas border border-slate-200 hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <CalendarCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-navy">{reg.event?.title}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {reg.event?.location} • {new Date(reg.event?.start_time).toLocaleDateString()}
                      </div>
                      <div className="mt-2 font-mono text-[11px] font-bold text-brand-600">
                        {reg.ticket_code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={reg.status === 'attended' ? 'emerald' : 'blue'}>
                      {reg.status}
                    </Badge>
                    <button
                      onClick={() => {
                        setSelectedTicket(reg);
                        setTicketModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Ticket
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Campus Notices */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-navy">Campus Notices</h3>
              <Link to="/announcements" className="text-xs font-bold text-brand-600">All</Link>
            </div>
            <div className="space-y-3">
              {data?.recent_announcements?.map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-brand-600">{a.category?.name}</span>
                  <div className="font-bold text-slate-900 mt-0.5 line-clamp-1">{a.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{a.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Portfolio Status</span>
            <Link to="/portfolio" className="font-bold text-brand-600 hover:underline">
              View Activity Record →
            </Link>
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Official Digital Event Ticket"
      >
        {selectedTicket && (
          <div className="text-center py-4 space-y-4">
            <div className="bg-canvas p-6 rounded-2xl border border-slate-200 inline-block">
              <QRCodeSVG
                value={selectedTicket.qr_token || selectedTicket.ticket_code}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider">
                {selectedTicket.ticket_code}
              </div>
              <h4 className="text-lg font-bold text-navy mt-1">{selectedTicket.event?.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Holder: <strong>{user?.name}</strong> • Status: <strong className="capitalize">{selectedTicket.status}</strong>
              </p>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please present this cryptographic QR token to authorized event scanners at the hall entrance.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
