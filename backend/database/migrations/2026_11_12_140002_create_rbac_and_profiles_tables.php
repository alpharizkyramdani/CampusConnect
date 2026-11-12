<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('password');
            $table->string('phone', 30)->nullable()->after('avatar');
            $table->enum('status', ['active', 'pending', 'suspended'])->default('active')->after('phone');
            $table->unsignedBigInteger('default_university_id')->nullable()->after('status');
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Display name e.g. "Campus Admin"
            $table->string('slug')->unique(); // e.g. "super_admin", "campus_admin", "department_admin", "ukm_admin", "ormawa_admin", "student", "lecturer"
            $table->enum('scope_level', ['platform', 'university', 'department', 'organization'])->default('university');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('module');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['role_id', 'permission_id']);
        });

        Schema::create('user_role_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->unsignedBigInteger('organization_id')->nullable(); // Foreign key added later or soft reference
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'role_id', 'university_id']);
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('nim', 50);
            $table->string('study_program')->nullable();
            $table->unsignedSmallInteger('enrollment_year')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();

            $table->unique(['university_id', 'nim']);
            $table->unique('user_id');
        });

        Schema::create('lecturer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('nidn', 50)->nullable();
            $table->string('title')->nullable(); // e.g. Dr., Prof., M.Kom
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();

            $table->unique(['university_id', 'nidn']);
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturer_profiles');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('user_role_assignments');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'phone', 'status', 'default_university_id']);
        });
    }
};

