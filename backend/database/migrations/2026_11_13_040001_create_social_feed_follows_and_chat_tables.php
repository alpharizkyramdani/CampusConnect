<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Social Follows (Berteman / Follow-Following)
        Schema::create('user_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'follower_id']);
            $table->index(['user_id']);
            $table->index(['follower_id']);
        });

        // 2. Direct Messages (Chatan / 1-on-1 DM)
        Schema::create('direct_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['sender_id', 'receiver_id']);
            $table->index(['receiver_id', 'is_read']);
            $table->index(['created_at']);
        });

        // 3. Twitter-style Campus Posts (Microblogging Feed)
        Schema::create('campus_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->text('content');
            $table->string('media_url')->nullable();
            $table->foreignId('repost_of_id')->nullable()->constrained('campus_posts')->nullOnDelete();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('reposts_count')->default(0);
            $table->timestamps();

            $table->index(['university_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // 4. Post Likes
        Schema::create('campus_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('campus_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
            $table->index(['post_id']);
            $table->index(['user_id']);
        });

        // 5. Post Thread Comments
        Schema::create('campus_post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('campus_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();

            $table->index(['post_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campus_post_comments');
        Schema::dropIfExists('campus_post_likes');
        Schema::dropIfExists('campus_posts');
        Schema::dropIfExists('direct_messages');
        Schema::dropIfExists('user_follows');
    }
};

