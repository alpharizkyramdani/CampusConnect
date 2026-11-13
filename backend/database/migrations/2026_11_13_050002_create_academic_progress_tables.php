<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Academic Semesters (IPS, IPK, SKS)
        Schema::create('academic_semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('semester_name'); // e.g. 'Semester Ganjil 2024/2025'
            $table->unsignedTinyInteger('semester_number'); // 1, 2, 3 ...
            $table->decimal('gpa', 3, 2)->default(0.00); // IPS
            $table->decimal('cumulative_gpa', 3, 2)->default(0.00); // IPK
            $table->unsignedSmallInteger('sks_taken')->default(0);
            $table->unsignedSmallInteger('sks_passed')->default(0);
            $table->enum('status', ['active', 'completed', 'planned'])->default('completed');
            $table->timestamps();

            $table->index(['user_id', 'semester_number']);
            $table->index(['university_id', 'user_id']);
        });

        // 2. Academic Courses (Matakuliah, Nilai, Kehadiran)
        Schema::create('academic_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained('academic_semesters')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('course_code', 20); // e.g. 'TIF201'
            $table->string('course_name'); // e.g. 'Struktur Data & Algoritma'
            $table->unsignedTinyInteger('sks')->default(3);
            $table->string('grade', 5)->default('IP'); // 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E', 'IP' (In Progress)
            $table->decimal('grade_point', 3, 2)->default(0.00); // 4.00, 3.50, 3.00, etc.
            $table->decimal('attendance_percentage', 5, 2)->default(100.00);
            $table->string('lecturer_name')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'course_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_courses');
        Schema::dropIfExists('academic_semesters');
    }
};

