<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users table additions: Identity Verification
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_verified')) {
                $table->boolean('is_verified')->default(true)->after('status');
            }
            if (!Schema::hasColumn('users', 'verification_status')) {
                $table->string('verification_status')->default('verified')->after('is_verified'); // pending, verified, rejected
            }
            if (!Schema::hasColumn('users', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verification_status');
            }
            if (!Schema::hasColumn('users', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()->after('verified_at');
            }
        });

        // 2. Facility Borrowings: Handover and Return Photo Proofs
        Schema::table('facility_borrowings', function (Blueprint $table) {
            if (!Schema::hasColumn('facility_borrowings', 'pickup_photo_url')) {
                $table->string('pickup_photo_url')->nullable()->after('admin_notes');
            }
            if (!Schema::hasColumn('facility_borrowings', 'return_photo_url')) {
                $table->string('return_photo_url')->nullable()->after('pickup_photo_url');
            }
            if (!Schema::hasColumn('facility_borrowings', 'pickup_notes')) {
                $table->text('pickup_notes')->nullable()->after('return_photo_url');
            }
        });

        // 3. Service Requests: Verifiable Document Code & Hash
        Schema::table('service_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('service_requests', 'doc_verification_code')) {
                $table->string('doc_verification_code', 100)->nullable()->unique()->after('result_document_url');
            }
            if (!Schema::hasColumn('service_requests', 'verification_hash')) {
                $table->string('verification_hash', 128)->nullable()->after('doc_verification_code');
            }
            if (!Schema::hasColumn('service_requests', 'is_verified_document')) {
                $table->boolean('is_verified_document')->default(false)->after('verification_hash');
            }
        });

        // 4. Maintenance Reports: Sarpras Admin Resolution & Completion Proof
        Schema::table('maintenance_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('maintenance_reports', 'technician_notes')) {
                $table->text('technician_notes')->nullable()->after('resolution_notes');
            }
            if (!Schema::hasColumn('maintenance_reports', 'completion_photo_url')) {
                $table->string('completion_photo_url')->nullable()->after('technician_notes');
            }
        });

        // 5. Campus Posts: Category Filter
        Schema::table('campus_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('campus_posts', 'category')) {
                $table->string('category')->default('Diskusi')->after('university_id');
            }
        });

        // 6. Ensure Roles exist
        Role::firstOrCreate(
            ['slug' => 'sarpras_admin'],
            [
                'name' => 'Sarpras Admin',
                'scope_level' => 'university',
                'description' => 'Tim Sarana dan Prasarana Kampus PNL yang mengelola fasilitas, perbaikan, dan peralatan.',
            ]
        );

        Role::firstOrCreate(
            ['slug' => 'alumni'],
            [
                'name' => 'Alumni PNL',
                'scope_level' => 'university',
                'description' => 'Lulusan civitas Politeknik Negeri Lhokseumawe dengan akses jejaring karier dan alumni hub.',
            ]
        );
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['is_verified', 'verification_status', 'verified_at', 'verified_by']);
        });

        Schema::table('facility_borrowings', function (Blueprint $table) {
            $table->dropColumn(['pickup_photo_url', 'return_photo_url', 'pickup_notes']);
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['doc_verification_code', 'verification_hash', 'is_verified_document']);
        });

        Schema::table('maintenance_reports', function (Blueprint $table) {
            $table->dropColumn(['technician_notes', 'completion_photo_url']);
        });

        Schema::table('campus_posts', function (Blueprint $table) {
            $table->dropColumn(['category']);
        });
    }
};
