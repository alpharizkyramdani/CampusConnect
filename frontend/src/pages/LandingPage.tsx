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
  color: string;
}

interface OrgCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  image: string;
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
      icon: <Cpu className="w-6 h-6 text-brand-600" />,
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
      icon: <Building className="w-6 h-6 text-brand-600" />,
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
      icon: <Wrench className="w-6 h-6 text-brand-600" />,
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
      icon: <FlaskConical className="w-6 h-6 text-brand-600" />,
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
      icon: <Zap className="w-6 h-6 text-brand-600" />,
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
      icon: <Briefcase className="w-6 h-6 text-brand-600" />,
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
      title: '1. Lembaga Eksekutif & Legislatif Kampus',
      subtitle: 'Pemerintahan Mahasiswa Tingkat Politeknik Negeri Lhokseumawe',
      badge: 'Pemerintahan Kampus',
      icon: <Landmark className="w-6 h-6 text-brand-600" />,
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          name: 'Dewan Perwakilan Mahasiswa (DPM PNL)',
          abbr: 'DPM PNL',
          scope: 'Tingkat Institut / Seluruh Kampus',
          tagline: 'Lembaga Legislatif & Pengawasan Mahasiswa Tertinggi di PNL',
          description:
            'Lembaga legislatif tingkat kampus yang berfungsi mengawasi kinerja BEM, menyerap dan mengadvokasikan aspirasi seluruh mahasiswa PNL kepada pimpinan direktorat, serta merumuskan regulasi keorganisasian kemahasiswaan kampus.',
          focus: ['Pengawasan Kinerja BEM', 'Legislasi & Advokasi Aspirasi', 'Musyawarah Mahasiswa'],
          color: 'from-amber-500 to-orange-600',
        },
        {
          name: 'Badan Eksekutif Mahasiswa (BEM PNL)',
          abbr: 'BEM PNL',
          scope: 'Tingkat Institut / Seluruh Kampus',
          tagline: 'Lembaga Eksekutif Pelaksana Program Kerja Strategis Kemahasiswaan',
          description:
            'Lembaga eksekutif tingkat kampus yang menjalankan roda pemerintahan mahasiswa, memimpin program kerja kemahasiswaan umum, pengabdian masyarakat vokasi, advokasi kesejahteraan mahasiswa, dan harmonisasi ormawa di lingkungan PNL.',
          focus: ['Pengabdian Masyarakat Terapan', 'Advokasi Finansial & Beasiswa', 'Pekan Kreativitas Mahasiswa'],
          color: 'from-blue-600 to-indigo-700',
        },
      ],
    },
    {
      id: 'himpunan-jurusan',
      title: '2. Himpunan Mahasiswa Jurusan (HMJ)',
      subtitle: 'Wadah Aspirasi, Soliditas & Keilmuan di Tingkat Jurusan',
      badge: '6 Himpunan Jurusan',
      icon: <Layers className="w-6 h-6 text-brand-600" />,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          name: 'HIMATIK (Himpunan Mahasiswa Teknologi Informasi dan Komputer)',
          abbr: 'HIMATIK PNL',
          scope: 'Jurusan TIK PNL',
          tagline: 'Inovasi Teknologi, Coding Bootcamp & Prestasi Mahasiswa TIK',
          description:
            'Wadah bagi mahasiswa Jurusan TIK untuk berkembang di bidang rekayasa teknologi informasi, pelatihan pemrograman, pembinaan kontes KMIPN/Gemastik, riset teknologi cerdas, dan penguatan persaudaraan vokasi.',
          focus: ['Divisi Litbang & AI', 'Divisi Kominfo & Multimedia', 'Divisi PSDM Kaderisasi', 'Divisi Humas'],
          color: 'from-blue-600 to-cyan-600',
        },
        {
          name: 'HMS (Himpunan Mahasiswa Sipil)',
          abbr: 'HMS PNL',
          scope: 'Jurusan Teknik Sipil PNL',
          tagline: 'Soliditas Teknik, Inovasi Konstruksi & Rancang Bangun Gedung',
          description:
            'Wadah kemahasiswaan Jurusan Teknik Sipil yang aktif menyelenggarakan pelatihan software BIM/AutoCAD, bimbingan lomba jembatan dan beton nasional, serta bakti sosial bedah rumah dan sanitasi masyarakat.',
          focus: ['Pelatihan Software BIM/CAD', 'Lomba Struktur Nasional', 'Kajian Infrastruktur Berkelanjutan'],
          color: 'from-emerald-600 to-teal-700',
        },
        {
          name: 'HMM (Himpunan Mahasiswa Mesin)',
          abbr: 'HMM PNL',
          scope: 'Jurusan Teknik Mesin PNL',
          tagline: 'Solidarity Forever, Inovasi Otomotif & Pabrikasi Presisi',
          description:
            'Wadah keilmuan dan solidaritas mahasiswa teknik mesin dalam perancangan kendaraan hemat energi, fabrikasi logam, pameran inovasi permesinan, serta pengabdian servis gratis bagi masyarakat.',
          focus: ['Tim Mobil Listrik/Hemat Energi', 'Pelatihan CNC & Las Presisi', 'Bakti Sosial Servis Mesin'],
          color: 'from-red-600 to-rose-700',
        },
        {
          name: 'HMK (Himpunan Mahasiswa Kimia)',
          abbr: 'HMK PNL',
          scope: 'Jurusan Teknik Kimia PNL',
          tagline: 'Eksplorasi Teknologi Proses, Petrokimia & Edukasi Lingkungan',
          description:
            'Himpunan mahasiswa yang mengkaji pengolahan minyak bumi dan gas alam, riset bioetanol, pelatihan keselamatan kerja K3 laboratorium, dan kampanye daur ulang limbah kimia ramah lingkungan.',
          focus: ['Kajian Proses Industri Migas', 'Seminar K3 Kimia Internasional', 'Inovasi Produk Sabun/Biofuel'],
          color: 'from-amber-600 to-yellow-600',
        },
        {
          name: 'HME (Himpunan Mahasiswa Elektro)',
          abbr: 'HME PNL',
          scope: 'Jurusan Teknik Elektro PNL',
          tagline: 'Sinergi Energi Listrik, Telekomunikasi & Robotika Cerdas',
          description:
            'Wadah pengembangan skill kelistrikan industri, perancangan rangkaian IoT, transmisi telekomunikasi, serta pembinaan mahasiswa baru dalam menguasai instrumentasi dan kontrol.',
          focus: ['Workshop Instalasi Listrik Surya', 'Pelatihan IoT & Mikrokontroler', 'Bakti Penerangan Desa'],
          color: 'from-purple-600 to-indigo-700',
        },
        {
          name: 'HIMABIS (Himpunan Mahasiswa Bisnis / Tata Niaga)',
          abbr: 'HIMABIS PNL',
          scope: 'Jurusan Bisnis PNL',
          tagline: 'Kewirausahaan Kreatif, Akuntansi Syariah & Digital Leadership',
          description:
            'Wadah aspirasi mahasiswa tata niaga dalam pengembangan bisnis rintisan (startup), kompetisi akuntansi nasional, inkubasi kewirausahaan halal, dan literasi investasi syariah terapan.',
          focus: ['Inkubator Bisnis Kreatif', 'Olimpiade Akuntansi Terapan', 'Pekan Raya Kewirausahaan'],
          color: 'from-pink-600 to-rose-600',
        },
      ],
    },
    {
      id: 'unit-kegiatan-mahasiswa',
      title: '3. Unit Kegiatan Mahasiswa (UKM)',
      subtitle: 'Pengembangan Minat, Bakat, Riset, Seni & Olahraga Lintas Jurusan',
      badge: '7 UKM Unggulan PNL',
      icon: <Sparkles className="w-6 h-6 text-brand-600" />,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      items: [
        {
          name: 'POLICY (Polytechnic Linux Community)',
          abbr: 'POLICY PNL',
          scope: 'Teknologi Informasi & Open Source',
          tagline: 'Komunitas Pengembang Open Source, Jaringan & Cyber Security',
          description:
            'Komunitas mahasiswa lintas jurusan yang berfokus pada pengembangan sistem operasi Linux, pemrograman open source, sysadmin server, jaringan komputer, dan keamanan informasi siber.',
          focus: ['Linux System Administration', 'Ethical Hacking & CTF Team', 'Open Source Software Dev'],
          color: 'from-slate-800 to-slate-900',
        },
        {
          name: 'POLYROBOCOM (Polytechnic Robotic Community)',
          abbr: 'POLYROBOCOM',
          scope: 'Riset Robotika & IoT',
          tagline: 'Laboratorium Riset Robot Otonom & Kontes Robot Nasional (KRI)',
          description:
            'UKM yang bergerak di bidang riset robotika, elektronika mikrokontroler, Internet of Things (IoT), dan persiapan tim delegasi PNL dalam Kontes Robot Indonesia (KRI) dan Kontes Robot Terbang.',
          focus: ['Divisi Robot Beroda & Berkaki', 'Divisi Robot SAR & Bawah Air', 'Divisi Robot Terbang Drone'],
          color: 'from-blue-600 to-cyan-500',
        },
        {
          name: 'IECLOP (Improving English Club of Polytechnic)',
          abbr: 'IECLOP PNL',
          scope: 'Bahasa & Komunikasi Global',
          tagline: 'Wadah Public Speaking, Debat Bahasa Inggris & Storytelling',
          description:
            'Wadah pengembangan kompetensi komunikasi bahasa Inggris mahasiswa vokasi, mencakup National Polytechnic English Olympics (NPEO), parliamentary debate, speech, storytelling, dan newscasting.',
          focus: ['Parliamentary Debate Training', 'Speech & Storytelling Camp', 'Persiapan Lomba NPEO'],
          color: 'from-emerald-600 to-green-500',
        },
        {
          name: 'LDK-FORDIMA (Forum Diskusi Islam Mahasiswa)',
          abbr: 'LDK FORDIMA',
          scope: 'Kerohanian & Sosial Dakwah',
          tagline: 'Kajian Keislaman, Syiar Moral Kampus & Aksi Kemanusiaan',
          description:
            'Lembaga dakwah kampus yang menyelenggarakan kajian keislaman rutin, pembinaan akhlak mulia, kegiatan tahsin quran, serta bakti sosial santunan yatim dan kebencanaan.',
          focus: ['Kajian Rutin & Mentoring Agama', 'Festival Syiar Islam Kampus', 'Bakti Sosial & Tanggap Bencana'],
          color: 'from-teal-600 to-emerald-700',
        },
        {
          name: 'UKM-PA Edelweis',
          abbr: 'PA EDELWEIS',
          scope: 'Pecinta Alam & Konservasi',
          tagline: 'Konservasi Alam, Pendakian Gunung & Search and Rescue (SAR)',
          description:
            'Unit kegiatan mahasiswa pecinta alam yang aktif dalam ekspedisi pendakian gunung, pelestarian hutan mangrove pesisir, pendidikan navigasi darat, dan relawan Search and Rescue (SAR).',
          focus: ['Navigasi Darat & Survival', 'Penanaman Mangrove Pesisir', 'Tim Relawan Evakuasi SAR'],
          color: 'from-amber-700 to-orange-800',
        },
        {
          name: 'UKM Sanggar Seni PNL',
          abbr: 'SANGGAR SENI',
          scope: 'Kesenian Tradisional & Modern',
          tagline: 'Pelestarian Tari Tradisional Aceh, Teater & Festival Budaya',
          description:
            'Wadah minat bakat kesenian mahasiswa di bidang tari tradisional Aceh (Saman, Ratoh Jaroe, Ranup Lampuan), seni musik perkusi etnik, teater panggung, dan penyelenggara Festival Aneuk Nanggroe tahunan.',
          focus: ['Sanggar Tari Ratoh Jaroe', 'Grup Musik Tradisional Aceh', 'Penyelenggara Festival Budaya'],
          color: 'from-rose-600 to-pink-600',
        },
        {
          name: 'UKM Olahraga & Bela Diri',
          abbr: 'UKM BELA DIRI',
          scope: 'Olahraga & Seni Beladiri Prestasi',
          tagline: 'Pembinaan Atlet Taekwondo & Pencak Silat Merpati Putih (MP)',
          description:
            'Meliputi cabang Taekwondo dan Pencak Silat Merpati Putih yang rutin membina atlet mahasiswa PNL untuk berkompetisi di Pekan Olahraga Mahasiswa (POMDA/POMNAS) dan kejuaraan terbuka nasional.',
          focus: ['Dojo Taekwondo PNL', 'Pencak Silat Merpati Putih', 'Latihan Fisik & Kejuaraan Pomnas'],
          color: 'from-red-700 to-stone-800',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Top Public Header - Transparan di atas video hero, solid glassmorphism saat di-scroll */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-borderMuted shadow-md'
            : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span
                className={`font-extrabold text-lg sm:text-xl tracking-tight transition-colors ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                PNLConnect
              </span>
              <span
                className={`block text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  isScrolled ? 'text-brand-600' : 'text-sky-300'
                }`}
              >
                PNL DIGITAL ECOSYSTEM
              </span>
            </div>
          </Link>

          {/* Nav Links with animated white underline */}
          <div
            className={`hidden md:flex items-center gap-7 text-sm font-semibold transition-colors ${
              isScrolled ? 'text-slate-600' : 'text-white/90'
            }`}
          >
            <a
              href="#"
              className={`relative py-1.5 transition-colors group ${
                isScrolled ? 'text-slate-600 hover:text-brand-600' : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Beranda</span>
              <span
                className={`absolute bottom-0 left-0 w-0 h-[2.5px] rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  isScrolled ? 'bg-brand-600' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                }`}
              />
            </a>

            <a
              href="#features"
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
                Jelajahi 6 Jurusan & 29 Prodi
              </a>
            </motion.div>

            {/* Repeatable Staggered Item 5: Quick Stats Grid (Soft Semi-Transparent Glassmorphism) */}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
                  }}
                  className="p-5 rounded-2xl shadow-xl hover:bg-white/25 transition-all transform hover:-translate-y-1"
                >
                  <div className="text-3xl font-extrabold text-cyan-300 drop-shadow-sm">{stat.number}</div>
                  <div className="text-xs text-white/90 font-medium mt-1 leading-snug">{stat.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION (MINIMALIST SOFT WHITE & LIGHT BLUE GRADIENT) */}
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

      {/* 3. JURUSAN & PRODI SECTION (WITH FOLDER OPENING ANIMATION) */}
      <section
        id="jurusan"
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 50%, #F5F9FE 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <motion.h2
                {...scrollAnim(0.1)}
                className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1.5"
              >
                <Folder className="w-4 h-4 text-brand-600" />
                <span>6 Jurusan & 29 Program Studi Unggulan</span>
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
                Klik pada jurusan di bawah untuk <strong>membuka folder program studi</strong>, melihat jenjang (D3, D4, S2), kurikulum kompetensi vokasi, dan prospek karir lulusan.
              </motion.p>
            </div>
            <motion.div {...scrollAnim(0.3)} className="mt-4 md:mt-0">
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Interaktif: Klik kartu untuk membuka isi prodi
              </span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pnlDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                {...scrollAnim(0.1 + (idx % 3) * 0.1)}
                onClick={() => {
                  setSelectedDeptForFolder(dept);
                  setProdiFilter('all');
                }}
                className="group cursor-pointer border border-slate-200/80 hover:border-brand-400 bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden bg-slate-100 relative">
                    <img
                      src={dept.image}
                      alt={dept.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-brand-700 font-mono text-xs font-bold rounded-lg shadow-xs">
                      {dept.badge}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-600/90 backdrop-blur-xs text-white uppercase tracking-wider inline-flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {dept.programs.length} Program Studi
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pb-2">
                    <h3 className="font-extrabold text-base text-navy group-hover:text-brand-600 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">{dept.tagline}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>

                    {/* Preview prodi pill previews */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {dept.programs.slice(0, 3).map((prog, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-100/80"
                        >
                          {prog.level} {prog.name.replace(/^(D3|D4|S2)\s*(\(Sarjana Terapan\)|\(Magister Terapan\))?\s*/i, '')}
                        </span>
                      ))}
                      {dept.programs.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                          +{dept.programs.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-3">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{dept.labsCount}</span>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-700 group-hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Buka Folder Prodi</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ORGANISASI MAHASISWA PNL SECTION (LEMBAGA, HMJ, UKM WITH FOLDER ANIMATION) */}
      <section
        id="organisasi"
        className="py-24 border-t border-slate-200/60"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FE 45%, #FFFFFF 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.h2
              {...scrollAnim(0.1)}
              className="text-xs font-bold text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              <Users2 className="w-4 h-4 text-brand-600" />
              <span>Ekosistem Kemahasiswaan & Kepemimpinan</span>
            </motion.h2>
            <motion.p
              {...scrollAnim(0.2)}
              className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy"
            >
              Organisasi Mahasiswa Politeknik Negeri Lhokseumawe
            </motion.p>
            <motion.p
              {...scrollAnim(0.3)}
              className="mt-3 text-slate-600 text-sm sm:text-base"
            >
              Terbagi dalam 3 pilar: <strong>Lembaga Eksekutif & Legislatif Kampus</strong>, <strong>Himpunan Mahasiswa Jurusan (HMJ)</strong>, dan <strong>Unit Kegiatan Mahasiswa (UKM)</strong>. Klik folder untuk meninjau peran & profil tiap ormawa.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pnlOrgCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                {...scrollAnim(0.1 + idx * 0.15)}
                onClick={() => {
                  setSelectedOrgCategoryForFolder(cat);
                  setSearchOrg('');
                }}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 hover:border-brand-400 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-xs text-brand-700 font-mono text-xs font-bold rounded-lg shadow-xs">
                      {cat.badge}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                        {cat.items.length} Unit Organisasi Aktif
                      </div>
                      <h3 className="font-extrabold text-lg text-white leading-snug mt-0.5">
                        {cat.title.replace(/^\d+\.\s*/, '')}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {cat.subtitle}
                    </p>

                    <div className="mt-4 space-y-2">
                      {cat.items.slice(0, 3).map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-800">{item.abbr || item.name}</span>
                          <span className="text-[10px] text-brand-600 font-semibold">{item.scope}</span>
                        </div>
                      ))}
                      {cat.items.length > 3 && (
                        <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
                          +{cat.items.length - 3} organisasi lainnya di dalam folder ini
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 group-hover:bg-brand-600 text-slate-700 group-hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Buka Folder Organisasi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* MODAL 1: ANIMATED FOLDER MODAL - JURUSAN & PRODI PNL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {selectedDeptForFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop with dark blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDeptForFolder(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Folder Sheet with Physical 3D Flap Motion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 35, rotateX: -14 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25, rotateX: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ transformPerspective: 1200 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto text-left"
            >
              {/* Folder Top Tab Strip */}
              <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-wider block">
                      📁 FOLDER ARSIP JURUSAN PNL • {selectedDeptForFolder.badge}
                    </span>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      {selectedDeptForFolder.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeptForFolder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Tutup Folder (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department Overview Ribbon */}
              <div className="p-6 pb-4 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-navy text-white uppercase">
                      {selectedDeptForFolder.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-100 text-brand-700">
                      {selectedDeptForFolder.programs.length} Program Studi Resmi
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {selectedDeptForFolder.labsCount}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-navy">{selectedDeptForFolder.tagline}</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {selectedDeptForFolder.description}
                  </p>
                </div>

                {/* Level Filter Tabs */}
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 self-start sm:self-center shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setProdiFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      prodiFilter === 'all' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Semua ({selectedDeptForFolder.programs.length})
                  </button>
                  <button
                    onClick={() => setProdiFilter('D4')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      prodiFilter === 'D4' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Sarjana Terapan (D4)
                  </button>
                  <button
                    onClick={() => setProdiFilter('D3')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      prodiFilter === 'D3' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-brand-600'
                    }`}
                  >
                    Ahli Madya (D3)
                  </button>
                  {selectedDeptForFolder.programs.some((p) => p.level === 'S2') && (
                    <button
                      onClick={() => setProdiFilter('S2')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        prodiFilter === 'S2' ? 'bg-brand-600 text-white shadow-2xs' : 'text-slate-600 hover:text-brand-600'
                      }`}
                    >
                      Magister (S2)
                    </button>
                  )}
                </div>
              </div>

              {/* Programs List Grid Inside Folder */}
              <div className="p-6 max-h-[62vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDeptForFolder.programs
                    .filter((p) => (prodiFilter === 'all' ? true : p.level === prodiFilter))
                    .map((prog, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-300 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                                prog.level === 'D4'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : prog.level === 'S2'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {prog.levelLabel}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                              {prog.duration} • {prog.sks}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-sm sm:text-base text-navy leading-snug">
                            {prog.name}
                          </h5>

                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {prog.description}
                          </p>

                          {/* Career Path Badges */}
                          <div className="mt-3.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                              Peluang Karir & Profesi Lulusan:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {prog.career.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Lab info */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium truncate max-w-[220px]">
                            🔬 {prog.lab}
                          </span>
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            Akreditasi Unggul PNL
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Folder Bottom Action Bar */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Kurikulum vokasi terintegrasi industri Politeknik Negeri Lhokseumawe (Standar BAN-PT / LAM-PT).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDeptForFolder(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Tutup Folder
                  </button>
                  <Link
                    to="/register?type=student"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Daftar Mahasiswa Baru →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 2: ANIMATED FOLDER MODAL - ORGANISASI MAHASISWA */}
      {/* ==================================================== */}
      <AnimatePresence>
        {selectedOrgCategoryForFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrgCategoryForFolder(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Folder Card Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 35, rotateX: -14 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25, rotateX: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ transformPerspective: 1200 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto text-left"
            >
              {/* Folder Top Tab */}
              <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold shadow-xs">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider block">
                      📁 ARSIP ORMAWA PNL • {selectedOrgCategoryForFolder.badge}
                    </span>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      {selectedOrgCategoryForFolder.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrgCategoryForFolder(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Subheader */}
              <div className="p-6 pb-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-navy">
                    {selectedOrgCategoryForFolder.subtitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memuat <strong>{selectedOrgCategoryForFolder.items.length} organisasi resmi</strong> yang aktif berkegiatan di Politeknik Negeri Lhokseumawe.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari organisasi..."
                    value={searchOrg}
                    onChange={(e) => setSearchOrg(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Organizations Grid */}
              <div className="p-6 max-h-[62vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        key={oIdx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: oIdx * 0.05 }}
                        className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-navy text-white uppercase">
                              {org.abbr}
                            </span>
                            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                              {org.scope}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-sm text-navy leading-snug">
                            {org.name}
                          </h5>

                          <p className="text-xs text-brand-700 font-semibold mt-1">
                            {org.tagline}
                          </p>

                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {org.description}
                          </p>

                          <div className="mt-3.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                              Fokus Utama & Bidang Pengembangan:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {org.focus.map((f, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ormawa Resmi PNL
                          </span>
                          <Link
                            to="/login"
                            className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                          >
                            Masuk Portal Ormawa →
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Organisasi mahasiswa terdaftar resmi di bawah naungan Wakil Direktur Bidang Kemahasiswaan & Kerjasama PNL.
                </span>
                <button
                  onClick={() => setSelectedOrgCategoryForFolder(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
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
