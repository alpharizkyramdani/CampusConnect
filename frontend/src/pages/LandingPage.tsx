import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck2,
  PackageCheck,
  ShieldCheck,
  Award,
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
  Folder,
  FolderOpen,
  FileText,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Landmark,
  HeartHandshake,
  Compass,
  Trophy,
  Filter,
  Flame,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface StudyProgram {
  level: 'D3' | 'D4' | 'S2';
  levelLabel: string;
  name: string;
  duration: string;
  sks: string;
  career: string[];
  description: string;
  lab: string;
}

interface DepartmentData {
  id: number;
  name: string;
  shortName: string;
  code: string;
  badge: string;
  colorName: string;
  tabClass: string;
  tabCornerClass: string;
  folderBorderClass: string;
  folderBgClass: string;
  iconBoxClass: string;
  headerAccent: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  labsCount: string;
  programs: StudyProgram[];
}

interface OrgItem {
  name: string;
  abbr: string;
  scope: string;
  tagline: string;
  description: string;
  focus: string[];
}

interface OrgCategory {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  tabClass: string;
  tabCornerClass: string;
  folderBorderClass: string;
  folderBgClass: string;
  iconBoxClass: string;
  icon: React.ReactNode;
  items: OrgItem[];
}

export const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'fitur' | 'jurusan' | 'organisasi'>('hero');

  // Page Scroll Progress for Smooth Landing Page Transition Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Single Prodi Modal State (Only 1 Prodi Opens)
  const [selectedProdi, setSelectedProdi] = useState<{
    dept: DepartmentData;
    program: StudyProgram;
  } | null>(null);

  // Single Org Modal State (Only 1 Org Opens)
  const [selectedOrgItem, setSelectedOrgItem] = useState<{
    category: OrgCategory;
    item: OrgItem;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      // Section scrollspy for active nav transition indicator
      const scrollPos = window.scrollY + 220;
      const fiturEl = document.getElementById('fitur');
      const jurusanEl = document.getElementById('jurusan');
      const organisasiEl = document.getElementById('organisasi');

      if (organisasiEl && scrollPos >= organisasiEl.offsetTop) {
        setActiveSection('organisasi');
      } else if (jurusanEl && scrollPos >= jurusanEl.offsetTop) {
        setActiveSection('jurusan');
      } else if (fiturEl && scrollPos >= fiturEl.offsetTop) {
        setActiveSection('fitur');
      } else {
        setActiveSection('hero');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProdi(null);
        setSelectedOrgItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth cubic-bezier transition curve
  const easeCubic: any = [0.22, 1, 0.36, 1];

  // Repeatable scroll animation configuration with smooth reveal
  const scrollAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: 0.65,
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
      title: 'Peminjaman Alat & Fasilitas Kampus',
      desc: 'Peminjaman proyektor, laboratorium komputer, bengkel mesin, ruang aula, hingga alat praktikum dengan verifikasi digital.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verifikasi Sertifikat Digital & SKPI',
      desc: 'Penerbitan e-sertifikat kegiatan ber-QR code dan hash anti-pemalsuan untuk rekaman SKPI & portfolio mahasiswa.',
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: 'Smart Campus Map & Direktori Lokasi',
      desc: 'Peta digital interaktif Politeknik Negeri Lhokseumawe untuk mencari ruang kelas, bengkel, lab, masjid, dan kantin.',
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

  // ==========================================
  // DATA 6 JURUSAN RESMI PNL DENGAN WARNA KHAS:
  // 1. TIK: UNGU
  // 2. TEKNIK SIPIL: COKLAT
  // 3. TEKNIK MESIN: BIRU
  // 4. TEKNIK KIMIA: HIJAU
  // 5. TEKNIK ELEKTRO: MERAH
  // 6. BISNIS: ORANGE
  // ==========================================
  const pnlDepartments: DepartmentData[] = [
    {
      id: 1,
      name: 'Teknologi Informasi dan Komputer (TIK)',
      shortName: 'TIK',
      code: 'TIK',
      badge: 'TIK-PNL',
      colorName: 'Ungu',
      tabClass: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white',
      tabCornerClass: 'bg-indigo-700',
      folderBorderClass: 'border-purple-300 hover:border-purple-500',
      folderBgClass: 'from-purple-50/70 via-white to-violet-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-purple-600 to-indigo-700 text-white',
      headerAccent: 'text-purple-700',
      icon: <Cpu className="w-6 h-6" />,
      tagline: 'Rekayasa Perangkat Lunak, Jaringan Cerdas & Multimedia',
      description:
        'Pusat pendidikan vokasi keunggulan rekayasa sistem perangkat lunak, infrastruktur cloud & cyber security, kecerdasan buatan, dan konten multimedia interaktif.',
      labsCount: '6 Laboratorium Modern',
      programs: [
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Kom)',
          name: 'D4 Teknik Informatika',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Fullstack Web & Mobile Engineer', 'Cloud DevOps Specialist', 'Database Architect', 'AI/ML Solution Builder'],
          description: 'Fokus keahlian rekayasa sistem perangkat lunak skala enterprise, integrasi arsitektur microservices, kecerdasan buatan, dan komputasi awan.',
          lab: 'Lab Software Engineering & Cloud Computing',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Kom)',
          name: 'D4 Teknologi Rekayasa Komputer Jaringan',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Network Security Engineer', 'Penetration Tester / Cyber Defense', 'System Administrator', 'IoT Infrastructure Architect'],
          description: 'Membentuk tenaga ahli terapan dalam perancangan infrastruktur jaringan modern, mitigasi ancaman siber, router switching enterprise, dan sistem IoT.',
          lab: 'Lab Cyber Security & Cisco Networking',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Kom)',
          name: 'D4 Teknologi Rekayasa Multimedia',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['UI/UX Product Designer', 'Game Developer & Interactive Media', '3D Modeling & Visual FX Artist', 'Creative Media Director'],
          description: 'Keahlian terapan dalam perancangan antarmuka pengguna digital, pengembangan aplikasi game, animasi 3 dimensi, dan teknologi visual interaktif.',
          lab: 'Lab Multimedia Interaktif & Studio Digital',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Kom)',
          name: 'D4 Teknologi Rekayasa Perangkat Lunak',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Enterprise Software Architect', 'Mobile Application Developer', 'QA Automation Engineer', 'Scrum Product Lead'],
          description: 'Konsentrasi pada metodologi siklus hidup rekayasa piranti lunak terstandar industri, arsitektur microservices modern, dan jaminan mutu kode.',
          lab: 'Lab Rekayasa Perangkat Lunak Lanjut',
        },
      ],
    },
    {
      id: 2,
      name: 'Teknik Sipil',
      shortName: 'Teknik Sipil',
      code: 'SIPIL',
      badge: 'SIPIL-PNL',
      colorName: 'Coklat',
      tabClass: 'bg-gradient-to-r from-[#8B4513] to-[#5C2E0B] text-white',
      tabCornerClass: 'bg-[#5C2E0B]',
      folderBorderClass: 'border-amber-700/40 hover:border-amber-800',
      folderBgClass: 'from-[#FAF5F0] via-white to-[#FDF8F3]',
      iconBoxClass: 'bg-gradient-to-tr from-[#8B4513] to-[#5C2E0B] text-white',
      headerAccent: 'text-[#7A3E1D]',
      icon: <Building className="w-6 h-6" />,
      tagline: 'Infrastruktur Jalan Jembatan, Keairan & Gedung Tahan Gempa',
      description:
        'Keahlian perancangan dan manajemen struktur bangunan gedung bertingkat, rekayasa jalan raya jembatan, bendungan keairan, serta teknologi Building Information Modeling (BIM).',
      labsCount: '5 Lab Uji Bahan & Hidrolika',
      programs: [
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Konstruksi Bangunan Air',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Surveyor Hidrologi & Irigasi', 'Pelaksana Proyek Drainase & Bendungan', 'Estimator Proyek Keairan'],
          description: 'Pendidikan teknisi terapan perancangan saluran drainase perkotaan, tanggul pengendali banjir, bendungan, dan instalasi pengelolaan air bersih.',
          lab: 'Lab Mekanika Fluida & Hidrolika Terapan',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Konstruksi Jalan dan Jembatan',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Teknisi Lapangan Perkerasan Jalan', 'Inspector Mutu Aspal & Beton', 'Juru Ukur Topografi Jalan'],
          description: 'Penguasaan teknik survei trase jalan, pengujian bahan aspal beton, pengawasan pemadatan tanah, dan pelaksanaan konstruksi jembatan sederhana.',
          lab: 'Lab Uji Bahan, Tanah & Aspal',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Konstruksi Bangunan Gedung',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Pengawas Konstruksi Gedung', 'Drafter CAD & BIM Architecture', 'Quantity Surveyor Gedung'],
          description: 'Mencetak tenaga terampil pelaksanaan bekisting, pembesian, perancah, beton bertulang, dan pengawasan keselamatan kerja gedung bertingkat.',
          lab: 'Lab Struktur Beton & Mekanika Tanah',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Konstruksi Jalan dan Jembatan',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Highway & Bridge Structural Engineer', 'Manajer Proyek Infrastruktur', 'Geotechnical & Pavement Specialist'],
          description: 'Perancangan tingkat lanjut struktur jembatan bentang panjang, rekayasa geometrik jalan raya bebas hambatan, analisis geoteknik, dan manajemen kontrak konstruksi.',
          lab: 'Studio Geomatika & Desain Jalan Digital',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Konstruksi Bangunan Gedung',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['BIM Manager / Structural Analyst', 'Project Manager Konstruksi', 'Ahli Struktur Tahan Gempa & Forensik Bangunan'],
          description: 'Spesialisasi rekayasa struktur gedung bertingkat tinggi tahan gempa, implementasi BIM 4D/5D, audit keandalan struktur, dan kepemimpinan proyek konstruksi modern.',
          lab: 'Lab Uji Bahan & Komputasi Struktur',
        },
      ],
    },
    {
      id: 3,
      name: 'Teknik Mesin',
      shortName: 'Teknik Mesin',
      code: 'MESIN',
      badge: 'MESIN-PNL',
      colorName: 'Biru',
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
      tabCornerClass: 'bg-indigo-700',
      folderBorderClass: 'border-blue-300 hover:border-blue-500',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white',
      headerAccent: 'text-blue-700',
      icon: <Wrench className="w-6 h-6" />,
      tagline: 'Manufaktur Presisi CNC, Pengelasan Bersertifikat & Konversi Energi',
      description:
        'Pendidikan vokasi mekanikal terkemuka: permesinan presisi CNC, pengelasan bersertifikasi internasional (AWS/CSWIP), fabrikasi logam, dan otomasi perawatan mesin industri.',
      labsCount: '7 Bengkel & Laboratorium Mesin',
      programs: [
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Mesin',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Teknisi Pemeliharaan Mesin Pabrik', 'Operator Mesin Bubut/Frais Presisi', 'Toolmaker & Machining Specialist'],
          description: 'Kompetensi terapan operasi mesin perkakas konvensional, perawatan preventif pompa, kompresor, turbin, dan transmisi daya mekanikal.',
          lab: 'Bengkel Mesin Perkakas & Perawatan',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Industri',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Supervisor Lini Perakitan', 'Teknisi Kendali Kualitas (QC)', 'Industrial Plant Maintenance Specialist'],
          description: 'Penguasaan tata letak pabrik, efisiensi kerja industri, pengendalian kualitas proses produksi, dan sistem keselamatan K3 manufaktur.',
          lab: 'Lab Sistem Manufaktur & Ergonomi',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Manufaktur',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Manufacturing Systems Engineer', 'CAD/CAM/CNC Programmer', 'Production Plant Manager', 'Automation Specialist'],
          description: 'Perancangan produk terintegrasi computer-aided design (CAD/CAM), pemrograman mesin CNC multi-axis, robotika manufaktur, dan otomasi industri 4.0.',
          lab: 'Lab CNC Modern & Desain 3D CAD',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Pengelasan dan Fabrikasi',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Certified Welding Inspector (CSWIP/AWS)', 'Fabrication Structural Engineer', 'Pipeline Quality Assurance Specialist'],
          description: 'Keahlian pengelasan tingkat tinggi (SMAW, GTAW, GMAW, SAW) untuk konstruksi offshore, boiler, pipa migas, pengujian NDT (Non-Destructive Testing), dan sertifikasi internasional.',
          lab: 'Bengkel Fabrikasi Logam & Uji NDT',
        },
      ],
    },
    {
      id: 4,
      name: 'Teknik Kimia',
      shortName: 'Teknik Kimia',
      code: 'KIMIA',
      badge: 'KIMIA-PNL',
      colorName: 'Hijau',
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
      tabCornerClass: 'bg-teal-700',
      folderBorderClass: 'border-emerald-300 hover:border-emerald-500',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white',
      headerAccent: 'text-emerald-700',
      icon: <FlaskConical className="w-6 h-6" />,
      tagline: 'Rekayasa Kimia Industri, Pengolahan Migas & Bioenergi',
      description:
        'Pusat keunggulan rekayasa proses kimia, kilang pengolahan minyak dan gas bumi, bioteknologi terapan, pengelolaan limbah ramah lingkungan, dan K3 proses industri.',
      labsCount: '6 Lab Kimia & Simulasi Pabrik',
      programs: [
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Kimia',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Analis Laboratorium Kimia Industri', 'Operator Reaktor Proses Kimia', 'Quality Control Bahan Kimia'],
          description: 'Analisis proksimat dan instrumen spektrofotometri, operasi alat distilasi, evaporasi, filtrasi, dan pemantauan baku mutu limbah industri.',
          lab: 'Lab Kimia Dasar & Analitik Terapan',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Pengolahan Minyak dan Gas',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Refinery & Gas Plant Operator', 'Offshore Field Technician', 'Process Flow Inspector'],
          description: 'Teknologi pemisahan hidrokarbon, desulfurisasi, liquefaction LNG/LPG, pengoperasian kolom fraksionasi, dan manajemen keselamatan kilang migas.',
          lab: 'Lab Operasi Kilang Migas & Instrumentasi',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Kimia Industri',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Chemical Process Design Engineer', 'Petrochemical Plant Supervisor', 'Renewable Bioenergy Consultant'],
          description: 'Simulasi proses pabrik kimia (Aspen HYSYS), perancangan reaktor kimia berskala komersial, sintesis bahan polimer, dan transisi energi terbarukan.',
          lab: 'Lab Operasi Teknik Kimia & Simulasi HYSYS',
        },
      ],
    },
    {
      id: 5,
      name: 'Teknik Elektro',
      shortName: 'Teknik Elektro',
      code: 'ELEKTRO',
      badge: 'ELEKTRO-PNL',
      colorName: 'Merah',
      tabClass: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
      tabCornerClass: 'bg-rose-700',
      folderBorderClass: 'border-red-300 hover:border-red-500',
      folderBgClass: 'from-red-50/70 via-white to-rose-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-red-600 to-rose-700 text-white',
      headerAccent: 'text-red-700',
      icon: <Zap className="w-6 h-6" />,
      tagline: 'Pembangkit Energi, Jaringan Telekomunikasi & Otomasi Mekatronika',
      description:
        'Membentuk tenaga ahli terapan dalam sistem transmisi pembangkit energi listrik, jaringan telekomunikasi pita lebar 5G, instrumentasi kendali PLC SCADA, dan robotika mekatronika.',
      labsCount: '8 Lab Energi & Otomasi',
      programs: [
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Listrik',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Teknisi Distribusi Tenaga Listrik', 'Pengawas Instalasi Listrik Industri', 'Maintenance Gardu Induk & Genset'],
          description: 'Penguasaan instalasi tegangan rendah dan menengah, proteksi relai, pengujian trafo daya, motor induksi, dan efisiensi konsumsi daya.',
          lab: 'Lab Mesin Listrik & Distribusi Daya',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Telekomunikasi',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Radio Frequency (RF) Technician', 'Fiber Optic Splicer & Tester', 'Operator Base Transceiver Station (BTS)'],
          description: 'Teknologi perambatan gelombang radio, pemasangan dan pengujian kabel serat optik OTDR, instalasi antena microwave, dan transmisi data.',
          lab: 'Lab Telekomunikasi & Fiber Optik',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.T)',
          name: 'D3 Teknologi Elektronika',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Hardware Maintenance Specialist', 'PCB Layout Designer', 'Embedded Controller Assembly Technician'],
          description: 'Perancangan rangkaian analog dan digital, soldering mikroskopis, pemrograman mikrokontroler AVR/ARM, dan trouble-shooting perangkat elektronika.',
          lab: 'Lab Elektronika Digital & Instrumentasi',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Pembangkit Energi',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Power Plant Control Engineer', 'Solar & Wind Renewable Energy Auditor', 'High Voltage System Manager'],
          description: 'Perancangan pembangkit listrik termal, hidro, dan energi surya terbarukan (PLTS), sinkronisasi turbin generator, dan kestabilan smart-grid daya.',
          lab: 'Lab Pembangkit Tenaga Listrik & Panel Surya',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Jaringan Telekomunikasi',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['5G & Optical Network Engineer', 'Telecommunication Project Manager', 'VoIP & Cloud PBX Specialist'],
          description: 'Arsitektur jaringan nirkabel 4G/5G, routing switching core network, transmisi satelit dan gelombang mikro, serta integrasi jaringan cloud telekomunikasi.',
          lab: 'Lab Jaringan Telekomunikasi Digital',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Instrumentasi dan Kontrol',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Automation & SCADA Engineer', 'Industrial PLC Specialist', 'Process Safety Instrumentation Lead'],
          description: 'Integrasi sistem kendali otomatis DCS/SCADA di industri migas dan pabrik semen, sensor kalibrasi presisi, valve aktuator pneumatik, dan PLC terprogram.',
          lab: 'Lab Otomasi Industri & PLC SCADA',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.T)',
          name: 'D4 Teknologi Rekayasa Mekatronika',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Industrial Robotics Engineer', 'Smart Machine & Autonomous System Designer', 'Embedded Firmware Developer'],
          description: 'Konvergensi mekanik, elektronika kontrol, dan piranti lunak cerdas untuk robotika industri, lengan robotika pabrik, dan mesin cerdas masa depan.',
          lab: 'Lab Robotika Cerdas & Mekatronika Terapan',
        },
      ],
    },
    {
      id: 6,
      name: 'Bisnis',
      shortName: 'Bisnis',
      code: 'BISNIS',
      badge: 'BISNIS-PNL',
      colorName: 'Orange',
      tabClass: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
      tabCornerClass: 'bg-amber-600',
      folderBorderClass: 'border-orange-300 hover:border-orange-500',
      folderBgClass: 'from-orange-50/70 via-white to-amber-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-orange-500 to-amber-600 text-white',
      headerAccent: 'text-orange-700',
      icon: <Briefcase className="w-6 h-6" />,
      tagline: 'Akuntansi Syariah, Keuangan Publik & Bisnis Digital Terapan',
      description:
        'Pendidikan terapan akuntansi sektor publik, perbankan syariah modern, manajemen investasi, perpajakan, dan administrasi bisnis terdigitalisasi.',
      labsCount: '4 Lab Komputer Bisnis & Bank Mini',
      programs: [
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.Ak)',
          name: 'D3 Akuntansi',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Junior Accountant', 'Staff Perpajakan Terapan', 'Internal Control Associate'],
          description: 'Penyusunan laporan keuangan neraca laba rugi berbasis software akuntansi modern (MYOB, Accurate), rekonsiliasi bank, dan pengisian SPT pajak.',
          lab: 'Lab Komputasi Akuntansi & Perpajakan',
        },
        {
          level: 'D3',
          levelLabel: 'Ahli Madya (A.Md.A.B)',
          name: 'D3 Administrasi Bisnis',
          duration: '3 Tahun (6 Semester)',
          sks: '108 SKS',
          career: ['Executive Administrative Officer', 'Digital Marketing Specialist', 'HR & Operational Assistant'],
          description: 'Kearsipan digital, korespondensi bisnis eksekutif, strategi pemasaran digital, operasional logistik, dan manajemen layanan pelanggan.',
          lab: 'Lab Perkantoran Digital & Simulasi Bisnis',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Ak)',
          name: 'D4 Akuntansi Lembaga Keuangan Syariah',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Sharia Bank Financial Officer', 'Dewan Pengawas Syariah Associate', 'Auditor Keuangan Islam'],
          description: 'Standar akuntansi syariah (AAOIFI & PSAK Syariah), transaksi mudharabah murabahah, audit perbankan syariah, dan instrumen investasi sukuk/halal.',
          lab: 'Lab Mini Bank Syariah Terapan',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.Ak)',
          name: 'D4 Akuntansi Sektor Publik',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Auditor BPK / BPKP / Inspektorat', 'Pengelola Keuangan APBN/APBD', 'Analis Akuntansi Pemerintahan'],
          description: 'Standar Akuntansi Pemerintahan (SAP), audit kepatuhan keuangan daerah, sistem informasi perbendaharaan negara, dan akuntansi forensik publik.',
          lab: 'Lab Sistem Informasi Keuangan Daerah (SIKD)',
        },
        {
          level: 'D4',
          levelLabel: 'Sarjana Terapan (S.Tr.M)',
          name: 'D4 Manajemen Keuangan Sektor Publik',
          duration: '4 Tahun (8 Semester)',
          sks: '144 SKS',
          career: ['Analis Kebijakan Anggaran Publik', 'Risk & Compliance Manager', 'Bendahara Pengeluaran Pemerintah'],
          description: 'Manajemen perbendaharaan negara, perencanaan anggaran berbasis kinerja, evaluasi proyek investasi publik, dan audit belanja modal daerah.',
          lab: 'Lab Manajemen Keuangan & Pasar Modal',
        },
        {
          level: 'S2',
          levelLabel: 'Magister Terapan (M.Tr.E)',
          name: 'S2 (Magister Terapan) Keuangan Islam Terapan',
          duration: '2 Tahun (4 Semester)',
          sks: '72 SKS',
          career: ['Senior Sharia Finance Consultant', 'Policy Maker Keuangan Syariah', 'Direktur Lembaga Keuangan Islam'],
          description: 'Program pascasarjana terapan pertama di Aceh yang mengkaji inovasi fintech syariah, manajemen portofolio wakaf produktif, dan kebijakan moneter Islam kontemporer.',
          lab: 'Pusat Riset Keuangan & Ekonomi Syariah PNL',
        },
      ],
    },
  ];

  // ==========================================
  // DATA 3 KATEGORI ORGANISASI MAHASISWA PNL
  // ==========================================
  const pnlOrgCategories: OrgCategory[] = [
    {
      id: 'eksekutif-legislatif',
      title: 'Lembaga Eksekutif & Legislatif Kampus',
      shortTitle: 'Eksekutif & Legislatif',
      subtitle: 'Pemerintahan Mahasiswa Tingkat Politeknik Negeri Lhokseumawe',
      badge: 'Pemerintahan Kampus',
      tabClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      tabCornerClass: 'bg-orange-600',
      folderBorderClass: 'border-amber-300 hover:border-amber-500',
      folderBgClass: 'from-amber-50/70 via-white to-orange-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white',
      icon: <Landmark className="w-6 h-6" />,
      items: [
        {
          name: 'Dewan Perwakilan Mahasiswa (DPM PNL)',
          abbr: 'DPM PNL',
          scope: 'Tingkat Institut / Seluruh Kampus',
          tagline: 'Lembaga Legislatif & Pengawasan Mahasiswa Tertinggi di PNL',
          description:
            'Lembaga legislatif tingkat kampus yang berfungsi mengawasi kinerja BEM, menyerap dan mengadvokasikan aspirasi seluruh mahasiswa PNL kepada pimpinan direktorat, serta merumuskan regulasi keorganisasian kemahasiswaan kampus.',
          focus: ['Pengawasan Kinerja BEM', 'Legislasi & Advokasi Aspirasi', 'Musyawarah Mahasiswa'],
        },
        {
          name: 'Badan Eksekutif Mahasiswa (BEM PNL)',
          abbr: 'BEM PNL',
          scope: 'Tingkat Institut / Seluruh Kampus',
          tagline: 'Lembaga Eksekutif Pelaksana Program Kerja Strategis Kemahasiswaan',
          description:
            'Lembaga eksekutif tingkat kampus yang menjalankan roda pemerintahan mahasiswa, memimpin program kerja kemahasiswaan umum, pengabdian masyarakat vokasi, advokasi kesejahteraan mahasiswa, dan harmonisasi ormawa di lingkungan PNL.',
          focus: ['Pengabdian Masyarakat Terapan', 'Advokasi Finansial & Beasiswa', 'Pekan Kreativitas Mahasiswa'],
        },
      ],
    },
    {
      id: 'himpunan-jurusan',
      title: 'Himpunan Mahasiswa Jurusan (HMJ)',
      shortTitle: 'Himpunan Jurusan (HMJ)',
      subtitle: 'Wadah Aspirasi, Soliditas & Keilmuan di Tingkat Jurusan',
      badge: '6 Himpunan Jurusan',
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
      tabCornerClass: 'bg-indigo-700',
      folderBorderClass: 'border-blue-300 hover:border-blue-500',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white',
      icon: <Layers className="w-6 h-6" />,
      items: [
        {
          name: 'HIMATIK (Himpunan Mahasiswa Teknologi Informasi dan Komputer)',
          abbr: 'HIMATIK PNL',
          scope: 'Jurusan TIK PNL',
          tagline: 'Inovasi Teknologi, Coding Bootcamp & Prestasi Mahasiswa TIK',
          description:
            'Wadah bagi mahasiswa Jurusan TIK untuk berkembang di bidang rekayasa teknologi informasi, pelatihan pemrograman, pembinaan kontes KMIPN/Gemastik, riset teknologi cerdas, dan penguatan persaudaraan vokasi.',
          focus: ['Divisi Litbang & AI', 'Divisi Kominfo & Multimedia', 'Divisi PSDM Kaderisasi', 'Divisi Humas'],
        },
        {
          name: 'HMS (Himpunan Mahasiswa Sipil)',
          abbr: 'HMS PNL',
          scope: 'Jurusan Teknik Sipil PNL',
          tagline: 'Soliditas Teknik, Inovasi Konstruksi & Rancang Bangun Gedung',
          description:
            'Wadah kemahasiswaan Jurusan Teknik Sipil yang aktif menyelenggarakan pelatihan software BIM/AutoCAD, bimbingan lomba jembatan dan beton nasional, serta bakti sosial bedah rumah dan sanitasi masyarakat.',
          focus: ['Pelatihan Software Konstruksi BIM', 'Kompetisi Jembatan Nasional', 'Bakti Sosial Teknik Sipil'],
        },
        {
          name: 'HMM (Himpunan Mahasiswa Mesin)',
          abbr: 'HMM PNL',
          scope: 'Jurusan Teknik Mesin PNL',
          tagline: 'Solidaritas Mesin Kuat, Riset Manufaktur & Kendaraan Hemat Energi',
          description:
            'Mengembangkan keahlian rancang bangun mesin terapan, riset otomotif kendaraan hemat energi (KMHE / Shell Eco-Marathon), pengelasan presisi, dan pembinaan kedisiplinan kerja industri.',
          focus: ['Riset Kendaraan Hemat Energi', 'Bengkel Modifikasi Mesin', 'Solidarity Forever Kaderisasi'],
        },
        {
          name: 'HMK (Himpunan Mahasiswa Kimia)',
          abbr: 'HMK PNL',
          scope: 'Jurusan Teknik Kimia PNL',
          tagline: 'Riset Proses Terapan, Petrokimia & Inovasi Energi Terbarukan',
          description:
            'Mewadahi riset teknologi pengolahan minyak dan gas bumi, seminar industri petrokimia, inovasi pembuatan sabun/biogas ramah lingkungan, dan perlombaan chemical process engineering.',
          focus: ['Chemical Innovation Expo', 'Kajian Industri Migas Terapan', 'Pemberdayaan Produk Kimia Lokal'],
        },
        {
          name: 'HME (Himpunan Mahasiswa Elektro)',
          abbr: 'HME PNL',
          scope: 'Jurusan Teknik Elektro PNL',
          tagline: 'Energi Tanpa Batas, Otomasi Listrik & Telekomunikasi Modern',
          description:
            'Menyelenggarakan workshop PLC/SCADA, pelatihan instalasi panel surya (PLTS), perakitan mikrokontroler IoT cerdas, dan pengabdian perbaikan instalasi listrik fasilitas umum.',
          focus: ['Pelatihan PLC SCADA Industri', 'Riset Energi Surya Mandiri', 'Lomba Rangkaian Elektronika'],
        },
        {
          name: 'HIMABIS (Himpunan Mahasiswa Bisnis)',
          abbr: 'HIMABIS PNL',
          scope: 'Jurusan Bisnis PNL',
          tagline: 'Kewirausahaan Kreatif, Akuntansi Syariah & Digital Marketing',
          description:
            'Pusat pengembangan jiwa entrepreneur vokasi, simulasi perbankan syariah, inkubator bisnis mahasiswa, pelatihan perpajakan digital, dan kepemimpinan manajerial bisnis modern.',
          focus: ['Business Plan Competition', 'Pelatihan Pajak & Accurate', 'Bazar Kewirausahaan Terapan'],
        },
      ],
    },
    {
      id: 'unit-kegiatan-mahasiswa',
      title: 'Unit Kegiatan Mahasiswa (UKM)',
      shortTitle: 'Unit Kegiatan Mahasiswa (UKM)',
      subtitle: 'Pengembangan Minat, Bakat, Riset, Seni & Olahraga Lintas Jurusan',
      badge: '7 Klaster UKM',
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
      tabCornerClass: 'bg-teal-700',
      folderBorderClass: 'border-emerald-300 hover:border-emerald-500',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white',
      icon: <Trophy className="w-6 h-6" />,
      items: [
        {
          name: 'POLICY (Polytechnic Linux Community)',
          abbr: 'POLICY PNL',
          scope: 'Komunitas Riset Open Source & Cyber Security',
          tagline: 'Pengembangan Linux, Jaringan, Pemrograman & Keamanan Siber',
          description:
            'Komunitas mahasiswa yang berfokus pada teknologi informasi berbasis open source (Linux), sistem operasi bebas, pemrograman backend/frontend, keamanan siber (CTF), dan infrastruktur server mandiri.',
          focus: ['Linux System Administration', 'Ethical Hacking & Cyber Defense', 'Open Source Software Dev'],
        },
        {
          name: 'POLYROBOCOM (Polytechnic Robotic Community)',
          abbr: 'POLYROBOCOM',
          scope: 'Komunitas Riset Robotika & IoT',
          tagline: 'Riset Robotika, Elektronika Cerdas, IoT & Kontes Robot Nasional',
          description:
            'UKM bergengsi yang bergerak di bidang rancang bangun robot otonom, kecerdasan buatan robotik, elektronika mikrokontroler, dan mewakili PNL secara rutin dalam Kontes Robot Indonesia (KRI).',
          focus: ['Kontes Robot Indonesia (KRI)', 'Sistem Cerdas Artificial Intelligence', 'Internet of Things (IoT)'],
        },
        {
          name: 'IECLOP (Improving English Club of Polytechnic)',
          abbr: 'IECLOP PNL',
          scope: 'Pengembangan Bahasa Internasional & Komunikasi',
          tagline: 'Debate, Speech, Storytelling, Newscasting & International Readiness',
          description:
            'Wadah peningkatan kompetensi bahasa Inggris mahasiswa PNL untuk persiapan kompetisi debat nasional (NUDC/KDMI), public speaking, TOEFL preparation, dan pertukaran internasional.',
          focus: ['Parliamentary English Debate', 'Public Speaking & Speech Contest', 'TOEFL Preparation Class'],
        },
        {
          name: 'LDK-FORDIMA (Forum Diskusi Islam Mahasiswa)',
          abbr: 'LDK-FORDIMA',
          scope: 'Lembaga Dakwah & Keislaman Kampus',
          tagline: 'Kajian Keislaman, Syiar Moral, Kaderisasi & Kepedulian Sosial',
          description:
            'Lembaga dakwah kampus yang menyelenggarakan kajian tematik rutin, pembinaan akhlak islami, peringatan hari besar Islam, dan bakti sosial bantuan kemanusiaan bagi masyarakat luas.',
          focus: ['Kajian Intelektual Muslim', 'Bakti Sosial & Tanggap Bencana', 'Mentoring Kepribadian Islami'],
        },
        {
          name: 'UKM-PA Edelweis (Pecinta Alam)',
          abbr: 'UKM-PA Edelweis',
          scope: 'Pecinta Alam & Konservasi Lingkungan',
          tagline: 'Pendakian Gunung, Konservasi Alam, Search and Rescue (SAR)',
          description:
            'Organisasi pecinta alam yang aktif dalam penjelajahan alam bebas, penanaman mangrove pesisir, susur gua dan tebing, serta tim terlatih Search and Rescue (SAR) penanggulangan bencana.',
          focus: ['Mountaineering & Rock Climbing', 'Konservasi Lingkungan Pesisir', 'Search and Rescue (SAR)'],
        },
        {
          name: 'UKM Sanggar Seni PNL',
          abbr: 'Sanggar Seni PNL',
          scope: 'Seni Musik, Teater & Kebudayaan Tradisional',
          tagline: 'Tari Tradisional Aceh, Musik Kreatif, Teater & Festival Budaya',
          description:
            'Wadah pelestarian warisan seni budaya Aceh (seperti Tari Saman, Ranup Lampuan, Rapai Geleng), produksi teater modern, paduan suara kampus, dan penyelenggara Festival Seni Aneuk Nanggroe.',
          focus: ['Tari Kreasi & Tradisional Aceh', 'Band & Musik Tradisional Rapai', 'Festival Aneuk Nanggroe'],
        },
        {
          name: 'UKM Olahraga & Bela Diri (Taekwondo & Merpati Putih)',
          abbr: 'UKM Bela Diri PNL',
          scope: 'Pembinaan Atlet Mahasiswa & Kesehatan Raga',
          tagline: 'Pencak Silat Merpati Putih, Taekwondo & Kejuaraan Atlet Nasional',
          description:
            'Wadah pembinaan kebugaran jasmani, mental tangguh, dan pembibitan atlet bela diri mahasiswa yang secara konsisten menyumbangkan medali emas dan perak di ajang PORSENI Politeknik se-Indonesia.',
          focus: ['Taekwondo Kyorugi & Poomsae', 'Pencak Silat Bela Diri Tangan Kosong', 'Persiapan PORSENI Nasional'],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      {/* 0. TOP SCROLL PAGE TRANSITION PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-brand-500 to-indigo-600 z-[60] origin-left shadow-xs"
        style={{ scaleX }}
      />

      {/* NAVIGATION BAR (TRANSPARENT WITH SOFT WHITE HIGHLIGHT HOVER & ACTIVE TRANSITION) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isScrolled
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white/20 backdrop-blur-md text-white border border-white/30'
              }`}
            >
              <GraduationCap className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span
                className={`font-black text-xl tracking-tight transition-colors ${
                  isScrolled ? 'text-navy' : 'text-white drop-shadow-md'
                }`}
              >
                PNL<span className="text-cyan-400">Connect</span>
              </span>
              <span
                className={`block text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  isScrolled ? 'text-slate-500' : 'text-white/80'
                }`}
              >
                Politeknik Negeri Lhokseumawe
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a
              href="#fitur"
              className={`relative py-1.5 transition-colors ${
                isScrolled
                  ? activeSection === 'fitur'
                    ? 'text-brand-600 font-extrabold'
                    : 'text-slate-600 hover:text-brand-600'
                  : activeSection === 'fitur'
                  ? 'text-white font-extrabold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Platform Features</span>
              {activeSection === 'fitur' && (
                <motion.span
                  layoutId="navActiveGlidingLine"
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                    isScrolled
                      ? 'bg-brand-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                      : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>

            <a
              href="#jurusan"
              className={`relative py-1.5 transition-colors ${
                isScrolled
                  ? activeSection === 'jurusan'
                    ? 'text-brand-600 font-extrabold'
                    : 'text-slate-600 hover:text-brand-600'
                  : activeSection === 'jurusan'
                  ? 'text-white font-extrabold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Jurusan PNL</span>
              {activeSection === 'jurusan' && (
                <motion.span
                  layoutId="navActiveGlidingLine"
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                    isScrolled
                      ? 'bg-brand-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                      : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>

            <a
              href="#organisasi"
              className={`relative py-1.5 transition-colors ${
                isScrolled
                  ? activeSection === 'organisasi'
                    ? 'text-brand-600 font-extrabold'
                    : 'text-slate-600 hover:text-brand-600'
                  : activeSection === 'organisasi'
                  ? 'text-white font-extrabold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Organisasi PNL</span>
              {activeSection === 'organisasi' && (
                <motion.span
                  layoutId="navActiveGlidingLine"
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                    isScrolled
                      ? 'bg-brand-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                      : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>

            <Link
              to="/verify"
              className={`relative py-1.5 transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Verify Certificate</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                isScrolled
                  ? 'text-brand-600 hover:text-brand-700 hover:bg-brand-50'
                  : 'text-white hover:bg-white/15 border border-white/25 backdrop-blur-xs shadow-xs'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all transform hover:scale-105"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION WITH REAL PNL CAMPUS VIDEO & BALANCED DARK/BLACK TRANSPARENT OVERLAY */}
      <section className="relative overflow-hidden pt-28 pb-24 sm:pt-32 lg:pt-36 lg:pb-36 bg-slate-950">
        {/* Layer 0: Real PNL Campus Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          poster="/images/pnl-campus-real.jpg"
        >
          <source src="/videos/hero_campus.mp4" type="video/mp4" />
        </video>

        {/* Layer 1: Balanced Dark Transparent Layer Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.40) 0%, rgba(15, 23, 42, 0.50) 50%, rgba(15, 23, 42, 0.65) 100%)',
          }}
        />

        {/* Layer 2: Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center">
            <motion.div {...scrollAnim(0.1)} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6 shadow-md">
                <span>Next-Generation Higher Education Digital Ecosystem - Politeknik Negeri Lhokseumawe</span>
              </div>
            </motion.div>

            <motion.h1
              {...scrollAnim(0.2)}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.75), 0 2px 4px rgba(0, 0, 0, 0.9)',
              }}
            >
              Everything Your Campus Needs, <span className="text-cyan-400">Connected.</span>
            </motion.h1>

            <motion.p
              {...scrollAnim(0.3)}
              className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed font-medium"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              Ekosistem digital terpadu Politeknik Negeri Lhokseumawe yang menghubungkan mahasiswa, dosen, ormawa, dan 6 jurusan dalam satu platform cerdas.
            </motion.p>

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
              <a
                href="#jurusan"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
                className="px-8 py-3.5 hover:bg-white/20 backdrop-blur-md font-bold rounded-2xl shadow-sm text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <FolderOpen className="w-5 h-5" />
                Jelajahi 6 Jurusan & 29 Prodi
              </a>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
              {[
                { number: '6 Jurusan', desc: 'Pendidikan Vokasi Unggulan' },
                { number: '29 Prodi', desc: 'D3, D4 & Magister Terapan' },
                { number: '30+ Ormawa', desc: 'DPM, BEM, HMJ & UKM PNL' },
                { number: '10k+ Sertifikat', desc: 'Terverifikasi Digital Real-Time' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  {...scrollAnim(0.1 + i * 0.1)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
                  }}
                  className="p-5 rounded-2xl flex flex-col justify-between"
                >
                  <p
                    className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {stat.number}
                  </p>
                  <p
                    className="text-xs sm:text-sm font-semibold text-white/90 mt-1"
                    style={{
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {stat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            {/* Page 1 to Page 2 Transition Cue: Eksplor Fitur Platform */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-12 flex justify-center"
            >
              <a
                href="#fitur"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs sm:text-sm font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Eksplor Fitur Platform</span>
                <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform animate-bounce" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES HIGHLIGHT WITH DYNAMIC CLIP WIPE TRANSITION */}
      <motion.section
        id="fitur"
        initial={{
          clipPath: 'polygon(0% 75px, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 0.95,
        }}
        whileInView={{
          clipPath: 'polygon(0% 0px, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 1,
        }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative -mt-10 sm:-mt-14 pt-28 sm:pt-32 pb-24 bg-white border-b border-slate-200/60 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.18)]"
      >
        {/* Leading Edge Clip Wipe Laser Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, amount: 0.12 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-brand-500 to-indigo-600 shadow-[0_0_16px_rgba(6,182,212,0.9)] origin-left z-30"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 15, clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: false, amount: 0.18 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest text-center"
            >
              Infrastruktur Kampus Vokasi Terpadu
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18, clipPath: 'inset(50% 0 0 0)' }}
              whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: false, amount: 0.18 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Fitur Lengkap untuk Civitas Politeknik Negeri Lhokseumawe
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.18 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed"
            >
              Dirancang untuk memfasilitasi kebutuhan administrasi kegiatan kemahasiswaan, peminjaman sarana laboratorium praktikum, dan verifikasi sertifikasi vokasi dalam satu pintu.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25, clipPath: 'inset(16% 0 0 0)' }}
                whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: 0.05 + (idx % 3) * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
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
      </motion.section>

      {/* ========================================================================= */}
      {/* 3. JURUSAN & 29 PRODI: 6 PHYSICAL FOLDER CARDS (HOVER RAISES PRODI SHEETS, CLICK OPENS ONLY 1 PRODI) */}
      {/* ========================================================================= */}
      <section
        id="jurusan"
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 50%, #F5F9FE 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <motion.h2
                {...scrollAnim(0.1)}
                className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1.5"
              >
                <Folder className="w-4 h-4 text-brand-600" />
                <span>Arsip 6 Jurusan & 29 Program Studi Unggulan PNL</span>
              </motion.h2>
              <motion.p
                {...scrollAnim(0.2)}
                className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
              >
                Folder Jurusan & Program Studi
              </motion.p>
            </div>
          </div>

          {/* 6 JURUSAN FOLDER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pnlDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                className="relative group select-none pt-8 focus:outline-hidden"
              >
                {/* 1. TOP FOLDER TAB (Lekukan Map di Bagian Atas Kiri) */}
                <div className="absolute top-0 left-4 z-20 flex items-end">
                  <div
                    className={`h-9 px-5 rounded-t-2xl font-black text-xs tracking-wider flex items-center gap-2 shadow-sm ${dept.tabClass}`}
                  >
                    <Folder className="w-3.5 h-3.5 text-white" />
                    <span className="text-white drop-shadow-xs font-mono">{dept.code}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    <span className="text-white/90 text-[10px] font-sans font-bold">{dept.badge}</span>
                  </div>
                  {/* Folder Tab Corner Angle */}
                  <div
                    className={`w-5 h-9 ${dept.tabCornerClass} [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-90`}
                  />
                </div>

                {/* 2. PEEKING DOCUMENT PAPERS (Kertas Berkas Terangkat Keluar Map Saat Kursor Diarahkan) */}
                <div className="absolute inset-x-8 top-3 h-28 bg-slate-200/90 rounded-2xl rotate-[-2.5deg] transition-all duration-300 group-hover:-translate-y-5 group-hover:rotate-[-4deg] shadow-xs pointer-events-none" />
                <div className="absolute inset-x-6 top-4 h-28 bg-slate-100 rounded-2xl rotate-[2deg] transition-all duration-300 group-hover:-translate-y-6 group-hover:rotate-[3.5deg] shadow-xs border-t border-slate-300/60 pointer-events-none" />
                {/* Top Sheet: Sliding up high with real prodi badge hints */}
                <div className="absolute inset-x-4 top-5 h-28 bg-white rounded-2xl transition-all duration-300 group-hover:-translate-y-7 shadow-md border-t-2 border-brand-500/40 p-3 px-5 flex items-start justify-between pointer-events-none">
                  <span className="text-[11px] font-extrabold text-brand-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {dept.programs.length} Berkas Program Studi
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {dept.labsCount}
                  </span>
                </div>

                {/* 3. FOLDER FRONT POCKET / COVER */}
                <div
                  className={`relative z-20 rounded-3xl rounded-tl-none overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border-2 ${dept.folderBorderClass} bg-gradient-to-b ${dept.folderBgClass} p-6 sm:p-7 flex flex-col justify-between min-h-[340px]`}
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-white/60" />

                  <div>
                    {/* Folder Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${dept.iconBoxClass}`}>
                        {dept.icon}
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[10px] font-extrabold font-mono tracking-wider uppercase text-slate-700 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs">
                          {dept.programs.length} PRODI TERDAFTAR
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 leading-snug">
                      {dept.name}
                    </h3>

                    <p className={`text-xs font-bold ${dept.headerAccent} mt-1 line-clamp-1`}>
                      {dept.tagline}
                    </p>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>

                    {/* INTERACTIVE PRODI LIST (Pilih 1 Prodi untuk Membuka Detailnya) */}
                    <div className="mt-4 space-y-2">
                      {dept.programs.map((prog, pIdx) => (
                        <motion.button
                          key={pIdx}
                          type="button"
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedProdi({ dept, program: prog })}
                          className="w-full text-left p-2.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-brand-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group/p cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono shrink-0 ${
                                prog.level === 'D4'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : prog.level === 'S2'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {prog.level}
                            </span>
                            <span className="text-xs font-bold text-slate-800 group-hover/p:text-brand-600 truncate">
                              {prog.name.replace(/^(D3|D4|S2)\s*(\(Sarjana Terapan\)|\(Magister Terapan\))?\s*/i, '')}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/p:text-brand-600 group-hover/p:translate-x-0.5 transition-all shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Folder Bottom Indicator - NO "Buka Berkas" & NO "Klik untuk buka prodi" */}
                  <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <FolderOpen className="w-4 h-4 text-brand-600" />
                      <span>{dept.labsCount}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ORGANISASI MAHASISWA PNL (CLICK ON ANY ORMAWA OPENS ONLY 1 ORMAWA) */}
      {/* ========================================================================= */}
      <section
        id="organisasi"
        className="py-24 border-t border-slate-200/70"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FE 50%, #FFFFFF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              <Users2 className="w-4 h-4 text-brand-600" />
              <span>Ekosistem Kemahasiswaan & Kepemimpinan Vokasi</span>
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Folder Organisasi Mahasiswa PNL
            </motion.p>
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed"
            >
              Terbagi dalam 3 pilar: <strong>Lembaga Eksekutif & Legislatif Kampus</strong>, <strong>Himpunan Mahasiswa Jurusan (HMJ)</strong>, dan <strong>Unit Kegiatan Mahasiswa (UKM)</strong>. Klik pada salah satu organisasi untuk melihat profil rincinya.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pnlOrgCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                {...scrollAnim(0.1 + idx * 0.15)}
                className="relative group select-none pt-8 focus:outline-hidden"
              >
                {/* 1. TOP FOLDER TAB */}
                <div className="absolute top-0 left-4 z-20 flex items-end">
                  <div
                    className={`h-9 px-5 rounded-t-2xl font-black text-xs tracking-wider flex items-center gap-2 shadow-sm ${cat.tabClass}`}
                  >
                    <Folder className="w-3.5 h-3.5 text-white" />
                    <span className="text-white drop-shadow-xs font-mono">FOLDER #{idx + 1}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    <span className="text-white/90 text-[10px] font-sans font-bold">{cat.badge}</span>
                  </div>
                  <div
                    className={`w-5 h-9 ${cat.tabCornerClass} [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-90`}
                  />
                </div>

                {/* 2. PEEKING DOCUMENT PAPERS */}
                <div className="absolute inset-x-8 top-3 h-28 bg-slate-200/90 rounded-2xl rotate-[-2.5deg] transition-all duration-300 group-hover:-translate-y-5 group-hover:rotate-[-4deg] shadow-xs pointer-events-none" />
                <div className="absolute inset-x-6 top-4 h-28 bg-slate-100 rounded-2xl rotate-[2deg] transition-all duration-300 group-hover:-translate-y-6 group-hover:rotate-[3.5deg] shadow-xs border-t border-slate-300/60 pointer-events-none" />
                <div className="absolute inset-x-4 top-5 h-28 bg-white rounded-2xl transition-all duration-300 group-hover:-translate-y-7 shadow-md border-t-2 border-brand-500/40 p-3 px-5 flex items-start justify-between pointer-events-none">
                  <span className="text-[11px] font-extrabold text-brand-600 flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5" />
                    {cat.items.length} Unit Organisasi Resmi
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Resmi PNL
                  </span>
                </div>

                {/* 3. FOLDER MAIN COVER */}
                <div
                  className={`relative z-20 rounded-3xl rounded-tl-none overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border-2 ${cat.folderBorderClass} bg-gradient-to-b ${cat.folderBgClass} p-6 sm:p-7 flex flex-col justify-between min-h-[340px]`}
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-white/60" />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${cat.iconBoxClass}`}>
                        {cat.icon}
                      </div>
                      <span className="inline-block text-[10px] font-extrabold font-mono tracking-wider uppercase text-slate-700 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs">
                        {cat.items.length} ORGANISASI
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 leading-snug">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cat.subtitle}
                    </p>

                    {/* Organization Items List */}
                    <div className="mt-4 space-y-2">
                      {cat.items.map((item, iIdx) => (
                        <motion.button
                          key={iIdx}
                          type="button"
                          whileHover={{ x: 4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOrgItem({ category: cat, item })}
                          className="w-full text-left p-2.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 hover:border-brand-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group/o cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-extrabold text-xs text-slate-900 group-hover/o:text-brand-600">
                              {item.abbr}
                            </span>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md truncate">
                              {item.scope}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/o:text-brand-600 group-hover/o:translate-x-0.5 transition-all shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Folder Bottom Indicator - NO "Buka Berkas" & NO "Klik untuk buka..." */}
                  <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <FolderOpen className="w-4 h-4 text-brand-600" />
                      <span>Arsip Ormawa PNL</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: SINGLE PRODI DETAIL (ONLY 1 PRODI OPENS WITH SIMPLE ANIMATION) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedProdi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Simple Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedProdi(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Simple Clean Modal (Only this 1 prodi is shown) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto text-left flex flex-col"
            >
              {/* Top Header with Department Color */}
              <div
                className={`px-6 py-4.5 text-white flex items-center justify-between ${selectedProdi.dept.tabClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black shadow-xs">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black tracking-widest uppercase opacity-90 block">
                      BERKAS PROGRAM STUDI • {selectedProdi.dept.badge}
                    </span>
                    <h3 className="text-sm font-bold text-white/95">
                      {selectedProdi.dept.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProdi(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content of THIS 1 PRODI ONLY */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black uppercase font-mono border ${
                        selectedProdi.program.level === 'D4'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : selectedProdi.program.level === 'S2'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {selectedProdi.program.level} • {selectedProdi.program.levelLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {selectedProdi.program.duration} • {selectedProdi.program.sks}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {selectedProdi.program.name}
                  </h2>
                </div>

                {/* Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Profil & Deskripsi Kompetensi:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedProdi.program.description}
                  </p>
                </div>

                {/* Career prospects */}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2.5">
                    Peluang Karir & Profesi Utama:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProdi.program.career.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        💼 {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lab facilities */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Lab: {selectedProdi.program.lab}</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block self-start sm:self-auto">
                    Akreditasi Unggul PNL
                  </span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 px-6 sm:px-8 bg-slate-900 text-white flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px]">
                  Terdaftar resmi PDDIKTI & Vokasi Nasional.
                </span>
                <button
                  onClick={() => setSelectedProdi(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700 cursor-pointer"
                >
                  Tutup Berkas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: SINGLE ORGANISASI DETAIL (ONLY 1 ORMAWA OPENS WITH SIMPLE ANIMATION) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedOrgItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedOrgItem(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Simple Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto text-left flex flex-col"
            >
              {/* Header */}
              <div
                className={`px-6 py-4.5 text-white flex items-center justify-between ${selectedOrgItem.category.tabClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black shadow-xs">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black tracking-widest uppercase opacity-90 block">
                      ARSIP ORMAWA • {selectedOrgItem.category.badge}
                    </span>
                    <h3 className="text-sm font-bold text-white/95">
                      {selectedOrgItem.category.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrgItem(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content of THIS 1 ORMAWA ONLY */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black font-mono bg-navy text-white uppercase">
                      {selectedOrgItem.item.abbr}
                    </span>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      {selectedOrgItem.item.scope}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {selectedOrgItem.item.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-brand-700 mt-1">
                    {selectedOrgItem.item.tagline}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Visi & Profil Kegiatan:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedOrgItem.item.description}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2.5">
                    Fokus Utama & Bidang Pengembangan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrgItem.item.focus.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Ormawa Resmi PNL
                  </span>
                  <Link
                    to="/login"
                    className="font-extrabold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    Masuk Portal Ormawa →
                  </Link>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 px-6 sm:px-8 bg-slate-900 text-white flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px]">
                  Terdaftar di bawah Wakil Direktur Kemahasiswaan PNL.
                </span>
                <button
                  onClick={() => setSelectedOrgItem(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700 cursor-pointer"
                >
                  Tutup Berkas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER (MODERN FRESH CAMPUS BLUE - NOT TOO DARK) */}
      <footer
        style={{ backgroundColor: '#1D4ED8' }}
        className="py-12 text-white border-t border-blue-400/30 shadow-inner"
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
            <a href="#jurusan" style={{ color: '#FFFFFF' }} className="hover:text-cyan-300 transition-colors">
              6 Jurusan & 29 Prodi
            </a>
            <a href="#organisasi" style={{ color: '#FFFFFF' }} className="hover:text-cyan-300 transition-colors">
              Ormawa PNL
            </a>
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
