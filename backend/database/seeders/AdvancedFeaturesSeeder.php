<?php

namespace Database\Seeders;

use App\Models\CampusLocation;
use App\Models\CampusPost;
use App\Models\CareerOpportunity;
use App\Models\ContentReport;
use App\Models\LibraryItem;
use App\Models\LibraryLoan;
use App\Models\Organization;
use App\Models\OrganizationFinance;
use App\Models\University;
use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Models\WorkProgram;
use Illuminate\Database\Seeder;

class AdvancedFeaturesSeeder extends Seeder
{
    public function run(): void
    {
        $univ = University::first() ?? University::create([
            'name' => 'Politeknik Negeri Lhokseumawe',
            'code' => 'PNL',
            'status' => 'active',
        ]);

        $students = User::whereHas('roleAssignments.role', fn($q) => $q->where('slug', 'student'))->get();
        if ($students->isEmpty()) {
            $students = User::where('email', 'not like', '%superadmin%')->take(3)->get();
        }

        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $adminUser = User::whereHas('roleAssignments.role', fn($q) => $q->where('slug', 'campus_admin'))->first() ?? $superAdmin;

        // 1. Seed default privacy settings for students
        foreach ($students as $student) {
            UserPrivacySetting::firstOrCreate(
                ['user_id' => $student->id],
                [
                    'profile_visibility' => 'campus',
                    'dm_permission' => 'everyone',
                    'notify_follow' => true,
                    'notify_message' => true,
                    'notify_like' => true,
                    'notify_comment' => true,
                    'notify_event' => true,
                ]
            );
        }
                ['user_id' => $student->id],
                [
                    'profile_visibility' => 'campus',
                    'dm_permission' => 'everyone',
                    'notify_follow' => true,
                    'notify_message' => true,
                    'notify_like' => true,
                    'notify_comment' => true,
                    'notify_event' => true,
                ]
            );
        }

        // 2. Seed Campus Locations for Map (Politeknik Negeri Lhokseumawe)
        $locations = [
            [
                'name' => 'Gedung Direktorat / Rektorat & Layanan Administrasi Pusat',
                'category' => 'administration',
                'description' => 'Pusat tata kelola institusi, Gedung Direktorat / Rektorat, layanan registrasi mahasiswa, biro kemahasiswaan, dan ruang sidang utama.',
                'lat' => 5.1229000,
                'lng' => 97.1568000,
                'photo' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 4,
                'facilities' => ['WiFi 6', 'Lift', 'AC Central', 'Musholla', 'Disability Ramp', 'ATM Center'],
                'opening_hours' => '07:30 - 17:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Jurusan TIK Politeknik Negeri Lhokseumawe',
                'category' => 'department',
                'description' => 'Pusat administrasi jurusan, ruang ketua & sekretaris jurusan, ruang dosen, dan layanan akademik mahasiswa Teknologi Informasi dan Komputer.',
                'lat' => 5.1207000,
                'lng' => 97.1575000,
                'photo' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 3,
                'facilities' => ['Ruang Administrasi Jurusan', 'Ruang Dosen TIK', 'Ruang Sidang Jurusan', 'WiFi Kampus', 'AC'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'PRODI TEKNIK INFORMATIKA',
                'category' => 'department',
                'description' => 'Titik layanan administrasi program studi, ruang koordinasi akademik prodi, dan pusat aktivitas praktikum mahasiswa Teknik Informatika.',
                'lat' => 5.1206000,
                'lng' => 97.1575000,
                'photo' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Ruang Kaprodi & Staf', 'Lab Riset Rekayasa Perangkat Lunak', 'Ruang Baca Referensi Prodi', 'WiFi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Gedung Teknologi Informasi dan Komputer',
                'category' => 'faculty',
                'description' => 'Gedung perkuliahan utama TIK serta pusat laboratorium komputer dan riset teknologi informasi di sayap barat kampus.',
                'lat' => 5.1177000,
                'lng' => 97.1553000,
                'photo' => 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 3,
                'facilities' => ['Lab Pemrograman', 'Lab Jaringan Komputer', 'Lab Multimedia & Pengolahan Citra', 'Ruang Kelas Teori AC', 'Musholla', 'WiFi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Perpustakaan PNL',
                'category' => 'library',
                'description' => 'UPT Perpustakaan PNL menyediakan layanan sirkulasi buku teks, repositori tugas akhir / skripsi, jurnal ilmiah, serta ruang baca & diskusi.',
                'lat' => 5.1201000,
                'lng' => 97.1573000,
                'photo' => 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Katalog Digital (OPAC)', 'Ruang Baca Ber-AC', 'Area Diskusi Mandiri', 'WiFi Kampus', 'Loker Penitipan'],
                'opening_hours' => '08:00 - 17:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Auditorium Kampus Politeknik Negeri Lhokseumawe',
                'category' => 'auditorium',
                'description' => 'Gedung serbaguna berkapasitas besar untuk wisuda, PKKMB, seminar nasional, kuliah umum, dan pameran inovasi karya teknologi.',
                'lat' => 5.1203000,
                'lng' => 97.1562000,
                'photo' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Panggung Utama', 'Sound System & Proyektor Besar', 'Kursi Tribun & VIP', 'AC Central', 'Toilet', 'Area Parkir Luas'],
                'opening_hours' => '08:00 - 17:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Masjid Al Bayan PNL',
                'category' => 'mosque',
                'description' => 'Pusat sarana ibadah utama sivitas akademika dan masyarakat sekitar lingkungan kampus Buketrata.',
                'lat' => 5.1195000,
                'lng' => 97.1571000,
                'photo' => 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Ruang Sholat Utama Luas', 'Tempat Wudhu Pria & Wanita', 'Sound System', 'Pendingin Ruangan', 'Pelataran Parkir'],
                'opening_hours' => '04:30 - 22:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Lab Pilot Plant Jurusan Teknik Kimia',
                'category' => 'laboratory',
                'description' => 'Unit percontohan industri mini untuk praktikum sintesis, perancangan alat proses, absorpsi, dan distilasi mahasiswa Teknik Kimia.',
                'lat' => 5.1198000,
                'lng' => 97.1570000,
                'photo' => 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Kolom Distilasi Industri', 'Tangki Reaktor Alir', 'Safety Shower & Eyewash', 'Ruang Kontrol Proses'],
                'opening_hours' => '08:00 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Jurusan Teknik Mesin (JTM), PNL',
                'category' => 'faculty',
                'description' => 'Gedung administrasi dan perkuliahan jurusan Teknik Mesin yang terletak di bagian timur kampus dekat jalan utama.',
                'lat' => 5.1205000,
                'lng' => 97.1582000,
                'photo' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Ruang Dosen & Administrasi Mesin', 'Ruang Kelas Teori AC', 'Laboratorium CAD/CAM', 'WiFi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Laboratorium Teknologi Mekanik',
                'category' => 'laboratory',
                'description' => 'Pusat bengkel manufaktur, mesin perkakas bubut, frais, CNC, bengkel las (welding), dan fabrikasi logam.',
                'lat' => 5.1193000,
                'lng' => 97.1579000,
                'photo' => 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Mesin Bubut & Milling', 'Mesin CNC Industri', 'Area Pengelasan SMAW/GMAW', 'Alat Pelindung Diri K3'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Teknik Sipil PNL',
                'category' => 'faculty',
                'description' => 'Gedung perkuliahan dan administrasi jurusan Teknik Sipil yang mencakup prodi Konstruksi Gedung dan Rekayasa Jalan & Jembatan.',
                'lat' => 5.1189000,
                'lng' => 97.1573000,
                'photo' => 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Ruang Dosen Sipil', 'Studio Gambar Teknik', 'Ruang Kelas AC', 'WiFi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Lab Teknik Sipil',
                'category' => 'laboratory',
                'description' => 'Laboratorium pengujian beton, mekanika tanah, hidrolika, jalan raya & aspal, serta laboratorium ukur tanah & pemetaan geodesi.',
                'lat' => 5.1186000,
                'lng' => 97.1574000,
                'photo' => 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Mesin Compression Test Beton', 'Saluran Terbuka Hidrolika', 'Oven & Ayakan Tanah', 'Total Station Geodesi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Jurusan Tata Niaga, PNL',
                'category' => 'faculty',
                'description' => 'Pusat akademik bidang Akuntansi Keuangan, Administrasi Bisnis, dan Manajemen Keuangan Perbankan.',
                'lat' => 5.1182000,
                'lng' => 97.1584000,
                'photo' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 3,
                'facilities' => ['Lab Mini Bank & Fintech', 'Lab Komputer Akuntansi', 'Ruang Simulasi Bisnis', 'Ruang Kelas AC', 'Musholla'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Sekretariat HME PNL',
                'category' => 'department',
                'description' => 'Pusat sekretariat Himpunan Mahasiswa Elektro (HME) dan koordinasi kegiatan kemahasiswaan jurusan Teknik Elektro.',
                'lat' => 5.1188000,
                'lng' => 97.1562000,
                'photo' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Ruang Rapat Himpunan', 'Papan Informasi Ormawa', 'WiFi', 'Meja Diskusi'],
                'opening_hours' => '08:00 - 20:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Gedung Jurusan Teknik Elektro (JTE) & Lab Terpadu',
                'category' => 'laboratory',
                'description' => 'Gedung perkuliahan dan laboratorium praktikum kelistrikan, elektronika, telekomunikasi, dan instrumentasi kontrol.',
                'lat' => 5.1192000,
                'lng' => 97.1564000,
                'photo' => 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 3,
                'facilities' => ['Lab Telekomunikasi', 'Lab Elektronika', 'Bengkel Listrik', 'WiFi', 'AC'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Gedung Jurusan Teknik Kimia (JTK) & Lab Pengolahan',
                'category' => 'faculty',
                'description' => 'Fasilitas perkuliahan dan laboratorium analisis kimia, operasi teknik kimia, serta ruang instrumentasi kimia.',
                'lat' => 5.1194000,
                'lng' => 97.1567000,
                'photo' => 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 2,
                'facilities' => ['Lab Kimia Analitik', 'Lab Mikrobiologi Industri', 'Safety Shower', 'WiFi'],
                'opening_hours' => '07:30 - 16:30',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Asrama Mahasiswa PNL',
                'category' => 'facility',
                'description' => 'Fasilitas hunian mahasiswa di dalam kawasan kampus Buketrata khusus bagi mahasiswa berprestasi dan perantau.',
                'lat' => 5.1169000,
                'lng' => 97.1565000,
                'photo' => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 3,
                'facilities' => ['Kamar Berfurnitur', 'Dapur Bersama', 'Keamanan 24 Jam', 'Musholla Asrama', 'WiFi'],
                'opening_hours' => '24 Jam (Khusus Penghuni)',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Sekretariat Mahasiswa Pencinta Alam (MAPALA PNL)',
                'category' => 'facility',
                'description' => 'Pusat sekretariat UKM MAPALA PNL, penyimpanan logistik pendakian, wall climbing, dan pembinaan kepetualangan.',
                'lat' => 5.1165000,
                'lng' => 97.1572000,
                'photo' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Papan Panjat Dinding (Wall Climbing)', 'Ruang Logistik Outdoor', 'Area Briefing'],
                'opening_hours' => '08:00 - 21:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Kantin Pusat & Pujasera Kampus',
                'category' => 'canteen',
                'description' => 'Area kuliner mahasiswa dan dosen yang menyediakan berbagai menu makanan berat, makanan ringan, minuman segar, dan pembayaran digital.',
                'lat' => 5.1205000,
                'lng' => 97.1570000,
                'photo' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Meja Makan Komunal', 'Pembayaran QRIS', 'Wastafel Bersih', 'WiFi Area'],
                'opening_hours' => '07:30 - 17:00',
                'phone' => '+62 645 42670',
            ],
            [
                'name' => 'Lapangan Olahraga & Tenis PNL',
                'category' => 'sports',
                'description' => 'Fasilitas olahraga luar ruang meliputi lapangan tenis, futsal/voli, dan area kebugaran bagi seluruh sivitas akademika.',
                'lat' => 5.1199000,
                'lng' => 97.1566000,
                'photo' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
                'floor_count' => 1,
                'facilities' => ['Lapangan Tenis Hardcourt', 'Lapangan Voli/Basket', 'Tribun Penonton', 'Lampu Sorot Malam'],
                'opening_hours' => '06:00 - 18:00',
                'phone' => '+62 645 42670',
            ],
        ];

        foreach ($locations as $loc) {
            CampusLocation::updateOrCreate(
                [
                    'university_id' => $univ->id,
                    'name' => $loc['name'],
                ],
                [
                    'category' => $loc['category'],
                    'description' => $loc['description'],
                    'latitude' => $loc['lat'],
                    'longitude' => $loc['lng'],
                    'photo_url' => $loc['photo'],
                    'floor_count' => $loc['floor_count'],
                    'facilities_available' => $loc['facilities'],
                    'opening_hours' => $loc['opening_hours'],
                    'contact_phone' => $loc['phone'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Seed Career Opportunities
        $careerList = [
            [
                'company' => 'GoTo Financial (Gojek & Tokopedia)',
                'logo' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
                'title' => 'Software Engineer Intern (Frontend React & Web Performance)',
                'cat' => 'internship',
                'loc' => 'Jakarta Selatan / Hybrid',
                'type' => 'hybrid',
                'desc' => 'Bergabunglah bersama tim engineering GoTo dalam membangun antarmuka aplikasi berskala jutaan pengguna. Anda akan bekerja langsung dengan senior developer menggunakan React, TypeScript, dan Tailwind CSS.',
                'req' => "• Mahasiswa aktif Teknik Informatika/Ilmu Komputer minimal semester 5.\n• Menguasai JavaScript/TypeScript, React hooks, dan REST API integration.\n• Memiliki portofolio proyek web yang dapat didemonstrasikan.",
                'ben' => "• Uang saku kompetitif (Rp 4.500.000 / bulan).\n• Mentorship intensif 1-on-1.\n• Kesempatan penawaran Full-Time Graduate Associate.",
                'deadline' => now()->addDays(28)->toDateString(),
                'salary' => 'Rp 4.500.000 - Rp 5.500.000 / bln',
                'email' => 'internship@goto.com',
            ],
            [
                'company' => 'Kementerian Komunikasi dan Digital RI (Komdigi)',
                'logo' => 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&auto=format&fit=crop&q=80',
                'title' => 'Beasiswa Digital Talent Scholarship 2026: Cloud Architecture & AI',
                'cat' => 'scholarship',
                'loc' => 'Nasional / Online Bersertifikat',
                'type' => 'remote',
                'desc' => 'Program beasiswa pelatihan intensif bersertifikasi global AWS Cloud Practitioner dan Google Cloud Associate Cloud Engineer untuk mahasiswa berprestasi di seluruh universitas Indonesia.',
                'req' => "• Warga Negara Indonesia civitas akademika aktif IPK minimal 3.25.\n• Lulus tes logika komputasi dasar.\n• Berkomitmen mengikuti program daring 3 bulan penuh.",
                'ben' => "• Biaya ujian sertifikasi internasional senilai \$300 ditanggung penuh.\n• Akses lab cloud computing gratis selama program.\n• Sertifikat resmi Kementerian Komdigi RI.",
                'deadline' => now()->addDays(35)->toDateString(),
                'salary' => 'Beasiswa Penuh Bersertifikasi Global',
                'email' => 'dts@komdigi.go.id',
            ],
            [
                'company' => 'Bank Mandiri (Persero) Tbk - Mandiri Digital',
                'logo' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80',
                'title' => 'Cybersecurity Analyst & Penetration Testing Associate',
                'cat' => 'full_time',
                'loc' => 'Jakarta Pusat / On-Site',
                'type' => 'on_site',
                'desc' => 'Mengidentifikasi kerentanan keamanan infrastruktur digital perbankan, melakukan simulasi ethical hacking (pen-testing), dan memonitor ancaman siber perbankan 24/7.',
                'req' => "• Lulusan S1/D4 Informatika/Teknik Komputer/Sistem Informasi.\n• Memahami OWASP Top 10, Network Security, dan Linux Security.\n• Sertifikasi CEH/CompTIA Security+ menjadi nilai tambah besar.",
                'ben' => "• Gaji pokok Rp 9.000.000 - Rp 13.000.000 + Asuransi Kesehatan Keluarga.\n• Bonus kinerja tahunan dan jenjang karier BUMN.\n• Program pelatihan spesialisasi keamanan siber internasional.",
                'deadline' => now()->addDays(45)->toDateString(),
                'salary' => 'Rp 9.000.000 - Rp 13.000.000 / bln',
                'email' => 'recruitment.digital@bankmandiri.co.id',
            ],
            [
                'company' => 'Google Developer Groups (GDG) Indonesia',
                'logo' => 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
                'title' => 'National Campus Hackathon 2026: Solutions for Smart Campus Ecosystem',
                'cat' => 'competition',
                'loc' => 'Yogyakarta / Hybrid',
                'type' => 'hybrid',
                'desc' => 'Kompetisi hackathon pengembangan solusi inovasi digital kampus tingkat nasional. Hadirkan inovasi software terbaik tim Anda dalam 48 jam dan raih pendanaan inkubasi startup!',
                'req' => "• Tim mahasiswa 3-4 orang dari universitas yang sama atau lintas kampus.\n• Membangun purwarupa aplikasi fungsional.\n• Pitching di hadapan juri venture capital & tech leaders.",
                'ben' => "• Total Hadiah Tunai Rp 120.000.000 untuk 3 tim juara.\n• Kredit Google Cloud \$10,000 per tim finalis.\n• Peluang investasi tahap awal (*Pre-Seed*).",
                'deadline' => now()->addDays(20)->toDateString(),
                'salary' => 'Total Hadiah Rp 120 Juta',
                'email' => 'hackathon@gdgindonesia.org',
            ],
            [
                'company' => 'Traveloka Indonesia',
                'logo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'title' => 'Product Design & UI/UX Specialist Part-Time',
                'cat' => 'part_time',
                'loc' => 'Remote / Fleksibel',
                'type' => 'remote',
                'desc' => 'Merancang user experience, wireframe, design system Figma, dan conducting user usability testing untuk modul pemesanan akomodasi dan pengalaman wisata Traveloka.',
                'req' => "• Mahasiswa tingkat akhir atau fresh graduate dengan portofolio Figma yang kuat.\n• Memahami kaidah Human-Centered Design dan design token.\n• Mampu berkomunikasi dalam Bahasa Indonesia dan Bahasa Inggris.",
                'ben' => "• Jam kerja fleksibel (20 jam/minggu, cocok untuk mahasiswa).\n• Kompensasi Rp 3.500.000 / bulan.\n• Bimbingan dari Principal Product Designer.",
                'deadline' => now()->addDays(18)->toDateString(),
                'salary' => 'Rp 3.500.000 / bln',
                'email' => 'design-career@traveloka.com',
            ],
        ];

        foreach ($careerList as $c) {
            CareerOpportunity::updateOrCreate(
                [
                    'company_name' => $c['company'],
                    'title' => $c['title'],
                ],
                [
                    'university_id' => $univ->id,
                    'created_by' => $adminUser->id,
                    'company_logo' => $c['logo'],
                    'category' => $c['cat'],
                    'location' => $c['loc'],
                    'type' => $c['type'],
                    'description' => $c['desc'],
                    'requirements' => $c['req'],
                    'benefits' => $c['ben'],
                    'deadline' => $c['deadline'],
                    'salary_range' => $c['salary'],
                    'contact_email' => $c['email'],
                    'is_verified' => true,
                    'status' => 'open',
                    'views_count' => rand(30, 250),
                ]
            );
        }

        // 4. Seed Digital Library Items
        $libraryItems = [
            [
                'title' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
                'author' => 'Robert C. Martin ("Uncle Bob")',
                'isbn' => '978-0132350884',
                'pub' => 'Prentice Hall',
                'year' => 2008,
                'cat' => 'academic_book',
                'desc' => 'Buku legendaris standar industri yang mengulas prinsip penulisan kode bersih, refactoring, code smells, dan perancangan arsitektur software yang mudah dirawat.',
                'cover' => 'https://images.unsplash.com/photo-1532012164546-f432f2e3dd42?w=400&auto=format&fit=crop&q=80',
                'total' => 6,
                'shelf' => 'Lantai 2 - Rak Pemrograman B-01',
            ],
            [
                'title' => 'Modern Operating Systems (4th Edition)',
                'author' => 'Andrew S. Tanenbaum & Herbert Bos',
                'isbn' => '978-0133591620',
                'pub' => 'Pearson Education',
                'year' => 2015,
                'cat' => 'academic_book',
                'desc' => 'Referensi komprehensif konsep sistem operasi: manajemen proses, virtual memory, concurrency, file systems, dan keamanan arsitektur sistem operasi modern.',
                'cover' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
                'total' => 4,
                'shelf' => 'Lantai 2 - Rak Sistem Operasi B-04',
            ],
            [
                'title' => 'Jurnal Nasional Teknologi Informasi & Komputer (JNTIK Vol. 14 No. 2)',
                'author' => 'Pusat Publikasi Ilmiah PNL',
                'isbn' => 'ISSN: 2549-8134',
                'pub' => 'PNL Press',
                'year' => 2024,
                'cat' => 'journal',
                'desc' => 'Kumpulan artikel penelitian terakreditasi SINTA 2 di bidang Machine Learning, Internet of Things, dan Cloud Computing dari para akademisi Indonesia.',
                'cover' => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80',
                'total' => 10,
                'shelf' => 'Lantai 1 - Rak Jurnal Ilmiah J-12',
            ],
            [
                'title' => 'Rancang Bangun Sistem Presensi Mahasiswa Berbasis Pengenalan Wajah dan IoT',
                'author' => 'Muhammad Rizki, S.Tr.Kom.',
                'isbn' => 'TA-PNL-2024-089',
                'pub' => 'Jurusan Teknologi Informasi & Komputer PNL',
                'year' => 2024,
                'cat' => 'thesis',
                'desc' => 'Karya tugas akhir mahasiswa predikat Cumlaude: implementasi model arsitektur FaceNet pada Raspberry Pi 4 untuk sistem absensi cerdas ruangan laboratorium.',
                'cover' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
                'total' => 3,
                'shelf' => 'Lantai 3 - Ruang Khusus Skripsi & TA S-22',
            ],
            [
                'title' => 'Modul Praktikum Jaringan Komputer Lanjut & Konfigurasi Router MikroTik',
                'author' => 'Tim Laboratorium Jaringan PNL',
                'isbn' => 'MOD-PNL-2024-NET',
                'pub' => 'Laboratorium Jaringan Komputer',
                'year' => 2024,
                'cat' => 'lab_module',
                'desc' => 'Panduan praktis mahasiswa dalam konfigurasi VLAN, OSPF Dynamic Routing, Bandwidth Management, dan Firewall Filter menggunakan MikroTik RouterOS v7.',
                'cover' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
                'total' => 15,
                'shelf' => 'Lantai 1 - Rak Modul Praktikum M-03',
            ],
            [
                'title' => 'Database System Concepts (7th Edition)',
                'author' => 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
                'isbn' => '978-0078022159',
                'pub' => 'McGraw-Hill Education',
                'year' => 2019,
                'cat' => 'general_reference',
                'desc' => 'Buku babon basis data: model relasional, aljabar relasional, normalisasi BCNF/3NF, transaction processing, indexing B-Tree, dan NoSQL databases.',
                'cover' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
                'total' => 5,
                'shelf' => 'Lantai 2 - Rak Basis Data B-08',
            ],
        ];

        foreach ($libraryItems as $item) {
            LibraryItem::updateOrCreate(
                [
                    'university_id' => $univ->id,
                    'title' => $item['title'],
                ],
                [
                    'author' => $item['author'],
                    'isbn_issn' => $item['isbn'],
                    'publisher' => $item['pub'],
                    'publication_year' => $item['year'],
                    'category' => $item['cat'],
                    'description' => $item['desc'],
                    'cover_image' => $item['cover'],
                    'total_copies' => $item['total'],
                    'available_copies' => $item['total'] - 1, // 1 borrowed
                    'shelf_location' => $item['shelf'],
                    'is_digital_access' => true,
                    'borrow_count' => rand(15, 60),
                ]
            );
        }

        // 5. Seed Organization Work Programs & Finances
        $org = Organization::first();
        if ($org) {
            $programs = [
                [
                    'name' => 'Seminar Nasional & Expo Teknologi Informasi 2026',
                    'desc' => 'Seminar berskala nasional mengundang praktisi Big Tech dan expo karya tugas akhir mahasiswa.',
                    'start' => now()->addDays(40)->toDateString(),
                    'end' => now()->addDays(42)->toDateString(),
                    'budget' => 15000000,
                    'status' => 'planned',
                ],
                [
                    'name' => 'Workshop UI/UX Design & Coding Bootcamp Mahasiswa Baru',
                    'desc' => 'Pelatihan intensif 3 hari pengenalan tools desain Figma dan dasar web development.',
                    'start' => now()->subDays(10)->toDateString(),
                    'end' => now()->subDays(8)->toDateString(),
                    'budget' => 4500000,
                    'status' => 'completed',
                ],
                [
                    'name' => 'Lomba Coding Hackfest Antar Program Studi',
                    'desc' => 'Kompetisi problem solving algoritma pemrograman kompetitif untuk mengasah daya saing mahasiswa.',
                    'start' => now()->addDays(15)->toDateString(),
                    'end' => now()->addDays(16)->toDateString(),
                    'budget' => 6000000,
                    'status' => 'in_progress',
                ],
            ];

            foreach ($programs as $prog) {
                WorkProgram::updateOrCreate(
                    [
                        'organization_id' => $org->id,
                        'name' => $prog['name'],
                    ],
                    [
                        'description' => $prog['desc'],
                        'start_date' => $prog['start'],
                        'end_date' => $prog['end'],
                        'budget' => $prog['budget'],
                        'status' => $prog['status'],
                    ]
                );
            }

            $finances = [
                ['title' => 'Sponsorship Utama dari Telkom Indonesia', 'type' => 'income', 'amount' => 10000000, 'cat' => 'Sponsorship', 'date' => now()->subDays(25)->toDateString()],
                ['title' => 'Dana Hibah Kemahasiswaan Universitas', 'type' => 'income', 'amount' => 5000000, 'cat' => 'Dana Universitas', 'date' => now()->subDays(20)->toDateString()],
                ['title' => 'Iuran Kas Anggota Pengurus Semester Ini', 'type' => 'income', 'amount' => 1200000, 'cat' => 'Kas Anggota', 'date' => now()->subDays(18)->toDateString()],
                ['title' => 'Konsumsi Peserta Workshop UI/UX', 'type' => 'expense', 'amount' => 1850000, 'cat' => 'Konsumsi', 'date' => now()->subDays(9)->toDateString()],
                ['title' => 'Cetak Sertifikat & Plakat Pemateri', 'type' => 'expense', 'amount' => 750000, 'cat' => 'Perlengkapan', 'date' => now()->subDays(8)->toDateString()],
                ['title' => 'Sewa Domain & Server Hosting Proyek Riset UKM', 'type' => 'expense', 'amount' => 650000, 'cat' => 'Operasional IT', 'date' => now()->subDays(5)->toDateString()],
            ];

            foreach ($finances as $fin) {
                OrganizationFinance::firstOrCreate(
                    [
                        'organization_id' => $org->id,
                        'title' => $fin['title'],
                    ],
                    [
                        'type' => $fin['type'],
                        'amount' => $fin['amount'],
                        'transaction_date' => $fin['date'],
                        'category' => $fin['cat'],
                        'description' => 'Tercatat dalam pembukuan resmi bendahara organisasi.',
                        'created_by' => $adminUser->id,
                    ]
                );
            }
        }

        // 6. Seed Sample Content Reports (for Moderation Dashboard)
        $posts = CampusPost::take(3)->get();
        if ($posts->isNotEmpty() && $students->isNotEmpty()) {
            ContentReport::firstOrCreate(
                [
                    'reporter_id' => $students->first()->id,
                    'reportable_type' => 'post',
                    'reportable_id' => $posts->first()->id,
                ],
                [
                    'reported_user_id' => $posts->first()->user_id,
                    'university_id' => $univ->id,
                    'category' => 'spam',
                    'reason' => 'Postingan ini mengandung promosi jasa joki tugas akademik yang berulang-ulang.',
                    'status' => 'pending',
                ]
            );
        }
    }
}
