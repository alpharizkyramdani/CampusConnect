<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('location');
            $table->enum('category', [
                'plumbing', 
                'electrical', 
                'hvac', 
                'furniture', 
                'structural', 
                'it_equipment', 
                'other'
            ])->default('other');
            $table->text('description');
            $table->string('photo_url')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', [
                'submitted', 
                'under_review', 
                'assigned', 
                'in_progress', 
                'resolved', 
                'rejected'
            ])->default('submitted');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'status', 'priority']);
        });

        Schema::create('maintenance_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_report_id')->constrained('maintenance_reports')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('lost_found_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['lost', 'found'])->default('lost');
            $table->string('title');
            $table->enum('category', [
                'electronics', 
                'documents', 
                'clothing', 
                'keys', 
                'bags', 
                'other'
            ])->default('other');
            $table->text('description');
            $table->string('location');
            $table->date('event_date');
            $table->string('photo_url')->nullable();
            $table->enum('status', ['open', 'claimed', 'resolved', 'cancelled'])->default('open');
            $table->string('contact_info')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'type', 'status']);
        });

        Schema::create('item_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lost_found_item_id')->constrained('lost_found_items')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('proof_description');
            $table->string('proof_photo_url')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['lost_found_item_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_claims');
        Schema::dropIfExists('lost_found_items');
        Schema::dropIfExists('maintenance_updates');
        Schema::dropIfExists('maintenance_reports');
    }
};
