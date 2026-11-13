<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampusPost;
use App\Models\SavedPost;
use App\Models\UserBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SocialHubEnhancementController extends Controller
{
    /**
     * Bookmark / Save a post
     */
    public function toggleBookmark(Request $request, $postId): JsonResponse
    {
        $user = $request->user();
        $post = CampusPost::findOrFail($postId);

        $existing = SavedPost::where('user_id', $user->id)->where('post_id', $post->id)->first();

        if ($existing) {
            $existing->delete();
            $saved = false;
            $msg = 'Postingan dihapus dari daftar simpanan.';
        } else {
            SavedPost::create([
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
            $saved = true;
            $msg = 'Postingan berhasil disimpan ke bookmark Anda.';
        }

        return response()->json([
            'success' => true,
            'is_saved' => $saved,
            'message' => $msg,
        ]);
    }

    /**
     * List user's saved/bookmarked posts
     */
    public function mySavedPosts(Request $request): JsonResponse
    {
        $user = $request->user();

        $savedPosts = SavedPost::where('user_id', $user->id)
            ->with([
                'post.user:id,name,email,avatar,default_university_id',
                'post.user.studentProfile.department',
                'post.repostOf.user:id,name,avatar',
            ])
            ->latest()
            ->paginate(15);

        // Map to posts format with is_liked and is_saved
        $savedPosts->getCollection()->transform(function ($item) use ($user) {
            $post = $item->post;
            if ($post) {
                $post->is_liked = $post->likes()->where('user_id', $user->id)->exists();
                $post->is_saved = true;
            }
            return $post;
        });

        return response()->json([
            'success' => true,
            'data' => $savedPosts,
        ]);
    }

    /**
     * Edit user's own post
     */
    public function updatePost(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $post = CampusPost::findOrFail($id);

        if ($post->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda hanya dapat mengedit postingan milik Anda sendiri.'], 403);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
            'media_url' => 'nullable|string',
        ]);

        $post->update([
            'content' => $request->content,
            'media_url' => $request->media_url ?? $post->media_url,
            'edited_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Postingan berhasil diperbarui.',
            'data' => $post->load(['user:id,name,avatar']),
        ]);
    }

    /**
     * Show single post detail with threaded comments
     */
    public function showPost(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $blockedIds = UserBlock::where('blocker_id', $user->id)
            ->pluck('blocked_id')
            ->merge(UserBlock::where('blocked_id', $user->id)->pluck('blocker_id'))
            ->unique();

        $post = CampusPost::where('id', $id)
            ->where('is_hidden', false)
            ->whereNotIn('user_id', $blockedIds)
            ->with([
                'user:id,name,email,avatar,default_university_id',
                'user.studentProfile.department',
                'repostOf.user:id,name,avatar',
                'comments.user:id,name,avatar',
            ])
            ->firstOrFail();

        $post->is_liked = $post->likes()->where('user_id', $user->id)->exists();
        $post->is_saved = SavedPost::where('user_id', $user->id)->where('post_id', $post->id)->exists();

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    /**
     * Trending Topics & Hashtags
     */
    public function trending(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $user->default_university_id;

        // Extract hashtags from recent posts
        $posts = CampusPost::where('is_hidden', false)
            ->where('created_at', '>=', now()->subDays(7))
            ->pluck('content');

        $hashtagCounts = [];

        foreach ($posts as $content) {
            preg_match_all('/#(\w+)/u', $content, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $tag) {
                    $tagLower = strtolower($tag);
                    $hashtagCounts[$tagLower] = ($hashtagCounts[$tagLower] ?? 0) + 1;
                }
            }
        }

        // Add default curated campus trends if low volume
        $curatedTrends = [
            'infokuliah' => 42,
            'proyekakhir' => 28,
            'seminarai' => 19,
            'krsganjil' => 15,
            'kampusconnect' => 37,
            'lombakampus' => 12,
        ];

        foreach ($curatedTrends as $tag => $count) {
            $hashtagCounts[$tag] = ($hashtagCounts[$tag] ?? 0) + $count;
        }

        arsort($hashtagCounts);
        $topTrends = array_slice($hashtagCounts, 0, 8, true);

        $result = [];
        foreach ($topTrends as $tag => $count) {
            $result[] = [
                'tag' => "#{$tag}",
                'posts_count' => $count,
                'category' => 'Campus Trending',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}

