import React, { useState, useEffect } from 'react';
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
  Folder,
  FolderOpen,
  FileText,
  X,
  ChevronRight,
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
import { motion, AnimatePresence } from 'framer-motion';

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
  tabInactiveClass: string;
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
  folderBorderClass: string;
  folderBgClass: string;
  iconBoxClass: string;
  icon: React.ReactNode;
  items: OrgItem[];
}

export const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Single Active Folder States (Tabs Selection at top)
  const [activeDeptId, setActiveDeptId] = useState<number>(1);
  const [prodiFilter, setProdiFilter] = useState<string>('all');

  const [activeOrgCatId, setActiveOrgCatId] = useState<string>('eksekutif-legislatif');
  const [searchOrg, setSearchOrg] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth cubic-bezier transition curve
  const easeCubic: any = [0.22, 1, 0.36, 1];

  // Repeatable scroll animation configuration
  const scrollAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.15 },
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
      title: 'Peminjaman Alat & Fasilitas Kampus',
      desc: 'Peminjaman proyektor, laboratorium komputer, bengkel mesin, ruang aula, hingga alat praktikum dengan verifikasi digital.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verifikasi Sertifikat Digital & SKPI',
      desc: 'Penerbitan e-sertifikat kegiatan ber-QR code dan hash anti-pemalsuan untuk rekaman SKPI & portfolio mahasiswa.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
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
  // DATA 6 JURUSAN DENGAN WARNA SESUAI PERMINTAAN:
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
      tabClass: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25',
      tabInactiveClass: 'hover:text-purple-600 hover:border-purple-300',
      folderBorderClass: 'border-purple-300',
      folderBgClass: 'from-purple-50/70 via-white to-violet-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-purple-600 to-indigo-700',
      headerAccent: 'text-purple-700',
      icon: <Cpu className="w-6 h-6 text-white" />,
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
      tabClass: 'bg-gradient-to-r from-[#8B4513] to-[#5C2E0B] text-white shadow-lg shadow-amber-950/25',
      tabInactiveClass: 'hover:text-[#8B4513] hover:border-amber-700/40',
      folderBorderClass: 'border-amber-700/40',
      folderBgClass: 'from-[#FAF5F0] via-white to-[#FDF8F3]',
      iconBoxClass: 'bg-gradient-to-tr from-[#8B4513] to-[#5C2E0B]',
      headerAccent: 'text-[#7A3E1D]',
      icon: <Building className="w-6 h-6 text-white" />,
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
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25',
      tabInactiveClass: 'hover:text-blue-600 hover:border-blue-300',
      folderBorderClass: 'border-blue-300',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-700',
      headerAccent: 'text-blue-700',
      icon: <Wrench className="w-6 h-6 text-white" />,
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
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25',
      tabInactiveClass: 'hover:text-emerald-600 hover:border-emerald-300',
      folderBorderClass: 'border-emerald-300',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-700',
      headerAccent: 'text-emerald-700',
      icon: <FlaskConical className="w-6 h-6 text-white" />,
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
      tabClass: 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/25',
      tabInactiveClass: 'hover:text-red-600 hover:border-red-300',
      folderBorderClass: 'border-red-300',
      folderBgClass: 'from-red-50/70 via-white to-rose-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-red-600 to-rose-700',
      headerAccent: 'text-red-700',
      icon: <Zap className="w-6 h-6 text-white" />,
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
      tabClass: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25',
      tabInactiveClass: 'hover:text-orange-600 hover:border-orange-300',
      folderBorderClass: 'border-orange-300',
      folderBgClass: 'from-orange-50/70 via-white to-amber-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-orange-500 to-amber-600',
      headerAccent: 'text-orange-700',
      icon: <Briefcase className="w-6 h-6 text-white" />,
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

  // Active Department Object
  const currentDept = pnlDepartments.find((d) => d.id === activeDeptId) || pnlDepartments[0];

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
      tabClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25',
      folderBorderClass: 'border-amber-300',
      folderBgClass: 'from-amber-50/70 via-white to-orange-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      icon: <Landmark className="w-6 h-6 text-white" />,
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
      shortTitle: '6 Himpunan Jurusan (HMJ)',
      subtitle: 'Wadah Aspirasi, Soliditas & Keilmuan di Tingkat Jurusan',
      badge: '6 Himpunan Jurusan',
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25',
      folderBorderClass: 'border-blue-300',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-700',
      icon: <Layers className="w-6 h-6 text-white" />,
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
      shortTitle: '7 Klaster UKM Minat & Bakat',
      subtitle: 'Pengembangan Minat, Bakat, Riset, Seni & Olahraga Lintas Jurusan',
      badge: '7 Klaster UKM',
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25',
      folderBorderClass: 'border-emerald-300',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/30',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-700',
      icon: <Trophy className="w-6 h-6 text-white" />,
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

  const currentOrgCat = pnlOrgCategories.find((c) => c.id === activeOrgCatId) || pnlOrgCategories[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      {/* NAVIGATION BAR (TRANSPARENT WITH SOFT WHITE HIGHLIGHT HOVER) */}
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
              className={`relative py-1.5 transition-colors group ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Platform Features</span>
              <span
                className={`absolute bottom-0 left-0 w-0 h-[2.5px] rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  isScrolled ? 'bg-brand-600' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                }`}
              />
            </a>

            <a
              href="#jurusan"
              className={`relative py-1.5 transition-colors group ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Jurusan PNL</span>
              <span
                className={`absolute bottom-0 left-0 w-0 h-[2.5px] rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  isScrolled ? 'bg-brand-600' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                }`}
              />
            </a>

            <a
              href="#organisasi"
              className={`relative py-1.5 transition-colors group ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Organisasi PNL</span>
              <span
                className={`absolute bottom-0 left-0 w-0 h-[2.5px] rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  isScrolled ? 'bg-brand-600' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                }`}
              />
            </a>

            <Link
              to="/verify"
              className={`relative py-1.5 transition-colors group ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Verify Certificate</span>
              <span
                className={`absolute bottom-0 left-0 w-0 h-[2.5px] rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  isScrolled ? 'bg-brand-600' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                }`}
              />
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
        {/* Layer 0: Real PNL Campus Video (Uploaded by User) */}
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
                Jelajahi Folder 6 Jurusan
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
          </div>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES HIGHLIGHT */}
      <section id="fitur" className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Infrastruktur Kampus Vokasi Terpadu</span>
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Fitur Lengkap untuk Civitas Politeknik Negeri Lhokseumawe
            </motion.p>
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed"
            >
              Dirancang untuk memfasilitasi kebutuhan administrasi kegiatan kemahasiswaan, peminjaman sarana laboratorium praktikum, dan verifikasi sertifikasi vokasi dalam satu pintu.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* ========================================================================= */}
      {/* 3. JURUSAN & 29 PRODI: SINGLE OPEN FOLDER WITH SCROLLABLE TABS AT TOP */}
      {/* ========================================================================= */}
      <section
        id="jurusan"
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 50%, #F5F9FE 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              <Folder className="w-4 h-4 text-brand-600" />
              <span>Arsip 6 Jurusan & 29 Program Studi Unggulan PNL</span>
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Folder Program Studi Politeknik Negeri Lhokseumawe
            </motion.p>
            <motion.p
              {...scrollAnim(0.25)}
              className="mt-2 text-sm text-slate-600"
            >
              Geser atau pilih <strong>tab map jurusan di bagian atas</strong> untuk membuka berkas program studi, kurikulum vokasi, dan prospek karir lulusan.
            </motion.p>
          </div>

          {/* ===================================================================== */}
          {/* THE SINGLE FOLDER STAGE: TOP SCROLLABLE TABS + OPEN FOLDER INTERIOR */}
          {/* ===================================================================== */}
          <div className="relative max-w-5xl mx-auto pt-4">
            {/* 1. HORIZONTAL SCROLLABLE FOLDER TABS BAR AT TOP */}
            <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none px-2 sm:px-4 pb-0 z-20">
              {pnlDepartments.map((dept) => {
                const isActive = activeDeptId === dept.id;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setActiveDeptId(dept.id);
                      setProdiFilter('all');
                    }}
                    className={`shrink-0 transition-all duration-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-2xl border-t-2 border-x-2 select-none cursor-pointer ${
                      isActive
                        ? `${dept.tabClass} border-transparent translate-y-[2px] z-30 scale-100 sm:scale-105`
                        : `bg-white hover:bg-slate-50 text-slate-600 border-slate-200/90 z-10 ${dept.tabInactiveClass}`
                    }`}
                  >
                    <Folder className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="font-mono">{dept.code}</span>
                    <span className="hidden md:inline font-sans font-bold text-xs opacity-90">
                      • {dept.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {dept.programs.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. THE MAIN OPEN FOLDER BODY */}
            <div
              className={`relative z-20 rounded-3xl overflow-hidden shadow-2xl border-2 ${currentDept.folderBorderClass} bg-gradient-to-b ${currentDept.folderBgClass} transition-colors duration-500`}
            >
              {/* Folder Top Rim Highlight */}
              <div className="h-2 w-full bg-white/70" />

              {/* Department Header Inside the Open Folder */}
              <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${currentDept.iconBoxClass} shrink-0`}
                  >
                    {currentDept.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-3 py-0.5 rounded-md text-[11px] font-black font-mono bg-navy text-white uppercase">
                        {currentDept.badge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        Warna: {currentDept.colorName}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        • {currentDept.labsCount}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {currentDept.name}
                    </h3>
                    <p className={`text-xs sm:text-sm font-bold ${currentDept.headerAccent} mt-0.5`}>
                      {currentDept.tagline}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
                      {currentDept.description}
                    </p>
                  </div>
                </div>

                {/* Level Filter Tabs Inside the Active Folder */}
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 self-start md:self-center shrink-0 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <button
                    onClick={() => setProdiFilter('all')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      prodiFilter === 'all'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Semua ({currentDept.programs.length})
                  </button>
                  <button
                    onClick={() => setProdiFilter('D4')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      prodiFilter === 'D4'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    D4 Sarjana Terapan
                  </button>
                  <button
                    onClick={() => setProdiFilter('D3')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      prodiFilter === 'D3'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    D3 Ahli Madya
                  </button>
                  {currentDept.programs.some((p) => p.level === 'S2') && (
                    <button
                      onClick={() => setProdiFilter('S2')}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        prodiFilter === 'S2'
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-brand-600'
                      }`}
                    >
                      S2 Magister
                    </button>
                  )}
                </div>
              </div>

              {/* 3. PROGRAM STUDI DOSSIER SHEETS (EMERGING OUT OF FOLDER ANIMATION) */}
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-brand-600 font-extrabold">
                    <FileText className="w-4 h-4" />
                    Berkas Program Studi Aktif di Map {currentDept.shortName}:
                  </span>
                  <span>
                    {
                      currentDept.programs.filter((p) => prodiFilter === 'all' || p.level === prodiFilter)
                        .length
                    }{' '}
                    Berkas Ditampilkan
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDept.id + '-' + prodiFilter}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    {currentDept.programs
                      .filter((p) => (prodiFilter === 'all' ? true : p.level === prodiFilter))
                      .map((prog, idx) => (
                        <motion.div
                          key={prog.name}
                          initial={{ y: 80, opacity: 0, scale: 0.94, rotateX: 12 }}
                          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 24,
                            delay: idx * 0.07, // Staggered emerging out of folder
                          }}
                          style={{ transformPerspective: 1000 }}
                          className="relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-brand-400 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Sheet Header */}
                            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-dashed border-slate-200">
                              <span className="text-[10px] font-mono font-extrabold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-brand-500" />
                                BERKAS RESMI #{String(idx + 1).padStart(2, '0')}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${
                                  prog.level === 'D4'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : prog.level === 'S2'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {prog.level} • {prog.levelLabel}
                              </span>
                            </div>

                            <h4 className="text-lg font-black text-slate-900 leading-snug">
                              {prog.name}
                            </h4>

                            <div className="flex items-center gap-3 my-2 text-xs font-bold text-slate-500">
                              <span className="flex items-center gap-1 text-brand-600">
                                <CalendarCheck2 className="w-3.5 h-3.5" />
                                {prog.duration}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-600">
                                <Award className="w-3.5 h-3.5" />
                                {prog.sks}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                              {prog.description}
                            </p>

                            {/* Prospek Karir Utama */}
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                                Profil & Prospek Karir Lulusan:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {prog.career.map((c, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Lab Praktikum & Akreditasi (NO BUKA BERKAS BUTTON) */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-600 flex items-center gap-1.5 truncate max-w-[240px]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              {prog.lab}
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                              Akreditasi Unggul PNL
                            </span>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Folder Rim & Action */}
              <div className="p-4 px-6 sm:px-8 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Semua program studi terdaftar resmi pada PDDIKTI & terstandar akreditasi LAM-PT / BAN-PT.
                </span>
                <Link
                  to="/register?type=student"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  Daftar Mahasiswa Baru
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ORGANISASI MAHASISWA PNL: SINGLE OPEN FOLDER WITH TOP TABS */}
      {/* ========================================================================= */}
      <section
        id="organisasi"
        className="py-24 border-t border-slate-200/70"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FE 50%, #FFFFFF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
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
              Pilih tab di atas untuk melihat berkas ormawa: <strong>Lembaga Eksekutif & Legislatif Kampus</strong>, <strong>Himpunan Mahasiswa Jurusan (HMJ)</strong>, dan <strong>Unit Kegiatan Mahasiswa (UKM)</strong>.
            </motion.p>
          </div>

          <div className="relative max-w-5xl mx-auto pt-4">
            {/* 1. HORIZONTAL TABS AT TOP */}
            <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none px-2 sm:px-4 pb-0 z-20">
              {pnlOrgCategories.map((cat) => {
                const isActive = activeOrgCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveOrgCatId(cat.id);
                      setSearchOrg('');
                    }}
                    className={`shrink-0 transition-all duration-300 font-extrabold text-xs sm:text-sm flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-2xl border-t-2 border-x-2 select-none cursor-pointer ${
                      isActive
                        ? `${cat.tabClass} border-transparent translate-y-[2px] z-30 scale-100 sm:scale-105`
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/90 z-10'
                    }`}
                  >
                    <Folder className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{cat.shortTitle}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. MAIN OPEN FOLDER BODY FOR ORMAWA */}
            <div
              className={`relative z-20 rounded-3xl overflow-hidden shadow-2xl border-2 ${currentOrgCat.folderBorderClass} bg-gradient-to-b ${currentOrgCat.folderBgClass} transition-colors duration-500`}
            >
              <div className="h-2 w-full bg-white/70" />

              <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${currentOrgCat.iconBoxClass} shrink-0`}
                  >
                    {currentOrgCat.icon}
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-md text-[11px] font-black font-mono bg-navy text-white uppercase inline-block mb-1">
                      {currentOrgCat.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {currentOrgCat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {currentOrgCat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Live Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari organisasi..."
                    value={searchOrg}
                    onChange={(e) => setSearchOrg(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-brand-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. ORGANIZATIONS LIST (NO BUKA BERKAS BUTTON) */}
              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentOrgCat.id + '-' + searchOrg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    {currentOrgCat.items
                      .filter((org) =>
                        searchOrg
                          ? org.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
                            org.description.toLowerCase().includes(searchOrg.toLowerCase()) ||
                            org.abbr.toLowerCase().includes(searchOrg.toLowerCase())
                          : true
                      )
                      .map((org, oIdx) => (
                        <motion.div
                          key={org.name}
                          initial={{ y: 80, opacity: 0, scale: 0.94, rotateX: 12 }}
                          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 24,
                            delay: oIdx * 0.07,
                          }}
                          style={{ transformPerspective: 1000 }}
                          className="p-6 rounded-2xl bg-white border-2 border-slate-200/90 hover:border-brand-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-dashed border-slate-200">
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono bg-navy text-white uppercase">
                                {org.abbr}
                              </span>
                              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                                {org.scope}
                              </span>
                            </div>

                            <h5 className="font-extrabold text-base text-navy leading-snug">
                              {org.name}
                            </h5>

                            <p className="text-xs text-brand-700 font-bold mt-1">
                              {org.tagline}
                            </p>

                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                              {org.description}
                            </p>

                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                                Fokus Utama & Bidang Pengembangan:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {org.focus.map((f, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
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
                        </motion.div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 px-6 sm:px-8 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Organisasi mahasiswa terdaftar resmi di bawah naungan Wakil Direktur Bidang Kemahasiswaan & Kerjasama PNL.
                </span>
                <Link
                  to="/login"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  Portal Kegiatan Ormawa
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER (SOLID DEEP BLUE #0F296B + PURE WHITE #FFFFFF TEXT & LINKS) */}
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
