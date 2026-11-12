<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facility_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('facility_categories')->nullOnDelete();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->string('photo_url')->nullable();
            $table->enum('condition', ['excellent', 'good', 'fair', 'damaged', 'in_repair'])->default('good');
            $table->unsignedInteger('total_quantity')->default(1);
            $table->unsignedInteger('available_quantity')->default(1);
            $table->string('location')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'department_id']);
        });

        Schema::create('facility_borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->text('purpose');
            $table->dateTime('borrow_date');
            $table->dateTime('return_due_date');
            $table->dateTime('actual_return_date')->nullable();
            $table->enum('status', [
                'pending', 
                'approved', 
                'rejected', 
                'ready_for_pickup', 
                'borrowed', 
                'returned', 
                'overdue', 
                'cancelled'
            ])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('handed_over_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('return_condition', ['excellent', 'good', 'fair', 'damaged'])->nullable();
            $table->timestamps();

            $table->index(['university_id', 'department_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained('facilities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['restock', 'damage', 'borrow', 'return', 'adjustment']);
            $table->integer('quantity'); // can be negative or positive
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('facility_borrowings');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('facility_categories');
    }
};
