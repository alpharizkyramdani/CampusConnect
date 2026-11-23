<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\FacilityCategory;
use App\Models\InventoryMovement;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PnlEquipmentBorrowingSeeder extends Seeder
{
    public function run(): void
    {
        $pnl = University::firstOrCreate(
            ['id' => 5],
            [
                'name' => 'Politeknik Negeri Lhokseumawe',
                'slug' => 'politeknik-negeri-lhokseumawe',
                'code' => 'PNL',
                'email' => 'info@pnl.ac.id',
                'website' => 'https://pnl.ac.id',
                'status' => 'active',
            ]
        );
        $univId = $pnl->id;

        // 1. Create or Find Facility Categories for PNL
        $categoriesData = [
            'av' => [
                'name' => 'Audiovisual & Multimedia',
                'description' => 'Proyektor multimedia beresolusi tinggi, kamera bioskop mirrorless, sistem mikrofon nirkabel, dan perangkat VR/AR.',
            ],
            'iot' => [
                'name' => 'Lab Hardware & IoT',
                'description' => 'Kit mikrokontroler embedded system, single-board computer Raspberry Pi, rackmount router & switch industri, dan drone inspeksi.',
            ],
            'electro' => [
                'name' => 'Alat Ukur & Instrumen Elektronika',
                'description' => 'Osiloskop digital storage multichannel, multimeter presisi True-RMS, function generator, dan regulated DC power supply.',
            ],
            'fabrication' => [
                'name' => 'Fabrikasi & Manufaktur Presisi',
                'description' => 'Mesin 3D printing suhu tinggi, jangka sorong digital mikron, alat ukur presisi bubut & milling bengkel mekanik.',
            ],
            'survey' => [
                'name' => 'Peralatan Surveying & Geodesi',
                'description' => 'Instrumen optik Total Station geodesi, automatic optical level, tripod surveyor, dan prisma reflektor pengukur elevasi.',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $key => $cat) {
            $categories[$key] = FacilityCategory::updateOrCreate(
                [
                    'university_id' => $univId,
                    'name' => $cat['name'],
                ],
                [
                    'description' => $cat['description'],
                ]
            );
        }

        // Helper to find department by code or prodi code or fallback to first department
        $getDeptId = function (string $code, string $prodiCode) use ($univId) {
            $dept = Department::where('university_id', $univId)
                ->where(function ($q) use ($code, $prodiCode) {
                    $q->where('code', $code)->orWhere('prodi_code', $prodiCode);
                })
                ->first();

            return $dept ? $dept->id : Department::where('university_id', $univId)->first()?->id;
        };

        // 2. Define 12 Realistic Campus Equipment Items for PNL
        $equipmentList = [
            [
                'name' => 'Epson EB-2250U 4K Wireless Presentation Projector',
                'code' => 'PNL-TIK-PRJ01',
                'category_key' => 'av',
                'dept_code' => 'TI-D4',
                'prodi_code' => '57301',
                'description' => 'Proyektor multimedia 5.000 ANSI lumens resolusi WUXGA/4K didukung Wi-Fi Screen Mirroring, port dual HDMI, dan built-in speaker 16W untuk seminar, sidang tugas akhir, dan presentasi kuliah.',
                'photo_url' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 6,
                'available_quantity' => 4,
                'location' => 'Gedung TIK Lantai 2 - Ruang Sarpras Lab',
            ],
            [
                'name' => 'Sony Alpha A7 III Full-Frame Cinema & Photo Kit',
                'code' => 'PNL-TIK-CAM01',
                'category_key' => 'av',
                'dept_code' => 'TRM-D4',
                'prodi_code' => '58302',
                'description' => 'Kamera mirrorless full-frame 4K HDR dilengkapi lensa Sony G-Master 24-70mm f/2.8 GM, 2 baterai NP-FZ100, SD Card SanDisk Extreme Pro 128GB V90, filter ND, dan hardcase pelindung untuk tugas produksi multimedia dan dokumentasi kampus.',
                'photo_url' => 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 4,
                'available_quantity' => 3,
                'location' => 'Gedung TIK Lantai 3 - Studio Multimedia & Animasi',
            ],
            [
                'name' => 'DJI Mavic 3 Enterprise Thermal & Mapping Drone Kit',
                'code' => 'PNL-TIK-DRN01',
                'category_key' => 'iot',
                'dept_code' => 'TRKJ-D4',
                'prodi_code' => '90343',
                'description' => 'Drone industri inspeksi udara dan fotogrametri berpresisi tinggi dengan sensor thermal radiometrik 640x512, kamera hybrid zoom 56x, modul RTK sentimeter, 3 smart battery pack, dan remote screen controller DJI RC Pro.',
                'photo_url' => 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80',
                'condition' => 'good',
                'total_quantity' => 3,
                'available_quantity' => 2,
                'location' => 'Gedung TIK Lantai 2 - Lab Jaringan & Komputasi',
            ],
            [
                'name' => 'Meta Quest 2 VR Headset & Link Cable Development Kit (256GB)',
                'code' => 'PNL-TIK-VR01',
                'category_key' => 'av',
                'dept_code' => 'TRPL-D4',
                'prodi_code' => '58305',
                'description' => 'Headset Virtual Reality 6DoF standalone resolusi 1832x1920 per mata dengan dual Touch Controllers, strap ergonomis, dan kabel serat optik Oculus Link Type-C 5 meter untuk pengembangan simulasi interaktif Unity & Unreal Engine.',
                'photo_url' => 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 6,
                'available_quantity' => 5,
                'location' => 'Gedung TIK Lantai 3 - Lab Rekayasa Perangkat Lunak',
            ],
            [
                'name' => 'Arduino Mega 2560 & Raspberry Pi 4 Embedded IoT Master Kit',
                'code' => 'PNL-TIK-IOT01',
                'category_key' => 'iot',
                'dept_code' => 'TI-D4',
                'prodi_code' => '57301',
                'description' => 'Koper riset sistem tertanam lengkap berisi SBC Raspberry Pi 4 Model B (RAM 8GB), Arduino Mega 2560 R3, modul ESP32 Wi-Fi/BLE, sensor jarak LiDAR TF-Luna, sensor gas MQ-2/MQ-135, display LCD I2C, breadboard, dan jumper lengkap.',
                'photo_url' => 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 15,
                'available_quantity' => 12,
                'location' => 'Gedung TIK Lantai 1 - Lab IoT & Hardware',
            ],
            [
                'name' => 'Boya BY-WM8 Pro-K2 UHF Dual Wireless Lavalier Microphone Kit',
                'code' => 'PNL-TIK-MIC01',
                'category_key' => 'av',
                'dept_code' => 'TRM-D4',
                'prodi_code' => '58302',
                'description' => 'Sistem mikrofon nirkabel clip-on UHF 48-channel anti-interferensi berisi 2 bodypack transmitter, 1 receiver portabel kamera/smartphone, mikrofon lavalier omnidirectional, dan adaptor output XLR/3.5mm untuk podcast dan liputan kampus.',
                'photo_url' => 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 8,
                'available_quantity' => 7,
                'location' => 'Gedung TIK Lantai 3 - Studio Multimedia',
            ],
            [
                'name' => 'Cisco Catalyst 2960-X Gigabit Switch & 2911 ISR Router Lab Rack',
                'code' => 'PNL-TIK-NET01',
                'category_key' => 'iot',
                'dept_code' => 'TRKJ-D4',
                'prodi_code' => '90343',
                'description' => 'Rackmount modular enterprise Cisco Catalyst 2960-X Switch 24-Port Gigabit PoE+ dan Cisco 2911 Integrated Services Router dilengkapi kabel console rollover USB-RJ45 untuk simulasi routing BGP, OSPF, VLAN, dan sertifikasi CCNA.',
                'photo_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
                'condition' => 'good',
                'total_quantity' => 5,
                'available_quantity' => 4,
                'location' => 'Gedung TIK Lantai 2 - Server Room & Lab Jaringan',
            ],
            [
                'name' => 'Rigol DS1054Z 4-Channel Digital Storage Oscilloscope (100MHz)',
                'code' => 'PNL-ELE-OSC01',
                'category_key' => 'electro',
                'dept_code' => 'TRIK-D4',
                'prodi_code' => '20301',
                'description' => 'Osiloskop digital 4-channel dengan teknologi UltraVision, real-time waveform capture rate hingga 30.000 wfms/s, sampling 1 GSa/s, dan layar TFT warna 7 inci untuk praktikum elektronika analog/digital dan kendali industri.',
                'photo_url' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
                'condition' => 'good',
                'total_quantity' => 8,
                'available_quantity' => 7,
                'location' => 'Gedung Teknik Elektro - Lab Instrumentasi & Kontrol',
            ],
            [
                'name' => 'Fluke 87V Industrial True-RMS Digital Multimeter',
                'code' => 'PNL-ELE-MLT01',
                'category_key' => 'electro',
                'dept_code' => 'TL-D3',
                'prodi_code' => '20401',
                'description' => 'Multimeter industri akurasi tinggi True-RMS dengan rentang pengukuran tegangan AC/DC 1000V, arus 10A, frekuensi hingga 200 kHz, dan probe termometer untuk kalibrasi panel distribusi daya serta motor listrik industri.',
                'photo_url' => 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 12,
                'available_quantity' => 10,
                'location' => 'Gedung Teknik Elektro - Bengkel Listrik Industri',
            ],
            [
                'name' => 'Topcon GM-55 Total Station Surveying Kit',
                'code' => 'PNL-SIP-TTS01',
                'category_key' => 'survey',
                'dept_code' => 'TRKJJ-D4',
                'prodi_code' => '22302',
                'description' => 'Instrumen optoelektronik ukur sudut dan jarak berakurasi 5 detik, jangkauan reflectorless hingga 500m, tripod aluminium tugas berat, serta prisma poligon tiang ganda untuk praktikum geodesi dan pengukuran kontur jalan/jembatan.',
                'photo_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
                'condition' => 'good',
                'total_quantity' => 4,
                'available_quantity' => 3,
                'location' => 'Gedung Teknik Sipil Lantai 1 - Lab Geodesi & Surveying',
            ],
            [
                'name' => 'Creality Ender 3 S1 Pro High-Precision 3D Printer',
                'code' => 'PNL-MES-3DP01',
                'category_key' => 'fabrication',
                'dept_code' => 'TRM-D4M',
                'prodi_code' => '21301',
                'description' => 'Printer 3D presisi tinggi dengan nozzle suhu tinggi 300°C, direct dual-gear extruder "Sprite" full logam, auto bed leveling CR-Touch 16-titik, dan pelat pegas baja PEI kompatibel filamen PLA, ABS, TPU, dan Nylon.',
                'photo_url' => 'https://images.unsplash.com/photo-1631556097152-c39479bcffea?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 5,
                'available_quantity' => 4,
                'location' => 'Gedung Teknik Mesin - Lab CAD/CAM & Prototyping',
            ],
            [
                'name' => 'Mitutoyo 500-196-30 AOS Digimatic Vernier Caliper (0-150mm)',
                'code' => 'PNL-MES-JKS01',
                'category_key' => 'fabrication',
                'dept_code' => 'TM-D3',
                'prodi_code' => '21401',
                'description' => 'Jangka sorong digital presisi tinggi buatan Jepang dengan sensor induksi elektromagnetik Advanced Onsite (AOS), resolusi 0.01 mm, rahang ukur baja karbon terkarburasi, dan sertifikat kalibrasi pabrik.',
                'photo_url' => 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80',
                'condition' => 'excellent',
                'total_quantity' => 15,
                'available_quantity' => 13,
                'location' => 'Gedung Teknik Mesin - Bengkel Bubut & Milling',
            ],
        ];

        $seededFacilities = [];
        $adminUser = User::where('email', 'admin.jurusan@pnl.ac.id')->first() 
            ?? User::where('email', 'adminpnl@ac.id')->first() 
            ?? User::first();

        foreach ($equipmentList as $item) {
            $deptId = $getDeptId($item['dept_code'], $item['prodi_code']);
            $catId = $categories[$item['category_key']]->id ?? null;

            $facility = Facility::updateOrCreate(
                ['code' => $item['code']],
                [
                    'university_id' => $univId,
                    'department_id' => $deptId,
                    'category_id' => $catId,
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'photo_url' => $item['photo_url'],
                    'condition' => $item['condition'],
                    'total_quantity' => $item['total_quantity'],
                    'available_quantity' => $item['available_quantity'],
                    'location' => $item['location'],
                ]
            );

            $seededFacilities[$item['code']] = $facility;

            if ($adminUser) {
                InventoryMovement::firstOrCreate(
                    [
                        'facility_id' => $facility->id,
                        'type' => 'restock',
                    ],
                    [
                        'user_id' => $adminUser->id,
                        'quantity' => $facility->total_quantity,
                        'notes' => 'Registrasi inventaris sarana & prasarana laboratorium PNL',
                    ]
                );
            }
        }

        // 3. Seed Realistic Borrowing Records
        $studentKhalil = User::where('email', 'khalil12@gmail.com')->first();
        $studentAulia = User::where('email', 'student.pnl@campusconnect.id')->first() ?? $studentKhalil;

        if ($studentKhalil && isset($seededFacilities['PNL-TIK-PRJ01'])) {
            $facPrj = $seededFacilities['PNL-TIK-PRJ01'];
            FacilityBorrowing::updateOrCreate(
                [
                    'facility_id' => $facPrj->id,
                    'user_id' => $studentKhalil->id,
                    'purpose' => 'Peminjaman proyektor untuk kegiatan lokakarya dan seminar Himpunan Mahasiswa TIK di Ruang Sidang Lt. 3.',
                ],
                [
                    'university_id' => $univId,
                    'department_id' => $facPrj->department_id,
                    'quantity' => 1,
                    'borrow_date' => Carbon::now()->addDays(1)->setTime(9, 0),
                    'return_due_date' => Carbon::now()->addDays(2)->setTime(16, 0),
                    'status' => 'pending',
                    'admin_notes' => 'Menunggu verifikasi jadwal penggunaan ruang sidang dari Admin Jurusan.',
                ]
            );
        }

        if ($studentAulia && isset($seededFacilities['PNL-TIK-CAM01'])) {
            $facCam = $seededFacilities['PNL-TIK-CAM01'];
            FacilityBorrowing::updateOrCreate(
                [
                    'facility_id' => $facCam->id,
                    'user_id' => $studentAulia->id,
                    'purpose' => 'Dokumentasi peliputan video profil pameran inovasi teknologi civitas akademika PNL 2026.',
                ],
                [
                    'university_id' => $univId,
                    'department_id' => $facCam->department_id,
                    'quantity' => 1,
                    'borrow_date' => Carbon::now()->setTime(8, 30),
                    'return_due_date' => Carbon::now()->addDays(3)->setTime(17, 0),
                    'status' => 'approved',
                    'approved_by' => $adminUser?->id,
                    'admin_notes' => 'Disetujui. Harap periksa kondisi lensa, filter ND, dan kelengkapan baterai saat pengambilan di Studio Multimedia.',
                ]
            );
        }

        if ($studentKhalil && isset($seededFacilities['PNL-TIK-IOT01'])) {
            $facIot = $seededFacilities['PNL-TIK-IOT01'];
            FacilityBorrowing::updateOrCreate(
                [
                    'facility_id' => $facIot->id,
                    'user_id' => $studentKhalil->id,
                    'purpose' => 'Pengujian sensor kelembapan tanah dan gateway LoRaWAN untuk tugas akhir capstone project sistem irigasi pintar.',
                ],
                [
                    'university_id' => $univId,
                    'department_id' => $facIot->department_id,
                    'quantity' => 2,
                    'borrow_date' => Carbon::now()->subDays(2)->setTime(10, 0),
                    'return_due_date' => Carbon::now()->addDays(5)->setTime(17, 0),
                    'status' => 'borrowed',
                    'approved_by' => $adminUser?->id,
                    'handed_over_by' => $adminUser?->id,
                    'admin_notes' => 'Peralatan telah diserahkan di Lab IoT dalam keadaan lengkap dan segel komponen utuh.',
                ]
            );
        }

        if ($studentAulia && isset($seededFacilities['PNL-TIK-MIC01'])) {
            $facMic = $seededFacilities['PNL-TIK-MIC01'];
            FacilityBorrowing::updateOrCreate(
                [
                    'facility_id' => $facMic->id,
                    'user_id' => $studentAulia->id,
                    'purpose' => 'Perekaman wawancara narasumber alumni berprestasi untuk konten kanal resmi YouTube PNL.',
                ],
                [
                    'university_id' => $univId,
                    'department_id' => $facMic->department_id,
                    'quantity' => 1,
                    'borrow_date' => Carbon::now()->subDays(7)->setTime(9, 0),
                    'return_due_date' => Carbon::now()->subDays(5)->setTime(17, 0),
                    'actual_return_date' => Carbon::now()->subDays(5)->setTime(15, 30),
                    'status' => 'returned',
                    'approved_by' => $adminUser?->id,
                    'received_by' => $adminUser?->id,
                    'return_condition' => 'excellent',
                    'admin_notes' => 'Peralatan dikembalikan tepat waktu, kabel dan transmitter berfungsi normal tanpa cacat.',
                ]
            );
        }
    }
}

