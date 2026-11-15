import React from 'react';
import { Link } from 'react-router-dom';
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
  BookOpen,
  Cpu,
  Layers,
  FlaskConical,
  Building,
  Briefcase,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
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

  // Platform capabilities data tailored for PNL
  const platformFeatures = [
    {
      icon: <CalendarCheck2 className="w-6 h-6" />,
      title: 'Event Center & Presensi QR Code',
      desc: 'Manajemen kegiatan ormawa dan akademik: tiket unik, kuota peserta, dan presensi scan QR camera anti-duplikasi.',
    },
    {
      icon: <PackageCheck className="w-6 h-6" />,
      title: 'Inventaris & Peminjaman Lab Jurusan',
      desc: 'Katalog alat laboratorium tiap jurusan, reservasi ruangan, persetujuan admin jurusan, serta pelacakan pengembalian.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Sertifikat Digital & e-Portfolio',
      desc: 'Penerbitan e-sertifikat otomatis, verifikasi publik keaslian hash, dan rekam portofolio prestasi mahasiswa PNL.',
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: 'Sentra Ormawa & Himpunan Jurusan',
      desc: 'Direktori BEM, MPM, Himpunan Mahasiswa Jurusan (HIMA), dan UKM. Pendaftaran anggota, rapat kerja, dan dokumentasi.',
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Lapor Fasilitas & Barang Hilang',
      desc: 'Laporan kerusakan sarana kampus dengan foto bukti dan tracking status, serta portal komunitas penemuan barang hilang.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Akses Peran & Jurusan Terintegrasi',
      desc: 'Hak akses bertingkat: Super Admin (Direktorat PNL), Admin Jurusan, Dosen, Mahasiswa, dan Pengurus Ormawa dalam satu sistem.',
    },
  ];

  // 6 Jurusan Resmi di Politeknik Negeri Lhokseumawe (PNL)
  const pnlDepartments = [
    {
      id: 40,
      name: 'Teknologi Informasi & Komputer',
      code: 'JTIK',
      badge: 'JTIK-PNL',
      icon: <Cpu className="w-6 h-6 text-brand-600" />,
      tagline: 'Rekayasa Perangkat Lunak, Jaringan & Multimedia Cerdas',
      description:
        'Pusat pendidikan vokasi keunggulan rekayasa sistem komputer, kecerdasan buatan, keamanan jaringan, dan konten multimedia digital.',
      prodi: ['D4 Teknik Informatika', 'D4 Rekayasa Multimedia', 'D3 Teknik Informatika'],
      stats: { prodi: '3 Prodi', labs: '6 Lab Modern' },
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 41,
      name: 'Teknik Elektro',
      code: 'JTE',
      badge: 'JTE-PNL',
      icon: <Zap className="w-6 h-6 text-brand-600" />,
      tagline: 'Sistem Tenaga Listrik, Otomasi & Telekomunikasi',
      description:
        'Membentuk tenaga ahli terapan bidang sistem pembangkit energi listrik, kendali otomasi industri, PLC, dan telekomunikasi seluler.',
      prodi: ['D4 Rekayasa Jaringan Telkom', 'D3 Teknik Listrik', 'D3 Teknik Elektronika'],
      stats: { prodi: '3 Prodi', labs: '8 Lab Energi' },
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 43,
      name: 'Teknik Mesin',
      code: 'JTM',
      badge: 'JTM-PNL',
      icon: <Wrench className="w-6 h-6 text-brand-600" />,
      tagline: 'Manufaktur Presisi, Fabrikasi CNC & Konversi Energi',
      description:
        'Pendidikan vokasi perancangan mekanikal, permesinan presisi CNC, pengelasan bersertifikat internasional, dan perawatan mesin industri.',
      prodi: ['D4 Rekayasa Manufaktur', 'D3 Teknik Mesin', 'D3 Teknik Pengelasan'],
      stats: { prodi: '3 Prodi', labs: '7 Bengkel & Lab' },
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 42,
      name: 'Teknik Sipil',
      code: 'JTS',
      badge: 'JTS-PNL',
      icon: <Building className="w-6 h-6 text-brand-600" />,
      tagline: 'Infrastruktur Jalan Jembatan & Konstruksi Tahan Gempa',
      description:
        'Keahlian perancangan struktur bangunan gedung bertingkat, rekayasa jalan raya jembatan, mekanika tanah, dan manajemen proyek konstruksi.',
      prodi: ['D4 Manajemen Rekayasa Konstruksi', 'D3 Teknik Sipil', 'D4 Konstruksi Jalan & Jembatan'],
      stats: { prodi: '3 Prodi', labs: '5 Lab Uji Bahan' },
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 45,
      name: 'Teknik Kimia',
      code: 'JTK',
      badge: 'JTK-PNL',
      icon: <FlaskConical className="w-6 h-6 text-brand-600" />,
      tagline: 'Teknologi Rekayasa Kimia Industri & Pengolahan Migas',
      description:
        'Pusat keunggulan rekayasa proses kimia industri, teknologi pengolahan minyak bumi dan gas alam, bioenergi, serta keselamatan K3 industri.',
      prodi: ['D4 Rekayasa Kimia Industri', 'D3 Teknik Kimia', 'D3 Pengolahan Migas'],
      stats: { prodi: '3 Prodi', labs: '6 Lab Kimia' },
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 44,
      name: 'Tata Niaga',
      code: 'JTN',
      badge: 'JTN-PNL',
      icon: <Briefcase className="w-6 h-6 text-brand-600" />,
      tagline: 'Akuntansi Keuangan Syariah & Bisnis Digital Terapan',
      description:
        'Pendidikan terapan akuntansi sektor publik, keuangan syariah, perbankan modern, perpajakan, dan administrasi bisnis terdigitalisasi.',
      prodi: ['D4 Akuntansi Keuangan Syariah', 'D3 Administrasi Bisnis', 'D4 Manajemen Bisnis'],
      stats: { prodi: '3 Prodi', labs: '4 Lab Komputer Bisnis' },
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    },
  ];

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
            <a href="#jurusan" className="hover:text-brand-600 transition-colors">
              Jurusan PNL
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
              to="/register"
              className="hidden sm:inline-flex px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION WITH REAL PNL CAMPUS PHOTO & BALANCED DARK/BLACK TRANSPARENT OVERLAY */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36 bg-slate-950">
        {/* Layer 0: Real PNL Campus Image (Uploaded by User) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: `url('/images/pnl-campus-real.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Layer 1: Balanced Dark Transparent Layer Overlay (Photo clearly visible) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.38) 0%, rgba(15, 23, 42, 0.48) 50%, rgba(15, 23, 42, 0.60) 100%)',
          }}
        />

        {/* Layer 2: Foreground Content (relative z-10) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center">
            {/* Repeatable Staggered Item 1: Badge Pill */}
            <motion.div {...scrollAnim(0.1)} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6 shadow-md">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Next-Generation Higher Education Digital Ecosystem - Politeknik Negeri Lhokseumawe</span>
              </div>
            </motion.div>

            {/* Repeatable Staggered Item 2: Main Headline */}
            <motion.h1
              {...scrollAnim(0.2)}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.75), 0 2px 4px rgba(0, 0, 0, 0.9)',
              }}
            >
              Everything Your Campus Needs, <span className="text-cyan-400">Connected.</span>
            </motion.h1>

            {/* Repeatable Staggered Item 3: Description */}
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed font-medium"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              Ekosistem digital terpadu Politeknik Negeri Lhokseumawe yang menghubungkan mahasiswa, dosen, ormawa, dan 6 jurusan dalam satu platform cerdas.
            </motion.p>

            {/* Repeatable Staggered Item 4: CTA Buttons */}
            <motion.div
              {...scrollAnim(0.4)}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/login"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 flex items-center gap-2 text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Masuk Portal Civitas
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
                className="px-8 py-3.5 hover:bg-white/20 backdrop-blur-md font-bold rounded-2xl shadow-sm text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Daftar Akun Baru
              </Link>
            </motion.div>

            {/* Repeatable Staggered Item 5: Quick Stats Grid (Solid Pure White Cards) */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
              {[
                { number: '6 Jurusan', desc: 'Pendidikan Vokasi Unggulan' },
                { number: '5,000+ Civitas', desc: 'Mahasiswa, Dosen & Tendik PNL' },
                { number: '30+ Ormawa & UKM', desc: 'Aktif BEM, MPM, HMJ & UKM' },
                { number: '10k+ Sertifikat', desc: 'Terverifikasi Digital Real-Time' },
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

      {/* 2. FEATURES SECTION (MINIMALIST SOFT WHITE & LIGHT BLUE GRADIENT + REPEATABLE SCROLL REVEAL) */}
      <section
        id="features"
        className="py-24 border-y border-slate-200/50"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FE 40%, #EBF3FD 75%, #F8FBFF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest"
            >
              Enterprise Feature Suite
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Layanan Terintegrasi Kampus PNL
            </motion.p>
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-3 text-slate-600 text-sm sm:text-base"
            >
              Dirancang khusus menggantikan portal kampus terpisah menjadi satu kesatuan ekosistem digital Politeknik Negeri Lhokseumawe yang terpadu.
            </motion.p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {platformFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                style={{ backgroundColor: '#ffffff' }}
                className="p-7 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-brand-300 transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50/80 border border-brand-100 text-brand-600 flex items-center justify-center mb-5 shadow-2xs">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-navy">{feat.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. JURUSAN DI POLITEKNIK NEGERI LHOKSEUMAWE (6 JURUSAN RESMI) */}
      <section
        id="jurusan"
        className="py-24 border-t border-slate-200/50"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #EBF3FD 40%, #F4F8FE 75%, #FFFFFF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <motion.h2
                {...scrollAnim(0.1)}
                className="text-xs font-bold text-brand-600 uppercase tracking-widest"
              >
                6 Jurusan Unggulan
              </motion.h2>
              <motion.p
                {...scrollAnim(0.2)}
                className="mt-2 text-3xl font-extrabold text-navy"
              >
                Jurusan di Politeknik Negeri Lhokseumawe
              </motion.p>
              <motion.p
                {...scrollAnim(0.25)}
                className="mt-2 text-sm text-slate-600 max-w-2xl"
              >
                Pusat pendidikan vokasi terapan terkemuka bidang rekayasa teknologi dan tata niaga modern di Buketrata, Lhokseumawe.
              </motion.p>
            </div>
            <motion.div {...scrollAnim(0.3)}>
              <Link
                to="/register"
                className="mt-4 md:mt-0 text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
              >
                Daftar Akun Civitas PNL <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pnlDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                style={{ backgroundColor: '#ffffff' }}
                className="border border-slate-200/70 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-300 transition-all transform hover:-translate-y-1 flex flex-col"
              >
                <div className="h-44 overflow-hidden bg-slate-100 relative">
                  <img
                    src={dept.image}
                    alt={dept.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-brand-700 font-mono text-xs font-bold rounded-lg shadow-xs">
                    {dept.badge}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-navy">{dept.name}</h3>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">{dept.tagline}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>
                    
                    {/* Prodi Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dept.prodi.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-medium border border-blue-100"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                    <span>{dept.stats.prodi}</span>
                    <span className="text-slate-400">•</span>
                    <span>{dept.stats.labs}</span>
                    <Link
                      to="/login"
                      className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1"
                    >
                      Masuk <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
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
              — "Satu Platform Ekosistem Digital Politeknik Negeri Lhokseumawe"
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
              to="/register"
              style={{ color: '#FFFFFF' }}
              className="hover:text-cyan-300 transition-colors"
            >
              Daftar Akun Civitas
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
