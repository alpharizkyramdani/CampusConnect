<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->enum('type', ['ukm', 'bem', 'hima', 'dpm', 'other'])->default('ukm');
            $table->string('category')->nullable(); // e.g., "Arts", "Sports", "Technology", "Executive"
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending_approval'])->default('active');
            $table->boolean('recruitment_open')->default(false);
            $table->timestamps();

            $table->unique(['university_id', 'slug']);
            $table->index(['university_id', 'type']);
        });

        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_title')->default('Member'); // e.g. President, Secretary, Member
            $table->string('division')->nullable();
            $table->date('joined_at')->nullable();
            $table->enum('status', ['active', 'alumni', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });

        Schema::create('organization_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('motivation')->nullable();
            $table->string('department_interest')->nullable();
            $table->string('resume_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
        });

        Schema::create('work_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget', 12, 2)->default(0);
            $table->enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])->default('planned');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_programs');
        Schema::dropIfExists('organization_applications');
        Schema::dropIfExists('organization_members');
        Schema::dropIfExists('organizations');
    }
};
