<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Career Opportunities (Lowongan, Magang, Beasiswa, Lomba)
        Schema::create('career_opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete(); // null = nationwide/all campuses
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('company_logo')->nullable();
            $table->string('title');
            $table->enum('category', [
                'internship',
                'full_time',
                'part_time',
                'scholarship',
                'competition',
                'training',
                'career_event'
            ])->default('internship');
            $table->string('location')->default('Indonesia');
            $table->enum('type', ['remote', 'on_site', 'hybrid'])->default('hybrid');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->text('benefits')->nullable();
            $table->date('deadline');
            $table->string('salary_range')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('external_url')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->enum('status', ['open', 'closed', 'draft'])->default('open');
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();

            $table->index(['category', 'status', 'deadline']);
            $table->index(['university_id', 'status']);
        });

        // 2. Career Applications (Lamaran Mahasiswa)
        Schema::create('career_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->constrained('career_opportunities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('cv_url');
            $table->text('cover_letter')->nullable();
            $table->string('portfolio_link')->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'interview_scheduled',
                'accepted',
                'rejected',
                'withdrawn'
            ])->default('submitted');
            $table->text('feedback')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->unique(['opportunity_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        // 3. Career Bookmarks
        Schema::create('career_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('opportunity_id')->constrained('career_opportunities')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'opportunity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('career_bookmarks');
        Schema::dropIfExists('career_applications');
        Schema::dropIfExists('career_opportunities');
    }
};

