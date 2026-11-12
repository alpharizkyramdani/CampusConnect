import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { University } from '../types';
import {
  GraduationCap,
  Building2,
  CalendarCheck2,
  PackageCheck,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users2,
  Globe,
  QrCode,
  FileText,
  Search,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    api.get('/universities').then((res) => {
      if (res.data.success) {
        setUniversities(res.data.data.slice(0, 3));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Top Public Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-borderMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-navy tracking-tight">CampusConnect</span>
              <span className="block text-[10px] text-brand-600 font-bold uppercase tracking-wider">Multi-Campus Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Platform Features</a>
            <a href="#roles" className="hover:text-brand-600 transition-colors">Role Architecture</a>
            <a href="#universities" className="hover:text-brand-600 transition-colors">Participating Campuses</a>
            <Link to="/verify" className="hover:text-brand-600 transition-colors">Verify Certificate</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register-university"
              className="hidden sm:inline-flex px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all"
            >
              Register Campus
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.50),theme(colors.canvas))] opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6"
          >
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Next-Generation Higher Education Digital Ecosystem</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none"
          >
            Everything Your Campus Needs, <span className="text-brand-600">Connected.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            An integrated digital ecosystem that brings students, lecturers, organizations, and universities together in one unified platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 flex items-center gap-2 text-base transition-all transform hover:-translate-y-0.5"
            >
              Explore CampusConnect
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register-university"
              className="px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-2xl shadow-xs text-base transition-all transform hover:-translate-y-0.5"
            >
              Register Your University
            </Link>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-3xl font-extrabold text-brand-600">Multi-Univ</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Tenant-Isolated Architecture</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-3xl font-extrabold text-brand-600">7+ Roles</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Contextual RBAC & Switching</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-3xl font-extrabold text-brand-600">18 Modules</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Integrated Campus Workflows</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-3xl font-extrabold text-brand-600">100% Real</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Laravel & MySQL Backend</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-y border-borderMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Enterprise Feature Suite</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy">
              Comprehensive Platform Capabilities
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Engineered to replace fragmented campus portals with one coherent, highly secure digital core.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Event Center & QR Check-in</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Full lifecycle management: participant limits, unique cryptographic ticket codes, and camera QR scanning with instant duplicate detection.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Facility & Inventory Management</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Department-level catalog, concurrency-locked reservations, borrowing approvals, pickup, condition grading, and overdue tracking.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Digital Certificates & Portfolio</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated certificate generation, public hash authenticity verification, and rich student portfolios ready for job applications.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">UKM & Ormawa Hub</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Central directory for BEM, DPM, HIMA, and UKMs. Recruitment period portals, member governance, work program budgeting, and statistics.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Maintenance & Lost & Found</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Photo damage reporting with 6-stage lifecycle, plus a community lost-and-found board featuring private proof-of-ownership verification.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-canvas border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy">Multi-Tenant Logical Isolation</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Universities operate in secure logical isolation. Users from University A cannot access private records, assets, or services of University B.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUPPORTED USER ROLES */}
      <section id="roles" className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Access Control</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy">
              Role-Based Experience Architecture
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Each stakeholder accesses customized dashboards, tools, and permissions scoped to their institution.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md inline-block">
                Platform Admin
              </div>
              <h4 className="text-base font-bold text-navy mt-3">Super Admin</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Oversees all registered universities, reviews university registration requests, and monitors platform-wide audit logs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-md inline-block">
                University Level
              </div>
              <h4 className="text-base font-bold text-navy mt-3">Campus Admin</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manages faculties, departments, academic calendar, campus announcements, student service catalog, and organization accreditations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md inline-block">
                Academic Unit
              </div>
              <h4 className="text-base font-bold text-navy mt-3">Department Admin</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Curates equipment inventory, evaluates student borrowing requests, processes hardware handovers, and tracks returns.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md inline-block">
                Student Body
              </div>
              <h4 className="text-base font-bold text-navy mt-3">UKM & Ormawa Admin</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Publishes activities, manages recruitment cycles, publishes events, scans participant tickets, and issues achievement certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UNIVERSITY DIRECTORY PREVIEW */}
      <section id="universities" className="py-20 bg-white border-t border-borderMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Network of Excellence</h2>
              <p className="mt-2 text-3xl font-extrabold text-navy">Participating Universities</p>
            </div>
            <Link to="/directory" className="mt-4 md:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Explore All Campuses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((univ) => (
              <div
                key={univ.id}
                className="bg-canvas border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-40 overflow-hidden bg-slate-100 relative">
                  <img
                    src={univ.logo || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&auto=format&fit=crop&q=80'}
                    alt={univ.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/95 text-navy font-mono text-xs font-bold rounded-md shadow-xs">
                    {univ.code}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-base text-navy">{univ.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{univ.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <span>{univ.faculties_count || 2} Faculties</span>
                    <span>{univ.departments_count || 3} Departments</span>
                    <span>{univ.events_count || 2} Events</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-br from-navy-dark via-navy to-brand-950 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Connect Your Campus?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Join premier higher education institutions utilizing CampusConnect's modern multi-university infrastructure today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register-university"
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/40 transition-all text-sm sm:text-base"
            >
              Submit University Application
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl transition-all text-sm sm:text-base"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">CampusConnect</span>
            <span>— "One Platform, Every Campus, Connected."</span>
          </div>

          <div className="flex gap-6 font-medium">
            <Link to="/verify" className="hover:text-brand-600">Verify Certificate</Link>
            <Link to="/login" className="hover:text-brand-600">Portal Login</Link>
            <Link to="/register-university" className="hover:text-brand-600">University Registration</Link>
          </div>

          <div>© {new Date().getFullYear()} CampusConnect Platform. Production Build.</div>
        </div>
      </footer>
    </div>
  );
};
