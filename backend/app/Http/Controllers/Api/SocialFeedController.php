<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampusPost;
use App\Models\CampusPostComment;
use App\Models\CampusPostLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SocialFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $feedType = $request->query('feed_type', 'for_you'); // 'for_you', 'following', 'trending', 'user'
        $targetUserId = $request->query('user_id');
        $search = $request->query('search');
        $universityId = $request->query('university_id');

        $query = CampusPost::with([
            'author:id,name,avatar,default_university_id',
            'author.studentProfile.department',
            'author.lecturerProfile',
            'university:id,name,code',
            'repostOf.author:id,name,avatar',
            'repostOf.university:id,name,code',
        ]);

        if ($feedType === 'following' && $user) {
            $followingIds = $user->following()->pluck('user_id');
            // Include following users plus own posts
            $query->whereIn('user_id', $followingIds->push($user->id));
        } elseif ($feedType === 'user' && $targetUserId) {
            $query->where('user_id', $targetUserId);
        } elseif ($feedType === 'trending') {
            $query->orderByRaw('(likes_count * 2 + comments_count * 3 + reposts_count * 4) DESC');
        }

        if ($universityId) {
            $query->where(function ($q) use ($universityId) {
                $q->where('university_id', $universityId)->orWhereNull('university_id');
            });
        }

        if ($search) {
            $query->where('content', 'like', "%{$search}%");
        }

        if ($feedType !== 'trending') {
            $query->latest();
        }

        $posts = $query->paginate(20);

        // Append user interaction flags if user is authenticated
        if ($user) {
            $postIds = $posts->pluck('id');
            $likedPostIds = CampusPostLike::whereIn('post_id', $postIds)
                ->where('user_id', $user->id)
                ->pluck('post_id')
                ->flip();

            $repostedPostIds = CampusPost::whereIn('repost_of_id', $postIds)
                ->where('user_id', $user->id)
                ->pluck('repost_of_id')
                ->flip();

            $posts->getCollection()->transform(function ($post) use ($likedPostIds, $repostedPostIds) {
                $post->is_liked_by_me = isset($likedPostIds[$post->id]);
                $post->is_reposted_by_me = isset($repostedPostIds[$post->id]);
                return $post;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'media_url' => 'nullable|string',
            'repost_of_id' => 'nullable|exists:campus_posts,id',
            'university_id' => 'nullable|exists:universities,id',
        ]);

        $user = $request->user();
        $univId = $request->university_id ?? $user->default_university_id ?? $user->assignments()->where('status', 'active')->first()?->university_id;

        $post = CampusPost::create([
            'user_id' => $user->id,
            'university_id' => $univId,
            'content' => $request->content,
            'media_url' => $request->media_url,
            'repost_of_id' => $request->repost_of_id,
        ]);

        if ($request->repost_of_id) {
            CampusPost::where('id', $request->repost_of_id)->increment('reposts_count');
        }

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post->load([
                'author:id,name,avatar',
                'university:id,name,code',
                'repostOf.author:id,name,avatar',
            ]),
        ], 201);
    }

    public function toggleLike(Request $request, $id): JsonResponse
    {
        $post = CampusPost::findOrFail($id);
        $user = $request->user();

        $existing = CampusPostLike::where('post_id', $post->id)->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
            $isLiked = false;
        } else {
            CampusPostLike::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $post->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'success' => true,
            'is_liked' => $isLiked,
            'likes_count' => (int) $post->fresh()->likes_count,
        ]);
    }

    public function repost(Request $request, $id): JsonResponse
    {
        $originalPost = CampusPost::findOrFail($id);
        $user = $request->user();

        // Check if already reposted
        $existing = CampusPost::where('user_id', $user->id)->where('repost_of_id', $originalPost->id)->first();
        if ($existing) {
            $existing->delete();
            $originalPost->decrement('reposts_count');
            return response()->json([
                'success' => true,
                'message' => 'Repost removed',
                'is_reposted' => false,
                'reposts_count' => (int) $originalPost->fresh()->reposts_count,
            ]);
        }

        $repost = CampusPost::create([
            'user_id' => $user->id,
            'university_id' => $originalPost->university_id,
            'content' => $request->content ?? "Reposted from {$originalPost->author->name}",
            'repost_of_id' => $originalPost->id,
        ]);

        $originalPost->increment('reposts_count');

        return response()->json([
            'success' => true,
            'message' => 'Post reposted to your timeline',
            'is_reposted' => true,
            'reposts_count' => (int) $originalPost->fresh()->reposts_count,
            'data' => $repost->load('repostOf.author'),
        ]);
    }

    public function comment(Request $request, $id): JsonResponse
    {
        $post = CampusPost::findOrFail($id);

        $request->validate([
            'content' => 'required|string|max:500',
        ]);

        $comment = CampusPostComment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        $post->increment('comments_count');

        return response()->json([
            'success' => true,
            'message' => 'Comment posted successfully',
            'data' => $comment->load('author:id,name,avatar'),
            'comments_count' => (int) $post->fresh()->comments_count,
        ], 201);
    }

    public function getComments($id): JsonResponse
    {
        $comments = CampusPostComment::where('post_id', $id)
            ->with('author:id,name,avatar')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $post = CampusPost::findOrFail($id);
        $user = $request->user();

        $canDelete = $post->user_id === $user->id || $user->hasRole('super_admin') || $user->hasRole('campus_admin');

        if (!$canDelete) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this post.',
            ], 403);
        }

        if ($post->repost_of_id) {
            CampusPost::where('id', $post->repost_of_id)->decrement('reposts_count');
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.',
        ]);
    }
}
