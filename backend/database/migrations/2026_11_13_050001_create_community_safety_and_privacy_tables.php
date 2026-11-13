<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Content Reports (Moderation Queue)
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->string('reportable_type'); // 'post', 'comment', 'user'
            $table->unsignedBigInteger('reportable_id');
            $table->enum('category', [
                'spam',
                'harassment',
                'hate_speech',
                'misinformation',
                'inappropriate_content',
                'violence',
                'academic_fraud',
                'other'
            ])->default('inappropriate_content');
            $table->text('reason');
            $table->enum('status', ['pending', 'under_review', 'resolved', 'rejected'])->default('pending');
            $table->foreignId('moderator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_taken')->nullable(); // 'hidden', 'warning', 'suspended', 'dismissed'
            $table->text('moderator_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['university_id', 'status']);
            $table->index(['reportable_type', 'reportable_id']);
            $table->index(['reporter_id', 'created_at']);
        });

        // 2. User Blocks
        Schema::create('user_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blocker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('blocked_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['blocker_id', 'blocked_id']);
            $table->index(['blocker_id']);
            $table->index(['blocked_id']);
        });

        // 3. User Mutes
        Schema::create('user_mutes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('muted_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'muted_user_id']);
            $table->index(['user_id']);
        });

        // 4. User Privacy Settings
        Schema::create('user_privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->enum('profile_visibility', ['public', 'campus', 'followers', 'private'])->default('campus');
            $table->enum('dm_permission', ['everyone', 'followers', 'nobody'])->default('everyone');
            $table->boolean('notify_follow')->default(true);
            $table->boolean('notify_message')->default(true);
            $table->boolean('notify_like')->default(true);
            $table->boolean('notify_comment')->default(true);
            $table->boolean('notify_event')->default(true);
            $table->timestamps();
        });

        // 5. Post Bookmarks (Saved Posts)
        Schema::create('saved_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('campus_posts')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
            $table->index(['user_id', 'created_at']);
        });

        // 6. Add hidden flag and moderation status to campus_posts and campus_post_comments
        Schema::table('campus_posts', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('reposts_count');
            $table->string('hidden_reason')->nullable()->after('is_hidden');
            $table->timestamp('edited_at')->nullable()->after('updated_at');
        });

        Schema::table('campus_post_comments', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('campus_post_comments', function (Blueprint $table) {
            $table->dropColumn('is_hidden');
        });

        Schema::table('campus_posts', function (Blueprint $table) {
            $table->dropColumn(['is_hidden', 'hidden_reason', 'edited_at']);
        });

        Schema::dropIfExists('saved_posts');
        Schema::dropIfExists('user_privacy_settings');
        Schema::dropIfExists('user_mutes');
        Schema::dropIfExists('user_blocks');
        Schema::dropIfExists('content_reports');
    }
};

