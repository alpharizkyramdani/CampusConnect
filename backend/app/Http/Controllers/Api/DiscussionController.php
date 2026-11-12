<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscussionCategory;
use App\Models\DiscussionComment;
use App\Models\DiscussionPost;
use App\Models\DiscussionReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $posts = DiscussionPost::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('content', 'like', "%{$search}%")))
            ->with(['category', 'author:id,name,avatar', 'university:id,name,code'])
            ->withCount('comments')
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function show($id): JsonResponse
    {
        $post = DiscussionPost::with([
            'category', 
            'author:id,name,avatar', 
            'university', 
            'comments.author:id,name,avatar',
            'comments.replies.author:id,name,avatar'
        ])->findOrFail($id);

        $post->increment('views_count');

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->has('university_id') && $request->user()) {
            $univId = $request->user()->assignments()->where('status', 'active')->first()?->university_id;
            if ($univId) {
                $request->merge(['university_id' => $univId]);
            }
        }

        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'category_id' => 'required|exists:discussion_categories,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $post = DiscussionPost::create([
            'university_id' => $request->university_id,
            'category_id' => $request->category_id,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Discussion topic posted successfully',
            'data' => $post->load(['category', 'author']),
        ], 201);
    }

    public function comment(Request $request, $id): JsonResponse
    {
        $post = DiscussionPost::findOrFail($id);

        $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:discussion_comments,id',
        ]);

        $comment = DiscussionComment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment->load('author'),
        ], 201);
    }

    public function report(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $report = DiscussionReport::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report submitted for administrator review.',
            'data' => $report,
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categories = DiscussionCategory::when($universityId, fn($q) => $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id')))
            ->get();

        return response()->json(['success' => true, 'data' => $categories]);
    }
}

