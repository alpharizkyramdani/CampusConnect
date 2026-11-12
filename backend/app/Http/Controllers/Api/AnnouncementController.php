<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementCategory;
use App\Models\AnnouncementRead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categoryId = $request->query('category_id');
        $priority = $request->query('priority');
        $search = $request->query('search');

        $announcements = Announcement::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->where('status', 'published')
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($priority, fn($q) => $q->where('priority', $priority))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('content', 'like', "%{$search}%")))
            ->with(['category', 'user:id,name,avatar', 'university:id,name,code'])
            ->latest('published_at')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $announcement = Announcement::with(['category', 'user:id,name,avatar', 'university'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        if ($request->user()) {
            AnnouncementRead::firstOrCreate([
                'announcement_id' => $announcement->id,
                'user_id' => $request->user()->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $announcement,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:announcement_categories,id',
            'priority' => 'nullable|in:normal,high,urgent',
            'target_audience' => 'nullable|in:all,students,lecturers,staff',
            'image_url' => 'nullable|string',
        ]);

        $announcement = Announcement::create([
            'university_id' => $request->university_id,
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(5),
            'content' => $request->content,
            'priority' => $request->priority ?? 'normal',
            'status' => 'published',
            'target_audience' => $request->target_audience ?? 'all',
            'image_url' => $request->image_url,
            'published_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement published successfully',
            'data' => $announcement->load(['category', 'user']),
        ], 201);
    }

    public function categories(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categories = AnnouncementCategory::when($universityId, fn($q) => $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id')))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully',
        ]);
    }
}
