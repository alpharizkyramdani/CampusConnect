import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { University } from '../types';
import {
  GraduationCap,
  CalendarCheck2,
  PackageCheck,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Users2,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    api
      .get('/universities')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setUniversities(res.data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  // Smooth cubic-bezier transition curve
  const easeCubic: any = [0.22, 1, 0.36, 1];

  // Repeatable scroll animation configuration
  const scrollAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 },
    transition: {
      duration: 0.6,
      ease: easeCubic,
      delay,
    },
  });

  // Platform capabilities data
  const platformFeatures = [
    {
      icon: <CalendarCheck2 className="w-6 h-6" />,
      title: 'Event Center & QR Check-in',
      desc: 'Full lifecycle management: participant limits, unique cryptographic ticket codes, and camera QR scanning with instant duplicate detection.',
    },
    {
      icon: <PackageCheck className="w-6 h-6" />,
      title: 'Facility & Inventory Management',
      desc: 'Department-level catalog, concurrency-locked reservations, borrowing approvals, pickup, condition grading, and overdue tracking.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Digital Certificates & Portfolio',
      desc: 'Automated certificate generation, public hash authenticity verification, and rich student portfolios ready for job applications.',
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: 'UKM & Ormawa Hub',
      desc: 'Central directory for BEM, DPM, HIMA, and UKMs. Recruitment period portals, member governance, work program budgeting, and statistics.',
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Maintenance & Lost & Found',
      desc: 'Photo damage reporting with 6-stage lifecycle, plus a community lost-and-found board featuring private proof-of-ownership verification.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Multi-Tenant Logical Isolation',
      desc: 'Universities operate in secure logical isolation. Users from University A cannot access private records, assets, or services of University B.',
    },
  ];

  // Guaranteed showcase universities with PNL and network partners
  const displayUniversities =
    universities.length >= 3
      ? universities
      : [
          ...(universities.length > 0
            ? universities
            : [
                {
                  id: 5,
                  name: 'Politeknik Negeri Lhokseumawe',
                  code: 'PNL',
                  description:
                    'Pusat pendidikan vokasi unggulan bidang rekayasa dan tata niaga di Buketrata, Lhokseumawe.',
                  faculties_count: 5,
                  departments_count: 11,
                  events_count: 4,
                  logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
                },
              ]),
          {
            id: 101,
            name: 'Universitas Syiah Kuala (USK)',
            code: 'USK',
            description: 'Mitra kolaborasi akademik, riset terpadu, dan pertukaran mahasiswa merdeka.',
            faculties_count: 12,
            departments_count: 64,
            events_count: 18,
            logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 102,
            name: 'Politeknik Negeri Medan (POLMED)',
            code: 'POLMED',
            description: 'Aliansi konsorsium pendidikan vokasi nasional untuk sertifikasi dan magang industri.',
            faculties_count: 6,
            departments_count: 22,
            events_count: 12,
            logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
          },
        ].slice(0, 3);

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Top Public Header */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderMuted shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-navy tracking-tight">PNLConnect</span>
              <span className="block text-[10px] text-brand-600 font-bold uppercase tracking-wider">
                PNL DIGITAL ECOSYSTEM
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Platform Features
            </a>
            <a href="#universities" className="hover:text-brand-600 transition-colors">
              Mou Relationship
            </a>
            <Link to="/verify" className="hover:text-brand-600 transition-colors">
              Verify Certificate
            </Link>
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
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION (WORKING UNSPLASH BACKGROUND + DARK BLUE GRADIENT OVERLAY) */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36">
        {/* Working Unsplash University Campus Image Background */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Dark Blue Semi-Transparent Gradient Overlay */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(10, 30, 80, 0.85) 0%, rgba(29, 78, 216, 0.75) 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center">
            {/* Repeatable Staggered Item 1: Badge Pill */}
            <motion.div {...scrollAnim(0.1)} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Next-Generation Higher Education Digital Ecosystem</span>
              </div>
            </motion.div>

            {/* Repeatable Staggered Item 2: Main Headline */}
            <motion.h1
              {...scrollAnim(0.2)}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none drop-shadow-md"
            >
              Everything Your Campus Needs, <span className="text-cyan-300">Connected.</span>
            </motion.h1>

            {/* Repeatable Staggered Item 3: Description */}
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed drop-shadow-xs font-normal"
            >
              An integrated digital ecosystem that brings students, lecturers, organizations, and universities together in
              one unified platform.
            </motion.p>

            {/* Repeatable Staggered Item 4: CTA Buttons */}
            <motion.div
              {...scrollAnim(0.4)}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/login"
                className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-950/40 flex items-center gap-2 text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore CampusConnect
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register-university"
                style={{
                  border: '2px solid #ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                }}
                className="px-8 py-3.5 hover:bg-white/25 backdrop-blur-md font-bold rounded-2xl shadow-sm text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Register Your University
              </Link>
            </motion.div>

            {/* Repeatable Staggered Item 5: Quick Stats Grid (Solid Pure White Cards) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
              {[
                { number: '6 Department', desc: 'Connected Higher-Ed Network' },
                { number: '5,000+ Users', desc: 'PNL Students, Lecturers & Staff' },
                { number: '30+ Student Orgs', desc: 'Active BEM, MPM, HMJ & UKM' },
                { number: '10k+ Certificates', desc: 'Digitally Verified in Real-Time' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  {...scrollAnim(0.1 + i * 0.1)}
                  style={{ backgroundColor: '#ffffff' }}
                  className="p-5 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="text-3xl font-extrabold text-brand-600">{stat.number}</div>
                  <div className="text-xs text-slate-600 font-semibold mt-1">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION (RICHER BLUE GRADIENT + REPEATABLE SCROLL REVEAL) */}
      <section
        id="features"
        className="py-24 border-y border-blue-200/60"
        style={{
          background: 'linear-gradient(180deg, #DBEAFE 0%, #93C5FD 50%, #EFF6FF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-700 uppercase tracking-widest"
            >
              Enterprise Feature Suite
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Comprehensive Platform Capabilities
            </motion.p>
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-3 text-slate-700 text-sm sm:text-base"
            >
              Engineered to replace fragmented campus portals with one coherent, highly secure digital core.
            </motion.p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {platformFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                style={{ backgroundColor: '#ffffff' }}
                className="p-7 rounded-2xl border border-blue-200/80 shadow-md hover:shadow-xl hover:border-brand-400 transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-brand-600 flex items-center justify-center mb-5 shadow-2xs">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-navy">{feat.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MOU RELATIONSHIP SECTION (RICHER BLUE GRADIENT + REPEATABLE SCROLL REVEAL) */}
      <section
        id="universities"
        className="py-24 border-t border-blue-200/60"
        style={{
          background: 'linear-gradient(180deg, #DBEAFE 0%, #93C5FD 50%, #EFF6FF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <motion.h2
                {...scrollAnim(0.1)}
                className="text-xs font-bold text-brand-700 uppercase tracking-widest"
              >
                Network of Excellence
              </motion.h2>
              <motion.p
                {...scrollAnim(0.2)}
                className="mt-2 text-3xl font-extrabold text-navy"
              >
                Mou Relationship
              </motion.p>
            </div>
            <motion.div {...scrollAnim(0.3)}>
              <Link
                to="/directory"
                className="mt-4 md:mt-0 text-sm font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors"
              >
                Explore All Campuses <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUniversities.map((univ, idx) => {
              // Ensure clean campus building photo from Unsplash
              const campusThumbnail =
                univ.code === 'PNL' || !univ.logo || univ.logo.includes('bing.com')
                  ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'
                  : univ.logo;

              return (
                <motion.div
                  key={univ.id}
                  {...scrollAnim(0.1 + idx * 0.1)}
                  style={{ backgroundColor: '#ffffff' }}
                  className="border border-blue-200/80 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="h-44 overflow-hidden bg-slate-100 relative">
                    <img
                      src={campusThumbnail}
                      alt={univ.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-navy font-mono text-xs font-bold rounded-lg shadow-xs">
                      {univ.code}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-base text-navy">{univ.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {univ.description ||
                        'Leading educational institution committed to applied technology, research, and community service.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span>{univ.faculties_count || 5} Jurusan</span>
                      <span>{univ.departments_count || 11} Prodi</span>
                      <span>{univ.events_count || 4} Events</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FOOTER (SOLID DEEP BLUE #0F296B + PURE WHITE #FFFFFF TEXT & LINKS) */}
      <footer
        style={{ backgroundColor: '#0F296B' }}
        className="py-12 text-white border-t border-blue-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span style={{ color: '#FFFFFF' }} className="font-extrabold text-base tracking-tight">
              PNLConnect
            </span>
            <span style={{ color: '#FFFFFF' }} className="opacity-90 hidden sm:inline">
              — "One Platform, Every Campus, Connected."
            </span>
          </div>

          <div className="flex flex-wrap gap-6 font-semibold">
            <Link
              to="/verify"
              style={{ color: '#FFFFFF' }}
              className="hover:text-cyan-300 transition-colors"
            >
              Verify Certificate
            </Link>
            <Link
              to="/login"
              style={{ color: '#FFFFFF' }}
              className="hover:text-cyan-300 transition-colors"
            >
              Portal Login
            </Link>
            <Link
              to="/register-university"
              style={{ color: '#FFFFFF' }}
              className="hover:text-cyan-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          <div style={{ color: '#FFFFFF' }} className="opacity-90 font-medium">
            © {new Date().getFullYear()} PNLConnect Platform. Politeknik Negeri Lhokseumawe.
          </div>
        </div>
      </footer>
    </div>
  );
};
