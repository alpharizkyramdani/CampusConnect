<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Student Services
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 30);
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->unsignedSmallInteger('processing_days')->default(3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['university_id', 'code']);
        });

        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('service_type_id')->constrained('service_types')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('request_number', 50)->unique();
            $table->text('notes')->nullable();
            $table->string('attachment_url')->nullable();
            $table->enum('status', ['submitted', 'processing', 'completed', 'rejected'])->default('submitted');
            $table->text('admin_notes')->nullable();
            $table->string('result_document_url')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'status']);
        });

        // Documents
        Schema::create('document_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('document_categories')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('file_type', 50);
            $table->enum('access_level', ['public', 'campus', 'staff', 'private'])->default('campus');
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamps();

            $table->index(['university_id', 'access_level']);
        });

        // Discussions
        Schema::create('discussion_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('color', 20)->default('#2563EB');
            $table->timestamps();

            $table->unique(['university_id', 'slug']);
        });

        Schema::create('discussion_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('discussion_categories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->index(['university_id', 'category_id']);
        });

        Schema::create('discussion_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('discussion_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('discussion_comments')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('discussion_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->nullable()->constrained('discussion_posts')->cascadeOnDelete();
            $table->foreignId('comment_id')->nullable()->constrained('discussion_comments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->enum('status', ['pending', 'reviewed', 'dismissed', 'action_taken'])->default('pending');
            $table->timestamps();
        });

        // Student Portfolio
        Schema::create('student_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->enum('activity_type', ['event', 'organization', 'competition', 'volunteering', 'achievement'])->default('event');
            $table->string('role')->nullable();
            $table->string('organizer')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->string('proof_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'activity_type']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->enum('level', ['campus', 'regional', 'national', 'international'])->default('campus');
            $table->string('rank')->nullable(); // 1st Place, Honorable Mention, etc.
            $table->unsignedSmallInteger('year');
            $table->string('certificate_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'level']);
        });

        // Audit & Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // e.g. "auth.login", "borrowing.approve", "event.create"
            $table->string('entity_type')->nullable(); // e.g. "FacilityBorrowing", "Event"
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'action']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('student_activities');
        Schema::dropIfExists('discussion_reports');
        Schema::dropIfExists('discussion_comments');
        Schema::dropIfExists('discussion_posts');
        Schema::dropIfExists('discussion_categories');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_categories');
        Schema::dropIfExists('service_requests');
        Schema::dropIfExists('service_types');
    }
};
