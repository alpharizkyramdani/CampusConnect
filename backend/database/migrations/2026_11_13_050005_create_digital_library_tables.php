<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Digital Library Items (Katalog Buku, Jurnal, Skripsi, Modul)
        Schema::create('library_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('title');
            $table->string('author');
            $table->string('isbn_issn', 50)->nullable();
            $table->string('publisher')->nullable();
            $table->unsignedSmallInteger('publication_year')->nullable();
            $table->enum('category', [
                'academic_book',
                'journal',
                'thesis',
                'final_project',
                'lab_module',
                'general_reference'
            ])->default('academic_book');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('file_url')->nullable(); // PDF or digital read link
            $table->unsignedSmallInteger('total_copies')->default(5);
            $table->unsignedSmallInteger('available_copies')->default(5);
            $table->string('shelf_location', 100)->nullable(); // e.g. 'Lt. 2 Rak B-14'
            $table->boolean('is_digital_access')->default(true);
            $table->unsignedInteger('borrow_count')->default(0);
            $table->timestamps();

            $table->index(['university_id', 'category']);
            $table->index(['title']);
            $table->index(['author']);
        });

        // 2. Library Loans (Peminjaman & Pengembalian Buku)
        Schema::create('library_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('library_item_id')->constrained('library_items')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('loan_code', 30)->unique();
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['borrowed', 'returned', 'overdue', 'cancelled'])->default('borrowed');
            $table->unsignedInteger('fine_amount')->default(0); // Denda per hari
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['university_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_loans');
        Schema::dropIfExists('library_items');
    }
};

