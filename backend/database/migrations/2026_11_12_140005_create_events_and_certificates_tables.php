<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('icon', 50)->nullable();
            $table->timestamps();

            $table->unique(['university_id', 'slug']);
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('event_categories')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('location')->nullable();
            $table->enum('event_type', ['online', 'offline', 'hybrid'])->default('offline');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->dateTime('registration_deadline')->nullable();
            $table->unsignedInteger('max_participants')->default(100);
            $table->unsignedInteger('current_participants')->default(0);
            $table->enum('status', [
                'draft', 
                'pending_approval', 
                'published', 
                'registration_open', 
                'registration_closed', 
                'ongoing', 
                'completed', 
                'cancelled'
            ])->default('published');
            $table->boolean('certificate_enabled')->default(true);
            $table->timestamps();

            $table->index(['university_id', 'status', 'start_time']);
        });

        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ticket_code', 30)->unique();
            $table->string('qr_token', 64)->unique();
            $table->enum('status', ['registered', 'attended', 'cancelled'])->default('registered');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('checked_in_at')->nullable();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
        });

        Schema::create('event_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('registration_id')->constrained('event_registrations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('scanned_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('scanned_at')->useCurrent();
            $table->text('notes')->nullable();

            $table->index(['event_id', 'user_id']);
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('certificate_number', 50)->unique();
            $table->string('title');
            $table->string('recipient_name');
            $table->date('issue_date');
            $table->string('file_url')->nullable();
            $table->string('verify_hash', 64)->unique();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['university_id', 'user_id']);
        });

        Schema::create('academic_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', ['academic', 'holiday', 'exam', 'registration', 'general'])->default('academic');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('color', 20)->default('#2563EB');
            $table->boolean('is_all_day')->default(true);
            $table->timestamps();

            $table->index(['university_id', 'start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_events');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('event_attendances');
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
        Schema::dropIfExists('event_categories');
    }
};

