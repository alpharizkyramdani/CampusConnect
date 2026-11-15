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
  code: string;
  badge: string;
  tabClass: string;
  tabCornerClass: string;
  folderBorderClass: string;
  folderBgClass: string;
  iconBoxClass: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  labsCount: string;
  image: string;
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

  // Folder Modal States
  const [selectedDeptForFolder, setSelectedDeptForFolder] = useState<DepartmentData | null>(null);
  const [prodiFilter, setProdiFilter] = useState<string>('all');

  const [selectedOrgCategoryForFolder, setSelectedOrgCategoryForFolder] = useState<OrgCategory | null>(null);
  const [searchOrg, setSearchOrg] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDeptForFolder(null);
        setSelectedOrgCategoryForFolder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  // DATA 6 JURUSAN & 29 PROGRAM STUDI RESMI PNL
  // ==========================================
  const pnlDepartments: DepartmentData[] = [
    {
      id: 1,
      name: 'Teknologi Informasi dan Komputer (TIK)',
      code: 'JTIK',
      badge: 'JTIK-PNL',
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      tabCornerClass: 'bg-indigo-600',
      folderBorderClass: 'border-blue-200/90 group-hover:border-blue-500',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
      icon: <Cpu className="w-6 h-6 text-white" />,
      tagline: 'Rekayasa Perangkat Lunak, Jaringan Cerdas & Multimedia',
      description:
        'Pusat pendidikan vokasi keunggulan rekayasa sistem perangkat lunak, infrastruktur cloud & cyber security, kecerdasan buatan, dan konten multimedia interaktif.',
      labsCount: '6 Laboratorium Modern',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
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
      code: 'JTS',
      badge: 'JTS-PNL',
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
      tabCornerClass: 'bg-teal-700',
      folderBorderClass: 'border-emerald-200/90 group-hover:border-emerald-500',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-700',
      icon: <Building className="w-6 h-6 text-white" />,
      tagline: 'Infrastruktur Jalan Jembatan, Keairan & Gedung Tahan Gempa',
      description:
        'Keahlian perancangan dan manajemen struktur bangunan gedung bertingkat, rekayasa jalan raya jembatan, bendungan keairan, serta teknologi Building Information Modeling (BIM).',
      labsCount: '5 Lab Uji Bahan & Hidrolika',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
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
      code: 'JTM',
      badge: 'JTM-PNL',
      tabClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      tabCornerClass: 'bg-orange-600',
      folderBorderClass: 'border-amber-200/90 group-hover:border-amber-500',
      folderBgClass: 'from-amber-50/70 via-white to-orange-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      icon: <Wrench className="w-6 h-6 text-white" />,
      tagline: 'Manufaktur Presisi CNC, Pengelasan Bersertifikat & Konversi Energi',
      description:
        'Pendidikan vokasi mekanikal terkemuka: permesinan presisi CNC, pengelasan bersertifikasi internasional (AWS/CSWIP), fabrikasi logam, dan otomasi perawatan mesin industri.',
      labsCount: '7 Bengkel & Laboratorium Mesin',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
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
      code: 'JTK',
      badge: 'JTK-PNL',
      tabClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      tabCornerClass: 'bg-pink-600',
      folderBorderClass: 'border-purple-200/90 group-hover:border-purple-500',
      folderBgClass: 'from-purple-50/70 via-white to-pink-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-purple-600 to-pink-600',
      icon: <FlaskConical className="w-6 h-6 text-white" />,
      tagline: 'Rekayasa Kimia Industri, Pengolahan Migas & Bioenergi',
      description:
        'Pusat keunggulan rekayasa proses kimia, kilang pengolahan minyak dan gas bumi, bioteknologi terapan, pengelolaan limbah ramah lingkungan, dan K3 proses industri.',
      labsCount: '6 Lab Kimia & Simulasi Pabrik',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
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
      code: 'JTE',
      badge: 'JTE-PNL',
      tabClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
      tabCornerClass: 'bg-blue-600',
      folderBorderClass: 'border-sky-200/90 group-hover:border-sky-500',
      folderBgClass: 'from-sky-50/70 via-white to-blue-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-sky-500 to-blue-600',
      icon: <Zap className="w-6 h-6 text-white" />,
      tagline: 'Pembangkit Energi, Jaringan Telekomunikasi & Otomasi Mekatronika',
      description:
        'Membentuk tenaga ahli terapan dalam sistem transmisi pembangkit energi listrik, jaringan telekomunikasi pita lebar 5G, instrumentasi kendali PLC SCADA, dan robotika mekatronika.',
      labsCount: '8 Lab Energi & Otomasi',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
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
      name: 'Bisnis (Tata Niaga)',
      code: 'JTN',
      badge: 'JTN-PNL',
      tabClass: 'bg-gradient-to-r from-teal-600 to-emerald-700 text-white',
      tabCornerClass: 'bg-emerald-700',
      folderBorderClass: 'border-teal-200/90 group-hover:border-teal-500',
      folderBgClass: 'from-teal-50/70 via-white to-emerald-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-teal-600 to-emerald-700',
      icon: <Briefcase className="w-6 h-6 text-white" />,
      tagline: 'Akuntansi Syariah, Keuangan Publik & Bisnis Digital Terapan',
      description:
        'Pendidikan terapan akuntansi sektor publik, perbankan syariah modern, manajemen investasi, perpajakan, dan administrasi bisnis terdigitalisasi.',
      labsCount: '4 Lab Komputer Bisnis & Bank Mini',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
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
      subtitle: 'Pemerintahan Mahasiswa Tingkat Politeknik Negeri Lhokseumawe',
      badge: 'Pemerintahan Kampus',
      tabClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      tabCornerClass: 'bg-orange-600',
      folderBorderClass: 'border-amber-200/90 group-hover:border-amber-500',
      folderBgClass: 'from-amber-50/70 via-white to-orange-50/40',
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
      subtitle: 'Wadah Aspirasi, Soliditas & Keilmuan di Tingkat Jurusan',
      badge: '6 Himpunan Jurusan',
      tabClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      tabCornerClass: 'bg-indigo-600',
      folderBorderClass: 'border-blue-200/90 group-hover:border-blue-500',
      folderBgClass: 'from-blue-50/70 via-white to-indigo-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
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
          scope: 'Jurusan Bisnis / Tata Niaga PNL',
          tagline: 'Kewirausahaan Kreatif, Akuntansi Syariah & Digital Marketing',
          description:
            'Pusat pengembangan jiwa entrepreneur vokasi, simulasi perbankan syariah, inkubator bisnis mahasiswa, pelatihan perpajakan digital, dan kepemimpinan manajerial bisnis modern.',
          focus: ['Bussiness Plan Competition', 'Pelatihan Pajak & Accurate', 'Bazar Kewirausahaan Terapan'],
        },
      ],
    },
    {
      id: 'unit-kegiatan-mahasiswa',
      title: 'Unit Kegiatan Mahasiswa (UKM)',
      subtitle: 'Pengembangan Minat, Bakat, Riset, Seni & Olahraga Lintas Jurusan',
      badge: '7 Klaster UKM',
      tabClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
      tabCornerClass: 'bg-teal-600',
      folderBorderClass: 'border-emerald-200/90 group-hover:border-emerald-500',
      folderBgClass: 'from-emerald-50/70 via-white to-teal-50/40',
      iconBoxClass: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
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

        {/* Layer 1: Balanced Dark Transparent Layer Overlay (Video clearly visible) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.40) 0%, rgba(15, 23, 42, 0.50) 50%, rgba(15, 23, 42, 0.65) 100%)',
          }}
        />

        {/* Layer 2: Foreground Content (relative z-10) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center">
            {/* Repeatable Staggered Item 1: Badge Pill */}
            <motion.div {...scrollAnim(0.1)} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6 shadow-md">
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
                Jelajahi 6 Folder Jurusan & 29 Prodi
              </a>
            </motion.div>

            {/* Repeatable Staggered Item 5: Quick Stats Grid */}
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
      {/* 3. JURUSAN & 29 PRODI SECTION (TRUE PHYSICAL FOLDER DESIGN WITH HOVER PAPERS) */}
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
              <motion.p
                {...scrollAnim(0.25)}
                className="mt-2 text-sm text-slate-600 max-w-2xl"
              >
                Tekan pada <strong>map folder jurusan</strong> di bawah untuk membuka berkas prodi, kurikulum vokasi, dan prospek karir yang keluar langsung dari dalam folder.
              </motion.p>
            </div>
            <motion.div {...scrollAnim(0.3)} className="mt-4 md:mt-0">
              <span className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
                <span>Tekan folder untuk membuka berkas</span>
              </span>
            </motion.div>
          </div>

          {/* 6 JURUSAN - TRUE FOLDER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pnlDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                onClick={() => {
                  setSelectedDeptForFolder(dept);
                  setProdiFilter('all');
                }}
                className="relative cursor-pointer group select-none pt-8 focus:outline-hidden"
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

                {/* 2. PEEKING DOCUMENT PAPERS (Kertas Berkas Mengintip dari Belakang Map) */}
                {/* Sheet 3 (Deepest) */}
                <div className="absolute inset-x-8 top-3 h-28 bg-slate-200/90 rounded-2xl rotate-[-2.5deg] transition-all duration-300 group-hover:-translate-y-4 group-hover:rotate-[-4deg] shadow-xs" />
                {/* Sheet 2 (Middle) */}
                <div className="absolute inset-x-6 top-4 h-28 bg-slate-100 rounded-2xl rotate-[2deg] transition-all duration-300 group-hover:-translate-y-5 group-hover:rotate-[3.5deg] shadow-xs border-t border-slate-300/60" />
                {/* Sheet 1 (Front preview sheet with prodi count) */}
                <div className="absolute inset-x-4 top-5 h-28 bg-white rounded-2xl transition-all duration-300 group-hover:-translate-y-6 shadow-md border-t-2 border-brand-500/40 p-3 px-5 flex items-start justify-between">
                  <span className="text-[11px] font-extrabold text-brand-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {dept.programs.length} Berkas Program Studi
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {dept.labsCount}
                  </span>
                </div>

                {/* 3. FOLDER FRONT POCKET / COVER (Badan Depan Map Berkas) */}
                <div
                  className={`relative z-20 rounded-3xl rounded-tl-none overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 border-2 ${dept.folderBorderClass} bg-gradient-to-b ${dept.folderBgClass} p-6 sm:p-7 flex flex-col justify-between min-h-[310px]`}
                >
                  {/* Folder subtle fold line */}
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

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {dept.name}
                    </h3>

                    <p className="text-xs font-bold text-brand-700 mt-1 line-clamp-1">
                      {dept.tagline}
                    </p>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>

                    {/* Program Studi Pills Preview */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {dept.programs.map((prog, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-slate-700 border border-slate-200 shadow-2xs group-hover:border-brand-300 transition-colors"
                        >
                          <span className="text-brand-600 font-extrabold mr-1">{prog.level}</span>
                          {prog.name.replace(/^(D3|D4|S2)\s*(\(Sarjana Terapan\)|\(Magister Terapan\))?\s*/i, '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Folder Bottom Indicator (NO STANDALONE BUTTON - WHOLE CARD IS CLICKABLE) */}
                  <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 group-hover:text-brand-600 transition-colors">
                      <FolderOpen className="w-4 h-4 text-brand-600 group-hover:rotate-12 transition-transform duration-300" />
                      <span>{dept.labsCount}</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full border border-brand-200 shadow-2xs">
                      Buka Berkas
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ORGANISASI MAHASISWA PNL (3 CATEGORIES - TRUE PHYSICAL FOLDER DESIGN) */}
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
              Terbagi dalam 3 pilar: <strong>Lembaga Eksekutif & Legislatif Kampus</strong>, <strong>Himpunan Mahasiswa Jurusan (HMJ)</strong>, dan <strong>Unit Kegiatan Mahasiswa (UKM)</strong>. Tekan folder untuk membuka berkas ormawa di dalamnya.
            </motion.p>
          </div>

          {/* 3 ORGANISASI CATEGORIES - PHYSICAL FOLDERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pnlOrgCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                {...scrollAnim(0.1 + idx * 0.15)}
                onClick={() => {
                  setSelectedOrgCategoryForFolder(cat);
                  setSearchOrg('');
                }}
                className="relative cursor-pointer group select-none pt-8 focus:outline-hidden"
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
                <div className="absolute inset-x-8 top-3 h-28 bg-slate-200/90 rounded-2xl rotate-[-2.5deg] transition-all duration-300 group-hover:-translate-y-4 group-hover:rotate-[-4deg] shadow-xs" />
                <div className="absolute inset-x-6 top-4 h-28 bg-slate-100 rounded-2xl rotate-[2deg] transition-all duration-300 group-hover:-translate-y-5 group-hover:rotate-[3.5deg] shadow-xs border-t border-slate-300/60" />
                <div className="absolute inset-x-4 top-5 h-28 bg-white rounded-2xl transition-all duration-300 group-hover:-translate-y-6 shadow-md border-t-2 border-brand-500/40 p-3 px-5 flex items-start justify-between">
                  <span className="text-[11px] font-extrabold text-brand-600 flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5" />
                    {cat.items.length} Berkas Unit Organisasi
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Resmi PNL
                  </span>
                </div>

                {/* 3. FOLDER MAIN COVER */}
                <div
                  className={`relative z-20 rounded-3xl rounded-tl-none overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 border-2 ${cat.folderBorderClass} bg-gradient-to-b ${cat.folderBgClass} p-6 sm:p-7 flex flex-col justify-between min-h-[310px]`}
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

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cat.subtitle}
                    </p>

                    {/* Preview list */}
                    <div className="mt-4 space-y-2">
                      {cat.items.slice(0, 3).map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-2.5 bg-white/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs"
                        >
                          <span className="font-extrabold text-slate-900">{item.abbr}</span>
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            {item.scope}
                          </span>
                        </div>
                      ))}
                      {cat.items.length > 3 && (
                        <p className="text-[11px] font-bold text-brand-600 text-center pt-1">
                          +{cat.items.length - 3} organisasi lainnya di folder ini
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Folder Bottom Indicator */}
                  <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 group-hover:text-brand-600 transition-colors">
                      <FolderOpen className="w-4 h-4 text-brand-600 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Arsip Ormawa</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full border border-brand-200 shadow-2xs">
                      Buka Berkas
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: FOLDER OPENING STAGE - JURUSAN & PRODI (FILES SLIDING OUT ANIMATION) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedDeptForFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop with dark blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeptForFolder(null)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* FOLDER STAGE CONTAINER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden z-10 my-auto text-left flex flex-col max-h-[92vh]"
            >
              {/* TOP FOLDER TAB STRIP & QUICK JURUSAN SWITCHER */}
              <div className="bg-slate-900 px-5 sm:px-7 py-4 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-md ${selectedDeptForFolder.tabClass}`}>
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black tracking-widest uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        FOLDER ARSIP #{selectedDeptForFolder.id}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {selectedDeptForFolder.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                      {selectedDeptForFolder.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedDeptForFolder(null)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
                    title="Tutup Folder (Esc)"
                  >
                    <span>Tutup Folder</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* FOLDER TABS BAR: QUICK SWITCH TO OTHER JURUSAN FOLDERS */}
              <div className="bg-slate-800/90 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-700/80 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5" /> Ganti Folder:
                </span>
                {pnlDepartments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDeptForFolder(d);
                      setProdiFilter('all');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      selectedDeptForFolder.id === d.id
                        ? `${d.tabClass} shadow-xs scale-105`
                        : 'text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    <span>{d.code}</span>
                  </button>
                ))}
              </div>

              {/* DEPARTMENT OVERVIEW HEADER & LEVEL FILTER */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono bg-navy text-white uppercase">
                      {selectedDeptForFolder.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {selectedDeptForFolder.programs.length} Berkas Program Studi
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      • {selectedDeptForFolder.labsCount}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-navy">
                    {selectedDeptForFolder.tagline}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {selectedDeptForFolder.description}
                  </p>
                </div>

                {/* Level Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 self-start md:self-center shrink-0 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setProdiFilter('all')}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                      prodiFilter === 'all'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Semua ({selectedDeptForFolder.programs.length})
                  </button>
                  <button
                    onClick={() => setProdiFilter('D4')}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                      prodiFilter === 'D4'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Sarjana Terapan (D4)
                  </button>
                  <button
                    onClick={() => setProdiFilter('D3')}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                      prodiFilter === 'D3'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Ahli Madya (D3)
                  </button>
                  {selectedDeptForFolder.programs.some((p) => p.level === 'S2') && (
                    <button
                      onClick={() => setProdiFilter('S2')}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                        prodiFilter === 'S2'
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-brand-600'
                      }`}
                    >
                      Magister (S2)
                    </button>
                  )}
                </div>
              </div>

              {/* FOLDER INTERIOR: PROGRAM STUDI DOSSIER SHEETS EMERGING OUT OF THE FOLDER */}
              <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-gradient-to-b from-slate-100/60 to-slate-50">
                <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-brand-600">
                    <FileText className="w-4 h-4" />
                    Lembar Arsip Dokumen Prodi (Keluar dari Folder):
                  </span>
                  <span>{selectedDeptForFolder.programs.filter((p) => prodiFilter === 'all' || p.level === prodiFilter).length} Berkas Ditampilkan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectedDeptForFolder.programs
                    .filter((p) => (prodiFilter === 'all' ? true : p.level === prodiFilter))
                    .map((prog, idx) => (
                      <motion.div
                        key={prog.name + idx}
                        initial={{ y: 160, opacity: 0, scale: 0.9, rotateX: 18 }}
                        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ y: 120, opacity: 0, scale: 0.92 }}
                        transition={{
                          type: 'spring',
                          stiffness: 280,
                          damping: 24,
                          delay: idx * 0.08, // Staggered: files slide out one by one!
                        }}
                        style={{ transformPerspective: 1000 }}
                        className="relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-brand-400 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        {/* Dossier Sheet Header */}
                        <div>
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

                        {/* Lab Praktikum & Akreditasi */}
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
                </div>
              </div>

              {/* FOLDER BOTTOM POCKET SLEEVE & ACTION BAR */}
              <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Semua program studi terdaftar resmi pada PDDIKTI & terstandar akreditasi LAM-PT / BAN-PT.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedDeptForFolder(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700"
                  >
                    Tutup Folder
                  </button>
                  <Link
                    to="/register?type=student"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    Daftar Mahasiswa Baru
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: FOLDER OPENING STAGE - ORGANISASI MAHASISWA (FILES SLIDING OUT) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedOrgCategoryForFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrgCategoryForFolder(null)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* FOLDER STAGE CONTAINER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden z-10 my-auto text-left flex flex-col max-h-[92vh]"
            >
              {/* TOP FOLDER TAB STRIP */}
              <div className="bg-slate-900 px-5 sm:px-7 py-4 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-md ${selectedOrgCategoryForFolder.tabClass}`}>
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black tracking-widest uppercase text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                        FOLDER ORMAWA PNL
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {selectedOrgCategoryForFolder.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                      {selectedOrgCategoryForFolder.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedOrgCategoryForFolder(null)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
                    title="Tutup (Esc)"
                  >
                    <span>Tutup Folder</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* FOLDER TABS BAR: QUICK SWITCH TO OTHER ORMAWA FOLDERS */}
              <div className="bg-slate-800/90 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-700/80 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5" /> Ganti Kategori:
                </span>
                {pnlOrgCategories.map((c, cIdx) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedOrgCategoryForFolder(c);
                      setSearchOrg('');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      selectedOrgCategoryForFolder.id === c.id
                        ? `${c.tabClass} shadow-xs scale-105`
                        : 'text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    <span>{c.badge}</span>
                  </button>
                ))}
              </div>

              {/* SUBHEADER & SEARCH BAR */}
              <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-navy">
                    {selectedOrgCategoryForFolder.subtitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memuat <strong>{selectedOrgCategoryForFolder.items.length} organisasi resmi</strong> yang aktif di Politeknik Negeri Lhokseumawe.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama organisasi..."
                    value={searchOrg}
                    onChange={(e) => setSearchOrg(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-brand-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* ORGANIZATIONS DOSSIER CARDS EMERGING OUT OF THE FOLDER */}
              <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-gradient-to-b from-slate-100/60 to-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {selectedOrgCategoryForFolder.items
                    .filter((org) =>
                      searchOrg
                        ? org.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
                          org.description.toLowerCase().includes(searchOrg.toLowerCase()) ||
                          org.abbr.toLowerCase().includes(searchOrg.toLowerCase())
                        : true
                    )
                    .map((org, oIdx) => (
                      <motion.div
                        key={org.name + oIdx}
                        initial={{ y: 160, opacity: 0, scale: 0.9, rotateX: 18 }}
                        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ y: 120, opacity: 0, scale: 0.92 }}
                        transition={{
                          type: 'spring',
                          stiffness: 280,
                          damping: 24,
                          delay: oIdx * 0.08, // Staggered emerging animation!
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
                </div>
              </div>

              {/* FOLDER BOTTOM BAR */}
              <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Organisasi mahasiswa terdaftar resmi di bawah naungan Wakil Direktur Bidang Kemahasiswaan & Kerjasama PNL.
                </span>
                <button
                  onClick={() => setSelectedOrgCategoryForFolder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700"
                >
                  Tutup Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
