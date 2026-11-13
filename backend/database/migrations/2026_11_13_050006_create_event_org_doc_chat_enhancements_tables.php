<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('event_waitlists');
        Schema::dropIfExists('organization_finances');

        // 1. Event Waitlists (Antrean saat kuota penuh)
        Schema::create('event_waitlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(1);
            $table->enum('status', ['waiting', 'promoted', 'cancelled'])->default('waiting');
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
            $table->index(['event_id', 'status', 'position']);
        });

        // 2. Organization Finances (Laporan Keuangan Sederhana & Transparansi Ormawa)
        Schema::create('organization_finances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['income', 'expense'])->default('expense');
            $table->decimal('amount', 14, 2);
            $table->date('transaction_date');
            $table->string('category', 100); // 'Sponsorship', 'Kas Anggota', 'Logistik Event', 'Konsumsi', 'Perlengkapan'
            $table->text('description')->nullable();
            $table->string('receipt_url')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['organization_id', 'type', 'transaction_date'], 'org_fin_type_date_idx');
        });

        // 3. Document Version History (Riwayat Versi Dokumen)
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('version_number', 20)->default('v1.0');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->text('change_summary')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['document_id', 'created_at']);
        });

        // 4. Group Chat Conversations
        Schema::create('group_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->string('name');
            $table->string('avatar')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 5. Group Conversation Members
        Schema::create('group_conversation_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('group_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['admin', 'member'])->default('member');
            $table->boolean('is_muted')->default(false);
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
        });

        // 6. Direct Message Attachments & Group Support
        Schema::table('direct_messages', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('receiver_id')->constrained('group_conversations')->cascadeOnDelete();
            $table->string('attachment_url')->nullable()->after('message');
            $table->string('attachment_type', 50)->nullable()->after('attachment_url'); // 'image', 'document'
            $table->string('attachment_name')->nullable()->after('attachment_type');
        });
    }

    public function down(): void
    {
        Schema::table('direct_messages', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn(['group_id', 'attachment_url', 'attachment_type', 'attachment_name']);
        });

        Schema::dropIfExists('group_conversation_members');
        Schema::dropIfExists('group_conversations');
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('organization_finances');
        Schema::dropIfExists('event_waitlists');
    }
};
