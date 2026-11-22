<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop obsolete tables that are no longer used
        Schema::dropIfExists('university_registration_requests');
        Schema::dropIfExists('university_settings');

        // 2. Clean up orphaned records from old test universities (non-PNL)
        // Keep only PNL (Politeknik Negeri Lhokseumawe) records
        $pnlId = DB::table('universities')->where('code', 'PNL')->value('id') ?? 5;

        // Fix user role assignments pointing to deleted/old universities
        DB::table('user_role_assignments')
            ->whereNotNull('university_id')
            ->where('university_id', '!=', $pnlId)
            ->update([
                'university_id' => $pnlId,
                'department_id' => null, // clear invalid legacy department
            ]);

        // Fix users default_university_id
        DB::table('users')
            ->whereNotNull('default_university_id')
            ->where('default_university_id', '!=', $pnlId)
            ->update(['default_university_id' => $pnlId]);

        // Remove orphaned facilities from legacy test universities
        DB::table('facilities')->where('university_id', '!=', $pnlId)->delete();

        // Remove orphaned organizations from legacy test universities
        DB::table('organizations')->where('university_id', '!=', $pnlId)->delete();

        // Remove orphaned departments from legacy test universities
        DB::table('departments')->where('university_id', '!=', $pnlId)->delete();

        // Remove orphaned faculties from legacy test universities
        DB::table('faculties')->where('university_id', '!=', $pnlId)->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('university_registration_requests', function (Blueprint $table) {
            $table->id();
            $table->string('university_name');
            $table->string('email');
            $table->string('website')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_person');
            $table->string('contact_phone')->nullable();
            $table->string('document_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('university_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();
            $table->unique(['university_id', 'key']);
        });
    }
};
