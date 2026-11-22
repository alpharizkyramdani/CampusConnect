<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add prodi_code to departments table
        Schema::table('departments', function (Blueprint $table) {
            $table->string('prodi_code', 10)->nullable()->after('code')->index();
        });

        // 2. Add nip and gender to lecturer_profiles table
        Schema::table('lecturer_profiles', function (Blueprint $table) {
            $table->string('nip', 25)->nullable()->after('nidn')->index();
            $table->enum('gender', ['L', 'P'])->nullable()->after('nip');
        });

        // 3. Populate prodi_code for all 29 PNL departments
        $pnlProdiMapping = [
            // 1. Jurusan Teknologi Informasi dan Komputer (TIK)
            'TI-D4'    => '55301', // D4 Teknik Informatika
            'TRKJ-D4'  => '56301', // D4 Teknologi Rekayasa Komputer Jaringan
            'TRM-D4'   => '55302', // D4 Teknologi Rekayasa Multimedia
            'TRPL-D4'  => '55303', // D4 Teknologi Rekayasa Perangkat Lunak

            // 2. Jurusan Teknik Sipil
            'TKBA-D3'  => '22402', // D3 Teknologi Konstruksi Bangunan Air
            'TKJJ-D3'  => '22403', // D3 Teknologi Konstruksi Jalan dan Jembatan
            'TKBG-D3'  => '22404', // D3 Teknologi Konstruksi Bangunan Gedung
            'TRKJJ-D4' => '22301', // D4 Teknologi Rekayasa Konstruksi Jalan dan Jembatan
            'TRKBG-D4' => '22302', // D4 Teknologi Rekayasa Konstruksi Bangunan Gedung

            // 3. Jurusan Teknik Mesin
            'TM-D3'    => '21401', // D3 Teknologi Mesin
            'TIND-D3'  => '21402', // D3 Teknologi Industri
            'TRM-D4M'  => '21301', // D4 Teknologi Rekayasa Manufaktur
            'TRPF-D4'  => '21302', // D4 Teknologi Rekayasa Pengelasan dan Fabrikasi

            // 4. Jurusan Teknik Kimia
            'TK-D3'    => '24401', // D3 Teknologi Kimia
            'TPMG-D3'  => '24402', // D3 Teknologi Pengolahan Minyak dan Gas
            'TRKI-D4'  => '24301', // D4 Teknologi Rekayasa Kimia Industri

            // 5. Jurusan Teknik Elektro
            'TL-D3'    => '20401', // D3 Teknologi Listrik
            'TT-D3'    => '20402', // D3 Teknologi Telekomunikasi
            'TE-D3'    => '20403', // D3 Teknologi Elektronika
            'TRPE-D4'  => '20301', // D4 Teknologi Rekayasa Pembangkit Energi
            'TRJT-D4'  => '20302', // D4 Teknologi Rekayasa Jaringan Telekomunikasi
            'TRIK-D4'  => '20303', // D4 Teknologi Rekayasa Instrumentasi dan Kontrol
            'TRMK-D4'  => '20304', // D4 Teknologi Rekayasa Mekatronika

            // 6. Jurusan Bisnis (Tata Niaga)
            'AKT-D3'   => '62401', // D3 Akuntansi
            'AB-D3'    => '63411', // D3 Administrasi Bisnis
            'ALKS-D4'  => '62301', // D4 Akuntansi Lembaga Keuangan Syariah
            'ASP-D4'   => '62302', // D4 Akuntansi Sektor Publik
            'MKSP-D4'  => '61301', // D4 Manajemen Keuangan Sektor Publik
            'KIT-S2'   => '60202', // S2 Keuangan Islam Terapan
        ];

        foreach ($pnlProdiMapping as $code => $prodiCode) {
            DB::table('departments')
                ->where('university_id', 5)
                ->where('code', $code)
                ->update(['prodi_code' => $prodiCode]);
        }
    }

    public function down(): void
    {
        Schema::table('lecturer_profiles', function (Blueprint $table) {
            $table->dropColumn(['gender', 'nip']);
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('prodi_code');
        });
    }
};

