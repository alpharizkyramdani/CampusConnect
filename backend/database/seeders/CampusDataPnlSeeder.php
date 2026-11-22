<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Organization;
use App\Models\University;
use App\Models\UserRoleAssignment;
use Illuminate\Database\Seeder;

class CampusDataPnlSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Politeknik Negeri Lhokseumawe (PNL) exists
        $pnl = University::firstOrCreate(
            ['id' => 5],
            [
                'name' => 'Politeknik Negeri Lhokseumawe',
                'slug' => 'politeknik-negeri-lhokseumawe',
                'code' => 'PNL',
                'email' => 'info@pnl.ac.id',
                'website' => 'https://pnl.ac.id',
                'address' => 'Jl. Banda Aceh-Medan Km. 280.3, Buketrata, Lhokseumawe, Aceh 24301',
                'description' => 'Politeknik Negeri Lhokseumawe (PNL) adalah perguruan tinggi vokasi negeri terkemuka di Aceh yang berorientasi pada penerapan teknologi industri, rekayasa, dan bisnis profesional.',
                'status' => 'active',
            ]
        );

        $univId = $pnl->id;

        // 2. Setup 6 Jurusan (Faculties)
        $facultiesData = [
            'tik' => [
                'name' => 'Jurusan Teknologi Informasi dan Komputer',
                'code' => 'JTIK-PNL',
                'description' => 'Pusat pendidikan vokasi keunggulan rekayasa sistem perangkat lunak, infrastruktur cloud & cyber security, kecerdasan buatan, dan konten multimedia interaktif.',
            ],
            'sipil' => [
                'name' => 'Jurusan Teknik Sipil',
                'code' => 'JTS-PNL',
                'description' => 'Keahlian perancangan dan manajemen struktur bangunan gedung bertingkat, rekayasa jalan raya jembatan, bendungan keairan, serta teknologi Building Information Modeling (BIM).',
            ],
            'mesin' => [
                'name' => 'Jurusan Teknik Mesin',
                'code' => 'JTM-PNL',
                'description' => 'Pendidikan vokasi mekanikal terkemuka: permesinan presisi CNC, pengelasan bersertifikasi internasional (AWS/CSWIP), fabrikasi logam, dan otomasi perawatan mesin industri.',
            ],
            'kimia' => [
                'name' => 'Jurusan Teknik Kimia',
                'code' => 'JTK-PNL',
                'description' => 'Pusat keunggulan rekayasa proses kimia, kilang pengolahan minyak dan gas bumi, bioteknologi terapan, pengelolaan limbah ramah lingkungan, dan K3 proses industri.',
            ],
            'elektro' => [
                'name' => 'Jurusan Teknik Elektro',
                'code' => 'JTE-PNL',
                'description' => 'Membentuk tenaga ahli terapan dalam sistem transmisi pembangkit energi listrik, jaringan telekomunikasi pita lebar 5G, instrumentasi kendali PLC SCADA, dan robotika mekatronika.',
            ],
            'bisnis' => [
                'name' => 'Jurusan Tata Niaga / Bisnis',
                'code' => 'JTN-PNL',
                'description' => 'Pendidikan terapan akuntansi sektor publik, perbankan syariah modern, manajemen investasi, perpajakan, dan administrasi bisnis terdigitalisasi.',
            ],
        ];

        $faculties = [];
        foreach ($facultiesData as $key => $fData) {
            $faculty = Faculty::where('university_id', $univId)
                ->where('code', $fData['code'])
                ->first();

            if (! $faculty) {
                $faculty = Faculty::create([
                    'university_id' => $univId,
                    'name' => $fData['name'],
                    'code' => $fData['code'],
                    'description' => $fData['description'],
                ]);
            } else {
                $faculty->update([
                    'name' => $fData['name'],
                    'code' => $fData['code'],
                    'description' => $fData['description'],
                ]);
            }
            $faculties[$key] = $faculty;
        }

        // Clean any extra duplicate faculties for university 5
        $validFacultyIds = collect($faculties)->pluck('id')->toArray();
        Faculty::where('university_id', $univId)
            ->whereNotIn('id', $validFacultyIds)
            ->delete();

        // 3. Define the exact 30 Program Studi (Departments) matching LandingPage
        $departmentsData = [
            // --- JURUSAN TIK (5 Prodi) ---
            [
                'faculty' => 'tik',
                'name' => 'D4 Teknik Informatika',
                'code' => 'TI-D4',
                'description' => 'Fokus keahlian rekayasa sistem perangkat lunak skala enterprise, integrasi arsitektur microservices, kecerdasan buatan, dan komputasi awan. Gelar: Sarjana Terapan (S.Tr.Kom).',
            ],
            [
                'faculty' => 'tik',
                'name' => 'D4 Teknologi Rekayasa Komputer Jaringan',
                'code' => 'TRKJ-D4',
                'description' => 'Membentuk tenaga ahli terapan dalam perancangan infrastruktur jaringan modern, mitigasi ancaman siber, router switching enterprise, dan sistem IoT. Gelar: Sarjana Terapan (S.Tr.Kom).',
            ],
            [
                'faculty' => 'tik',
                'name' => 'D4 Teknologi Rekayasa Multimedia',
                'code' => 'TRM-D4',
                'description' => 'Keahlian terapan dalam perancangan antarmuka pengguna digital, pengembangan aplikasi game, animasi 3 dimensi, dan teknologi visual interaktif. Gelar: Sarjana Terapan (S.Tr.Kom).',
            ],
            [
                'faculty' => 'tik',
                'name' => 'D4 Teknologi Rekayasa Perangkat Lunak',
                'code' => 'TRPL-D4',
                'description' => 'Konsentrasi pada metodologi siklus hidup rekayasa piranti lunak terstandar industri, arsitektur microservices modern, dan jaminan mutu kode. Gelar: Sarjana Terapan (S.Tr.Kom).',
            ],
            [
                'faculty' => 'tik',
                'name' => 'D3 Teknik Informatika',
                'code' => 'TI-D3',
                'description' => 'Pendidikan vokasi komputasi praktis: pemrograman web modern, administrasi database relasional, dan troubleshooting perangkat keras/jaringan. Gelar: Ahli Madya (A.Md.Kom).',
            ],

            // --- JURUSAN TEKNIK SIPIL (5 Prodi) ---
            [
                'faculty' => 'sipil',
                'name' => 'D3 Teknologi Konstruksi Bangunan Air',
                'code' => 'TKBA-D3',
                'description' => 'Pendidikan teknisi terapan perancangan saluran drainase perkotaan, tanggul pengendali banjir, bendungan, dan instalasi pengelolaan air bersih. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'sipil',
                'name' => 'D3 Teknologi Konstruksi Jalan dan Jembatan',
                'code' => 'TKJJ-D3',
                'description' => 'Penguasaan teknik survei trase jalan, pengujian bahan aspal beton, pengawasan pemadatan tanah, dan pelaksanaan konstruksi jembatan sederhana. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'sipil',
                'name' => 'D3 Teknologi Konstruksi Bangunan Gedung',
                'code' => 'TKBG-D3',
                'description' => 'Mencetak tenaga terampil pelaksanaan bekisting, pembesian, perancah, beton bertulang, dan pengawasan keselamatan kerja gedung bertingkat. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'sipil',
                'name' => 'D4 Teknologi Rekayasa Konstruksi Jalan dan Jembatan',
                'code' => 'TRKJJ-D4',
                'description' => 'Perancangan tingkat lanjut struktur jembatan bentang panjang, rekayasa geometrik jalan raya bebas hambatan, analisis geoteknik, dan manajemen kontrak konstruksi. Gelar: Sarjana Terapan (S.Tr.T).',
            ],
            [
                'faculty' => 'sipil',
                'name' => 'D4 Teknologi Rekayasa Konstruksi Bangunan Gedung',
                'code' => 'TRKBG-D4',
                'description' => 'Spesialisasi rekayasa struktur gedung bertingkat tinggi tahan gempa, implementasi BIM 4D/5D, audit keandalan struktur, dan kepemimpinan proyek konstruksi modern. Gelar: Sarjana Terapan (S.Tr.T).',
            ],

            // --- JURUSAN TEKNIK MESIN (4 Prodi) ---
            [
                'faculty' => 'mesin',
                'name' => 'D3 Teknologi Mesin',
                'code' => 'TM-D3',
                'description' => 'Kompetensi terapan operasi mesin perkakas konvensional, perawatan preventif pompa, kompresor, turbin, dan transmisi daya mekanikal. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'mesin',
                'name' => 'D3 Teknologi Industri',
                'code' => 'TIND-D3',
                'description' => 'Penguasaan tata letak pabrik, efisiensi kerja industri, pengendalian kualitas proses produksi, dan sistem keselamatan K3 manufaktur. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'mesin',
                'name' => 'D4 Teknologi Rekayasa Manufaktur',
                'code' => 'TRM-D4M',
                'description' => 'Perancangan produk terintegrasi computer-aided design (CAD/CAM), pemrograman mesin CNC multi-axis, robotika manufaktur, dan otomasi industri 4.0. Gelar: Sarjana Terapan (S.Tr.T).',
            ],
            [
                'faculty' => 'mesin',
                'name' => 'D4 Teknologi Rekayasa Pengelasan dan Fabrikasi',
                'code' => 'TRPF-D4',
                'description' => 'Keahlian pengelasan tingkat tinggi (SMAW, GTAW, GMAW, SAW) untuk konstruksi offshore, boiler, pipa migas, pengujian NDT, dan sertifikasi internasional. Gelar: Sarjana Terapan (S.Tr.T).',
            ],

            // --- JURUSAN TEKNIK KIMIA (3 Prodi) ---
            [
                'faculty' => 'kimia',
                'name' => 'D3 Teknologi Kimia',
                'code' => 'TK-D3',
                'description' => 'Analisis proksimat dan instrumen spektrofotometri, operasi alat distilasi, evaporasi, filtrasi, dan pemantauan baku mutu limbah industri. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'kimia',
                'name' => 'D3 Teknologi Pengolahan Minyak dan Gas',
                'code' => 'TPMG-D3',
                'description' => 'Teknologi pemisahan hidrokarbon, desulfurisasi, liquefaction LNG/LPG, pengoperasian kolom fraksionasi, dan manajemen keselamatan kilang migas. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'kimia',
                'name' => 'D4 Teknologi Rekayasa Kimia Industri',
                'code' => 'TRKI-D4',
                'description' => 'Simulasi proses pabrik kimia (Aspen HYSYS), perancangan reaktor kimia berskala komersial, sintesis bahan polimer, dan transisi energi terbarukan. Gelar: Sarjana Terapan (S.Tr.T).',
            ],

            // --- JURUSAN TEKNIK ELEKTRO (7 Prodi) ---
            [
                'faculty' => 'elektro',
                'name' => 'D3 Teknologi Listrik',
                'code' => 'TL-D3',
                'description' => 'Penguasaan instalasi tegangan rendah dan menengah, proteksi relai, pengujian trafo daya, motor induksi, dan efisiensi konsumsi daya. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D3 Teknologi Telekomunikasi',
                'code' => 'TT-D3',
                'description' => 'Teknologi perambatan gelombang radio, pemasangan dan pengujian kabel serat optik OTDR, instalasi antena microwave, dan transmisi data. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D3 Teknologi Elektronika',
                'code' => 'TE-D3',
                'description' => 'Perancangan rangkaian analog dan digital, soldering mikroskopis, pemrograman mikrokontroler AVR/ARM, dan trouble-shooting perangkat elektronika. Gelar: Ahli Madya (A.Md.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D4 Teknologi Rekayasa Pembangkit Energi',
                'code' => 'TRPE-D4',
                'description' => 'Perancangan pembangkit listrik termal, hidro, dan energi surya terbarukan (PLTS), sinkronisasi turbin generator, dan kestabilan smart-grid daya. Gelar: Sarjana Terapan (S.Tr.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D4 Teknologi Rekayasa Jaringan Telekomunikasi',
                'code' => 'TRJT-D4',
                'description' => 'Arsitektur jaringan nirkabel 4G/5G, routing switching core network, transmisi satelit dan gelombang mikro, serta integrasi jaringan cloud telekomunikasi. Gelar: Sarjana Terapan (S.Tr.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D4 Teknologi Rekayasa Instrumentasi dan Kontrol',
                'code' => 'TRIK-D4',
                'description' => 'Integrasi sistem kendali otomatis DCS/SCADA di industri migas dan pabrik semen, sensor kalibrasi presisi, valve aktuator pneumatik, dan PLC terprogram. Gelar: Sarjana Terapan (S.Tr.T).',
            ],
            [
                'faculty' => 'elektro',
                'name' => 'D4 Teknologi Rekayasa Mekatronika',
                'code' => 'TRMK-D4',
                'description' => 'Konvergensi mekanik, elektronika kontrol, dan piranti lunak cerdas untuk robotika industri, lengan robotika pabrik, dan mesin cerdas masa depan. Gelar: Sarjana Terapan (S.Tr.T).',
            ],

            // --- JURUSAN TATA NIAGA / BISNIS (6 Prodi) ---
            [
                'faculty' => 'bisnis',
                'name' => 'D3 Akuntansi',
                'code' => 'AKT-D3',
                'description' => 'Penyusunan laporan keuangan neraca laba rugi berbasis software akuntansi modern (MYOB, Accurate), rekonsiliasi bank, dan pengisian SPT pajak. Gelar: Ahli Madya (A.Md.Ak).',
            ],
            [
                'faculty' => 'bisnis',
                'name' => 'D3 Administrasi Bisnis',
                'code' => 'AB-D3',
                'description' => 'Kearsipan digital, korespondensi bisnis eksekutif, strategi pemasaran digital, operasional logistik, dan manajemen layanan pelanggan. Gelar: Ahli Madya (A.Md.A.B).',
            ],
            [
                'faculty' => 'bisnis',
                'name' => 'D4 Akuntansi Lembaga Keuangan Syariah',
                'code' => 'ALKS-D4',
                'description' => 'Standar akuntansi syariah (AAOIFI & PSAK Syariah), transaksi mudharabah murabahah, audit perbankan syariah, dan instrumen investasi sukuk/halal. Gelar: Sarjana Terapan (S.Tr.Ak).',
            ],
            [
                'faculty' => 'bisnis',
                'name' => 'D4 Akuntansi Sektor Publik',
                'code' => 'ASP-D4',
                'description' => 'Standar Akuntansi Pemerintahan (SAP), audit kepatuhan keuangan daerah, sistem informasi perbendaharaan negara, dan akuntansi forensik publik. Gelar: Sarjana Terapan (S.Tr.Ak).',
            ],
            [
                'faculty' => 'bisnis',
                'name' => 'D4 Manajemen Keuangan Sektor Publik',
                'code' => 'MKSP-D4',
                'description' => 'Manajemen perbendaharaan negara, perencanaan anggaran berbasis kinerja, evaluasi proyek investasi publik, dan audit belanja modal daerah. Gelar: Sarjana Terapan (S.Tr.M).',
            ],
            [
                'faculty' => 'bisnis',
                'name' => 'S2 (Magister Terapan) Keuangan Islam Terapan',
                'code' => 'KIT-S2',
                'description' => 'Program pascasarjana terapan pertama di Aceh yang mengkaji inovasi fintech syariah, manajemen portofolio wakaf produktif, dan kebijakan moneter Islam kontemporer. Gelar: Magister Terapan (M.Tr.E).',
            ],
        ];

        $prodiCodeMap = [
            'TI-D4' => '55301', 'TRKJ-D4' => '56301', 'TRM-D4' => '55302', 'TRPL-D4' => '55303', 'TI-D3' => '55401',
            'TKBA-D3' => '22402', 'TKJJ-D3' => '22403', 'TKBG-D3' => '22404', 'TRKJJ-D4' => '22301', 'TRKBG-D4' => '22302',
            'TM-D3' => '21401', 'TIND-D3' => '21402', 'TRM-D4M' => '21301', 'TRPF-D4' => '21302',
            'TK-D3' => '24401', 'TPMG-D3' => '24402', 'TRKI-D4' => '24301',
            'TL-D3' => '20401', 'TT-D3' => '20402', 'TE-D3' => '20403', 'TRPE-D4' => '20301', 'TRJT-D4' => '20302', 'TRIK-D4' => '20303', 'TRMK-D4' => '20304',
            'AKT-D3' => '62401', 'AB-D3' => '63411', 'ALKS-D4' => '62301', 'ASP-D4' => '62302', 'MKSP-D4' => '61301', 'KIT-S2' => '60202',
        ];

        $validDeptIds = [];
        foreach ($departmentsData as $d) {
            $faculty = $faculties[$d['faculty']];
            $dept = Department::updateOrCreate(
                [
                    'university_id' => $univId,
                    'name' => $d['name'],
                ],
                [
                    'faculty_id' => $faculty->id,
                    'code' => $d['code'],
                    'prodi_code' => $prodiCodeMap[$d['code']] ?? null,
                    'description' => $d['description'],
                ]
            );
            $validDeptIds[] = $dept->id;
        }

        // Clean any mismatched/duplicate departments in PNL that are not in validDeptIds
        Department::where('university_id', $univId)
            ->whereNotIn('id', $validDeptIds)
            ->delete();

        // 4. Setup All 15 Organizations (Ormawa PNL)
        $organizationsData = [
            // Category 1: Eksekutif & Legislatif Kampus
            [
                'name' => 'Badan Eksekutif Mahasiswa (BEM PNL)',
                'slug' => 'bem-pnl',
                'type' => 'bem',
                'category' => 'Executive & Leadership',
                'logo' => 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
                'description' => 'Lembaga eksekutif tingkat kampus yang menjalankan roda pemerintahan mahasiswa, memimpin program kerja kemahasiswaan umum, pengabdian masyarakat vokasi, advokasi kesejahteraan mahasiswa, dan harmonisasi ormawa di lingkungan PNL.',
                'vision' => 'Mewujudkan BEM PNL yang progresif, inklusif, dan berdaya saing dalam menggerakkan aspirasi dan aksi nyata civitas akademika vokasi.',
                'mission' => "1. Mengoptimalkan pelayanan dan advokasi mahasiswa PNL secara responsif.\n2. Meningkatkan kolaborasi strategis antar ormawa.\n3. Melaksanakan pengabdian masyarakat berbasis teknologi terapan vokasi.",
                'divisions' => ['Kementerian Dalam Negeri', 'Kementerian Luar Negeri', 'Kementerian Advokasi & Kesejahteraan Mahasiswa', 'Kementerian Riset & Teknologi Terapan', 'Kementerian Kominfo & Publikasi', 'Kementerian Pengabdian Masyarakat'],
                'website' => 'https://bem.pnl.ac.id',
                'instagram' => '@bem_pnl',
                'contact_email' => 'bem@pnl.ac.id',
            ],
            [
                'name' => 'Dewan Perwakilan Mahasiswa (DPM PNL)',
                'slug' => 'dpm-pnl',
                'type' => 'dpm',
                'category' => 'Legislative & Supervisory',
                'logo' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&auto=format&fit=crop&q=80',
                'description' => 'Lembaga legislatif tingkat kampus yang berfungsi mengawasi kinerja BEM, menyerap dan mengadvokasikan aspirasi seluruh mahasiswa PNL kepada pimpinan direktorat, serta merumuskan regulasi keorganisasian kemahasiswaan kampus.',
                'vision' => 'Menjadikan DPM PNL sebagai lembaga perwakilan yang berintegritas, aspiratif, transparan, dan profesional.',
                'mission' => "1. Menyerap dan menyalurkan aspirasi mahasiswa secara objektif.\n2. Melaksanakan fungsi legislasi dan anggaran yang akuntabel.\n3. Mengawasi pelaksanaan program kerja ormawa secara berkelanjutan.",
                'divisions' => ['Komisi I: Legislasi & Regulasi', 'Komisi II: Pengawasan Anggaran & Program BEM', 'Komisi III: Aspirasi & Advokasi Mahasiswa', 'Badan Urusan Rumah Tangga (BURT)'],
                'website' => 'https://dpm.pnl.ac.id',
                'instagram' => '@dpm_pnl',
                'contact_email' => 'dpm@pnl.ac.id',
            ],

            // Category 2: 6 Himpunan Mahasiswa Jurusan (HMJ)
            [
                'name' => 'HIMATIK (Himpunan Mahasiswa Teknologi Informasi dan Komputer)',
                'slug' => 'himatik-pnl',
                'type' => 'hima',
                'category' => 'Technology & Academic',
                'logo' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
                'description' => 'Wadah bagi mahasiswa Jurusan TIK untuk berkembang di bidang rekayasa teknologi informasi, pelatihan pemrograman, pembinaan kontes KMIPN/Gemastik, riset teknologi cerdas, dan penguatan persaudaraan vokasi.',
                'vision' => 'Mewujudkan HIMATIK PNL sebagai wadah inovasi teknologi unggul dan berintegritas di tingkat nasional.',
                'mission' => "1. Meningkatkan kompetensi koding dan rekayasa perangkat lunak mahasiswa.\n2. Menyelenggarakan kompetisi dan workshop IT berkala.\n3. Membangun jejaring alumni dan industri teknologi.",
                'divisions' => ['Divisi Litbang & AI', 'Divisi Kominfo & Multimedia', 'Divisi PSDM Kaderisasi', 'Divisi Humas & Kemitraan Industri', 'Divisi Minat & Bakat'],
                'website' => 'https://himatik.pnl.ac.id',
                'instagram' => '@himatik_pnl',
                'contact_email' => 'himatik@pnl.ac.id',
            ],
            [
                'name' => 'HMS (Himpunan Mahasiswa Sipil)',
                'slug' => 'hms-pnl',
                'type' => 'hima',
                'category' => 'Engineering & Infrastructure',
                'logo' => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&auto=format&fit=crop&q=80',
                'description' => 'Wadah kemahasiswaan Jurusan Teknik Sipil yang aktif menyelenggarakan pelatihan software BIM/AutoCAD, bimbingan lomba jembatan dan beton nasional, serta bakti sosial bedah rumah dan sanitasi masyarakat.',
                'vision' => 'Membangun generasi insinyur sipil vokasi yang profesional, beretika, dan tanggap bencana.',
                'mission' => "1. Pelatihan terapan BIM dan perancangan konstruksi tahan gempa.\n2. Pembinaan delegasi kompetisi rancang jembatan nasional.\n3. Pengabdian infrastruktur pedesaan di wilayah Aceh.",
                'divisions' => ['Divisi Rekayasa Struktur & BIM', 'Divisi Keairan & Lingkungan', 'Divisi Pengabdian Sipil', 'Divisi Kaderisasi & PSDM'],
                'website' => 'https://hms.pnl.ac.id',
                'instagram' => '@hms_pnl',
                'contact_email' => 'hms@pnl.ac.id',
            ],
            [
                'name' => 'HMM (Himpunan Mahasiswa Mesin)',
                'slug' => 'hmm-pnl',
                'type' => 'hima',
                'category' => 'Mechanical & Automotive',
                'logo' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
                'description' => 'Mengembangkan keahlian rancang bangun mesin terapan, riset otomotif kendaraan hemat energi (KMHE / Shell Eco-Marathon), pengelasan presisi, dan pembinaan kedisiplinan kerja industri.',
                'vision' => 'Menjadi pusat riset rancang bangun manufaktur dan otomotif hemat energi terkemuka di Sumatera.',
                'mission' => "1. Menumbuhkan semangat Solidaritas Mesin Kuat (Solidarity Forever).\n2. Membangun prototype kendaraan hemat energi bersaing nasional.\n3. Peningkatan sertifikasi pengelasan berskala internasional.",
                'divisions' => ['Divisi Otomotif & Hemat Energi', 'Divisi Manufaktur & Fabrikasi', 'Divisi Kaderisasi & Solidarity Forever', 'Divisi Hubungan Luar & FMMI'],
                'website' => 'https://hmm.pnl.ac.id',
                'instagram' => '@hmm_pnl',
                'contact_email' => 'hmm@pnl.ac.id',
            ],
            [
                'name' => 'HMK (Himpunan Mahasiswa Kimia)',
                'slug' => 'hmk-pnl',
                'type' => 'hima',
                'category' => 'Chemical & Energy',
                'logo' => 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&auto=format&fit=crop&q=80',
                'description' => 'Mewadahi riset teknologi pengolahan minyak dan gas bumi, seminar industri petrokimia, inovasi pembuatan sabun/biogas ramah lingkungan, dan perlombaan chemical process engineering.',
                'vision' => 'Mewujudkan mahasiswa teknik kimia vokasi yang unggul dalam rekayasa proses industri dan transisi energi hijau.',
                'mission' => "1. Mengembangkan riset bioteknologi terapan dan bioenergi kelapa sawit.\n2. Menjalin kemitraan industri migas di Kawasan Industri Arun Lhokseumawe.\n3. Pelatihan simulasi Aspen HYSYS dan K3 industri kimia.",
                'divisions' => ['Divisi Riset Migas & Bioenergi', 'Divisi Kewirausahaan Kimia Terapan', 'Divisi Akademik & Simulasi Aspen', 'Divisi PSDM'],
                'website' => 'https://hmk.pnl.ac.id',
                'instagram' => '@hmk_pnl',
                'contact_email' => 'hmk@pnl.ac.id',
            ],
            [
                'name' => 'HME (Himpunan Mahasiswa Elektro)',
                'slug' => 'hme-pnl',
                'type' => 'hima',
                'category' => 'Electrical & Automation',
                'logo' => 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&auto=format&fit=crop&q=80',
                'description' => 'Menyelenggarakan workshop PLC/SCADA, pelatihan instalasi panel surya (PLTS), perakitan mikrokontroler IoT cerdas, dan pengabdian perbaikan instalasi listrik fasilitas umum.',
                'vision' => 'Pelopor inovasi ketenagalistrikan mandiri dan telekomunikasi digital berkelanjutan di kampus vokasi.',
                'mission' => "1. Pengembangan riset solar panel cerdas dan pembangkit energi terbarukan.\n2. Pembinaan kompetisi PLC SCADA dan mikrokontroler nasional.\n3. Pengabdian instalasi listrik penerangan rumah ibadah dan desa.",
                'divisions' => ['Divisi Energi Terbarukan & Tenaga Listrik', 'Divisi Otomasi & PLC SCADA', 'Divisi Telekomunikasi Digital', 'Divisi PSDM & Kaderisasi'],
                'website' => 'https://hme.pnl.ac.id',
                'instagram' => '@hme_pnl',
                'contact_email' => 'hme@pnl.ac.id',
            ],
            [
                'name' => 'HIMABIS (Himpunan Mahasiswa Bisnis)',
                'slug' => 'himabis-pnl',
                'type' => 'hima',
                'category' => 'Business & Economics',
                'logo' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
                'description' => 'Pusat pengembangan jiwa entrepreneur vokasi, simulasi perbankan syariah, inkubator bisnis mahasiswa, pelatihan perpajakan digital, dan kepemimpinan manajerial bisnis modern.',
                'vision' => 'Mencetak wirausahawan muda tangguh dan akuntan syariah profesional yang adaptif terhadap ekonomi digital.',
                'mission' => "1. Menumbuhkan startup mahasiswa melalui inkubator bisnis kampus.\n2. Simulasi transaksi perbankan syariah dan pasar modal syariah.\n3. Pelatihan software akuntansi Accurate dan pelaporan pajak e-SPT.",
                'divisions' => ['Divisi Inkubator Bisnis & Startup', 'Divisi Akuntansi Syariah & Pajak', 'Divisi Digital Marketing & Humas', 'Divisi Pengembangan Sumber Daya Anggota'],
                'website' => 'https://himabis.pnl.ac.id',
                'instagram' => '@himabis_pnl',
                'contact_email' => 'himabis@pnl.ac.id',
            ],

            // Category 3: Unit Kegiatan Mahasiswa (UKM)
            [
                'name' => 'POLICY (Polytechnic Linux Community)',
                'slug' => 'policy-pnl',
                'type' => 'ukm',
                'category' => 'Technology & Open Source',
                'logo' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80',
                'description' => 'Komunitas mahasiswa yang berfokus pada teknologi informasi berbasis open source (Linux), sistem operasi bebas, pemrograman backend/frontend, keamanan siber (CTF), dan infrastruktur server mandiri.',
                'vision' => 'Membudayakan adopsi teknologi open source berdaya guna dan mencetak talenta cyber defense berstandar industri.',
                'mission' => "1. Menggelar bootcamp sistem administrasi Linux dan DevOps.\n2. Mengikuti kompetisi Capture The Flag (CTF) dan ethical hacking nasional.\n3. Mengembangkan repositori piranti lunak terbuka untuk kampus.",
                'divisions' => ['Divisi Linux Administration & Server', 'Divisi Cyber Security & CTF', 'Divisi Open Source Software', 'Divisi Edukasi & Publikasi'],
                'website' => 'https://policy.pnl.ac.id',
                'instagram' => '@policy_pnl',
                'contact_email' => 'policy@pnl.ac.id',
            ],
            [
                'name' => 'POLYROBOCOM (Polytechnic Robotic Community)',
                'slug' => 'polyrobocom-pnl',
                'type' => 'ukm',
                'category' => 'Robotics & AI',
                'logo' => 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80',
                'description' => 'UKM bergengsi yang bergerak di bidang rancang bangun robot otonom, kecerdasan buatan robotik, elektronika mikrokontroler, dan mewakili PNL secara rutin dalam Kontes Robot Indonesia (KRI).',
                'vision' => 'Menjadi tim riset robotika terdepan yang berprestasi emas di Kontes Robot Indonesia (KRI) dan internasional.',
                'mission' => "1. Merancang robot SAR pemadam api berkaki dan beroda.\n2. Mengintegrasikan Computer Vision dan AI pada robot otonom.\n3. Menyelenggarakan kompetisi robotika tingkat pelajar di Sumatera.",
                'divisions' => ['Divisi Robot SAR & Bencana (KRSRI)', 'Divisi Robot Sepak Bola (KRSBI)', 'Divisi Robot Pemadam Api', 'Divisi Software & Vision AI'],
                'website' => 'https://polyrobocom.pnl.ac.id',
                'instagram' => '@polyrobocom_pnl',
                'contact_email' => 'polyrobocom@pnl.ac.id',
            ],
            [
                'name' => 'IECLOP (Improving English Club of Polytechnic)',
                'slug' => 'ieclop-pnl',
                'type' => 'ukm',
                'category' => 'Language & Global Communications',
                'logo' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&auto=format&fit=crop&q=80',
                'description' => 'Wadah peningkatan kompetensi bahasa Inggris mahasiswa PNL untuk persiapan kompetisi debat nasional (NUDC/KDMI), public speaking, TOEFL preparation, dan pertukaran internasional.',
                'vision' => 'Membentuk civitas vokasi yang fasih berkomunikasi global dan percaya diri di panggung internasional.',
                'mission' => "1. Pelatihan intensif debat sistem British Parliamentary.\n2. Kelas persiapan skor TOEFL/IELTS bagi beasiswa luar negeri.\n3. Storytelling, news casting, dan international student forum.",
                'divisions' => ['Divisi Parliamentary Debate', 'Divisi Speech & Public Speaking', 'Divisi TOEFL & Academic Writing', 'Divisi International Event'],
                'website' => 'https://ieclop.pnl.ac.id',
                'instagram' => '@ieclop_pnl',
                'contact_email' => 'ieclop@pnl.ac.id',
            ],
            [
                'name' => 'LDK-FORDIMA (Forum Diskusi Islam Mahasiswa)',
                'slug' => 'ldk-fordima-pnl',
                'type' => 'ukm',
                'category' => 'Religious & Social',
                'logo' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
                'description' => 'Lembaga dakwah kampus yang menyelenggarakan kajian tematik rutin, pembinaan akhlak islami, peringatan hari besar Islam, dan bakti sosial bantuan kemanusiaan bagi masyarakat luas.',
                'vision' => 'Mewujudkan insan kampus vokasi yang berkarakter islami, berwawasan luas, dan berkontribusi sosial.',
                'mission' => "1. Pembinaan mentoring keislaman mahasiswa baru.\n2. Penyelenggaraan kajian ilmiah bertema Islam kontemporer.\n3. Gerakan tanggap bencana dan santunan anak yatim dhuafa.",
                'divisions' => ['Divisi Syiar & Kajian Intelektual', 'Divisi Kaderisasi & Mentoring', 'Divisi Humas & Media Dakwah', 'Divisi Muslimah'],
                'website' => 'https://fordima.pnl.ac.id',
                'instagram' => '@ldkfordima_pnl',
                'contact_email' => 'ldkfordima@pnl.ac.id',
            ],
            [
                'name' => 'UKM-PA Edelweis (Pecinta Alam)',
                'slug' => 'mapala-edelweis-pnl',
                'type' => 'ukm',
                'category' => 'Nature & SAR',
                'logo' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
                'description' => 'Organisasi pecinta alam yang aktif dalam penjelajahan alam bebas, penanaman mangrove pesisir, susur gua dan tebing, serta tim terlatih Search and Rescue (SAR) penanggulangan bencana.',
                'vision' => 'Pionir pelestarian lingkungan hidup dan kerelawanan SAR yang tangguh dan menjunjung etika alam bebas.',
                'mission' => "1. Pelatihan panjat tebing (rock climbing), susur gua (caving), dan navigasi darat.\n2. Aksi konservasi mangrove dan pemulihan daerah aliran sungai.\n3. Kesiapsiagaan regu penyelamat Search and Rescue (SAR) di daerah rawan bencana.",
                'divisions' => ['Divisi Mountaineering & Caving', 'Divisi Rock Climbing', 'Divisi Konservasi Lingkungan', 'Divisi Search and Rescue (SAR)'],
                'website' => 'https://edelweis.pnl.ac.id',
                'instagram' => '@mapala_edelweis_pnl',
                'contact_email' => 'edelweis@pnl.ac.id',
            ],
            [
                'name' => 'UKM Sanggar Seni PNL',
                'slug' => 'sanggar-seni-pnl',
                'type' => 'ukm',
                'category' => 'Arts & Culture',
                'logo' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
                'description' => 'Wadah pelestarian warisan seni budaya Aceh (seperti Tari Saman, Ranup Lampuan, Rapai Geleng), produksi teater modern, paduan suara kampus, dan penyelenggara Festival Seni Aneuk Nanggroe.',
                'vision' => 'Melestarikan keluhuran seni budaya Nusantara dan mempromosikan tari kreasi tradisional Aceh ke ranah global.',
                'mission' => "1. Pembinaan tari tradisional (Ranup Lampuan, Saman, Seudati) dan kreasi baru.\n2. Produksi pementasan teater, musik etnik rapai, dan akustik modern.\n3. Perwakilan kontes seni dan festival budaya nasional.",
                'divisions' => ['Divisi Tari Tradisional Aceh', 'Divisi Musik Rapai & Modern Band', 'Divisi Teater & Sastra', 'Divisi Paduan Suara Mahasiswa'],
                'website' => 'https://sanggarseni.pnl.ac.id',
                'instagram' => '@sanggarseni_pnl',
                'contact_email' => 'sanggarseni@pnl.ac.id',
            ],
            [
                'name' => 'UKM Olahraga & Bela Diri PNL',
                'slug' => 'ukm-bela-diri-pnl',
                'type' => 'ukm',
                'category' => 'Sports & Martial Arts',
                'logo' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&auto=format&fit=crop&q=80',
                'description' => 'Wadah pembinaan kebugaran jasmani, mental tangguh, dan pembibitan atlet bela diri mahasiswa yang secara konsisten menyumbangkan medali emas dan perak di ajang PORSENI Politeknik se-Indonesia.',
                'vision' => 'Melahirkan atlet mahasiswa berprestasi emas nasional dengan sportivitas dan fisik prima.',
                'mission' => "1. Latihan intensif Taekwondo, Pencak Silat Merpati Putih, dan Tarung Derajat.\n2. Mengirimkan kontingen atlet di ajang Pekan Olahraga dan Seni (PORSENI) Politeknik.\n3. Menyelenggarakan turnamen olahraga antar jurusan di lingkungan PNL.",
                'divisions' => ['Divisi Pencak Silat Merpati Putih', 'Divisi Taekwondo Kyorugi & Poomsae', 'Divisi Futsal & Sepak Bola', 'Divisi Bulu Tangkis & Bola Voli'],
                'website' => 'https://olahraga.pnl.ac.id',
                'instagram' => '@ukmolahraga_pnl',
                'contact_email' => 'olahraga@pnl.ac.id',
            ],
        ];

        $validOrgSlugs = [];
        foreach ($organizationsData as $org) {
            $validOrgSlugs[] = $org['slug'];
            Organization::updateOrCreate(
                [
                    'university_id' => $univId,
                    'slug' => $org['slug'],
                ],
                [
                    'name' => $org['name'],
                    'type' => $org['type'],
                    'category' => $org['category'],
                    'logo' => $org['logo'],
                    'description' => $org['description'],
                    'vision' => $org['vision'],
                    'mission' => $org['mission'],
                    'divisions' => $org['divisions'],
                    'website' => $org['website'],
                    'instagram' => $org['instagram'],
                    'contact_email' => $org['contact_email'],
                    'status' => 'active',
                    'recruitment_open' => true,
                ]
            );
        }

        // Clean obsolete duplicate organizations in PNL (e.g. old slug 'himatik')
        Organization::where('university_id', $univId)
            ->whereNotIn('slug', $validOrgSlugs)
            ->delete();
    }
}
