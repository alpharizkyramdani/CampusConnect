<?php

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $univId = 5;

        // Ensure faculties exist
        $faculties = Faculty::where('university_id', $univId)->pluck('id', 'code');

        // New programs to ensure created
        $newPrograms = [
            [
                'name' => 'D4 Bahasa Inggris untuk Komunikasi Bisnis dan Profesional',
                'code' => 'BIKBP-D4',
                'prodi_code' => '79308',
                'faculty_code' => 'JTN-PNL',
                'description' => 'Mencetak tenaga sarjana terapan komunikasi bisnis internasional, diplomasi korporat, dan content strategist terdigitalisasi.',
            ],
            [
                'name' => 'D4 Teknologi Rekayasa Kimia Berkelanjutan',
                'code' => 'TRKB-D4',
                'prodi_code' => '24309',
                'faculty_code' => 'JTK-PNL',
                'description' => 'Pendidikan vokasi rekayasa kimia hijau, pemanfaatan bioproses ramah lingkungan, dan mitigasi emisi industri masa depan.',
            ],
        ];

        foreach ($newPrograms as $prog) {
            $facultyId = $faculties[$prog['faculty_code']] ?? null;
            if ($facultyId) {
                Department::updateOrCreate(
                    [
                        'university_id' => $univId,
                        'name' => $prog['name'],
                    ],
                    [
                        'faculty_id' => $facultyId,
                        'code' => $prog['code'],
                        'prodi_code' => $prog['prodi_code'],
                        'description' => $prog['description'],
                    ]
                );
            }
        }

        // Full mapping requested by user
        $pnlProdiMapping = [
            'D4 Teknologi Rekayasa Konstruksi Jalan dan Jembatan' => '22302',
            'D4 Teknologi Rekayasa Kimia Industri'                => '24301',
            'D4 Teknologi Rekayasa Manufaktur'                    => '21301',
            'D4 Teknologi Rekayasa Jaringan Telekomunikasi'       => '20302',
            'D4 Teknologi Rekayasa Pembangkit Energi'             => '20305',
            'D4 Teknologi Rekayasa Instrumentasi dan Kontrol'     => '20301',
            'D4 Teknik Informatika'                               => '57301',
            'D4 Teknologi Rekayasa Komputer Jaringan'             => '90343',
            'D4 Teknologi Rekayasa Multimedia'                    => '58302',
            'D4 Teknologi Rekayasa Pengelasan dan Fabrikasi'      => '36303',
            'D4 Teknologi Rekayasa Konstruksi Bangunan Gedung'    => '22303',
            'D4 Akuntansi Lembaga Keuangan Syariah'               => '62301',
            'D4 Akuntansi Sektor Publik'                          => '62302',
            'D4 Manajemen Keuangan Sektor Publik'                 => '61306',
            'D4 Teknologi Rekayasa Mekatronika'                   => '21312',
            'D4 Teknologi Rekayasa Perangkat Lunak'               => '58305',
            'D4 Bahasa Inggris untuk Komunikasi Bisnis dan Profesional' => '79308',
            'D4 Teknologi Rekayasa Kimia Berkelanjutan'           => '24309',
            'D3 Teknologi Industri'                               => '21402',
            'D3 Teknologi Konstruksi Bangunan Air'                => '22402',
            'D3 Akuntansi'                                        => '62401',
            'D3 Teknologi Elektronika'                            => '20401',
            'D3 Teknologi Konstruksi Jalan dan Jembatan'          => '22403',
            'D3 Teknologi Pengolahan Minyak dan Gas'              => '32402',
            'D3 Teknologi Mesin'                                  => '21401',
            'D3 Teknologi Telekomunikasi'                         => '20402',
            'D3 Administrasi Bisnis'                              => '63411',
            'D3 Teknologi Listrik'                                => '20401',
            'D3 Teknologi Kimia'                                  => '24401',
            'S2 Keuangan Islam Terapan'                           => '60202',
            'S2 (Magister Terapan) Keuangan Islam Terapan'        => '60202',
        ];

        foreach ($pnlProdiMapping as $name => $prodiCode) {
            DB::table('departments')
                ->where('university_id', $univId)
                ->where('name', $name)
                ->update(['prodi_code' => $prodiCode]);
        }
    }

    public function down(): void
    {
        // Reversible if needed
    }
};

