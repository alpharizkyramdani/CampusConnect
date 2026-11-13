<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareerApplication;
use App\Models\CareerBookmark;
use App\Models\CareerOpportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CareerCenterController extends Controller
{
    /**
     * List career opportunities
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $category = $request->query('category');
        $type = $request->query('type'); // remote, on_site, hybrid
        $search = $request->query('search');

        $userBookmarkedIds = CareerBookmark::where('user_id', $user->id)->pluck('opportunity_id')->toArray();
        $userAppliedIds = CareerApplication::where('user_id', $user->id)->pluck('opportunity_id')->toArray();

        $opportunities = CareerOpportunity::where('status', 'open')
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($type, fn($q) => $q->where('type', $type))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('company_name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")))
            ->withCount('applications')
            ->orderBy('deadline', 'asc')
            ->paginate(12);

        // Append bookmarked and applied flags
        $opportunities->getCollection()->transform(function ($item) use ($userBookmarkedIds, $userAppliedIds) {
            $item->is_bookmarked = in_array($item->id, $userBookmarkedIds);
            $item->has_applied = in_array($item->id, $userAppliedIds);
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $opportunities,
        ]);
    }

    /**
     * Show single opportunity details
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $opportunity = CareerOpportunity::with(['creator:id,name,email', 'university:id,name'])->findOrFail($id);

        $opportunity->increment('views_count');

        $isBookmarked = CareerBookmark::where('user_id', $user->id)->where('opportunity_id', $opportunity->id)->exists();
        $existingApplication = CareerApplication::where('user_id', $user->id)->where('opportunity_id', $opportunity->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'opportunity' => $opportunity,
                'is_bookmarked' => $isBookmarked,
                'user_application' => $existingApplication,
            ],
        ]);
    }

    /**
     * Store new opportunity (Admins / Partners)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to post opportunities.'], 403);
        }

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_logo' => 'nullable|string',
            'title' => 'required|string|max:255',
            'category' => 'required|in:internship,full_time,part_time,scholarship,competition,training,career_event',
            'location' => 'required|string|max:255',
            'type' => 'required|in:remote,on_site,hybrid',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'benefits' => 'nullable|string',
            'deadline' => 'required|date',
            'salary_range' => 'nullable|string|max:100',
            'contact_email' => 'nullable|email',
            'external_url' => 'nullable|url',
        ]);

        $validated['created_by'] = $user->id;
        $validated['university_id'] = $user->default_university_id;
        $validated['is_verified'] = true;
        $validated['status'] = 'open';

        $opportunity = CareerOpportunity::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kesempatan karier baru berhasil dipublikasikan.',
            'data' => $opportunity,
        ], 201);
    }

    /**
     * Apply for an opportunity (CV upload & Cover Letter)
     */
    public function apply(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $opportunity = CareerOpportunity::findOrFail($id);

        if ($opportunity->status !== 'open') {
            return response()->json(['success' => false, 'message' => 'Pendaftaran untuk kesempatan ini telah ditutup.'], 400);
        }

        $validated = $request->validate([
            'cv_url' => 'required|string',
            'cover_letter' => 'nullable|string|max:2000',
            'portfolio_link' => 'nullable|string|max:255',
        ]);

        $application = CareerApplication::updateOrCreate(
            [
                'opportunity_id' => $opportunity->id,
                'user_id' => $user->id,
            ],
            [
                'cv_url' => $validated['cv_url'],
                'cover_letter' => $validated['cover_letter'] ?? null,
                'portfolio_link' => $validated['portfolio_link'] ?? null,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Lamaran Anda berhasil dikirim ke tim perekrut. Pantau status lamaran Anda secara berkala.',
            'data' => $application,
        ], 201);
    }

    /**
     * Toggle bookmark opportunity
     */
    public function toggleBookmark(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $opportunity = CareerOpportunity::findOrFail($id);

        $existing = CareerBookmark::where('user_id', $user->id)->where('opportunity_id', $opportunity->id)->first();

        if ($existing) {
            $existing->delete();
            $bookmarked = false;
            $msg = 'Lowongan dihapus dari daftar simpanan.';
        } else {
            CareerBookmark::create([
                'user_id' => $user->id,
                'opportunity_id' => $opportunity->id,
            ]);
            $bookmarked = true;
            $msg = 'Lowongan berhasil disimpan ke bookmark Anda.';
        }

        return response()->json([
            'success' => true,
            'is_bookmarked' => $bookmarked,
            'message' => $msg,
        ]);
    }

    /**
     * List user's career applications
     */
    public function myApplications(Request $request): JsonResponse
    {
        $user = $request->user();

        $applications = CareerApplication::where('user_id', $user->id)
            ->with(['opportunity:id,company_name,company_logo,title,category,location,type,deadline,status'])
            ->latest('submitted_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Manage applicants (For admins / opportunity creators)
     */
    public function listApplicants(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $opportunity = CareerOpportunity::findOrFail($id);

        $applicants = CareerApplication::where('opportunity_id', $opportunity->id)
            ->with(['user:id,name,email,avatar', 'user.studentProfile.department'])
            ->latest('submitted_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'opportunity' => $opportunity,
            'data' => $applicants,
        ]);
    }

    /**
     * Update applicant status
     */
    public function updateApplicationStatus(Request $request, $applicationId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $application = CareerApplication::findOrFail($applicationId);

        $validated = $request->validate([
            'status' => 'required|in:submitted,under_review,interview_scheduled,accepted,rejected,withdrawn',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $application->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Status lamaran berhasil diperbarui.',
            'data' => $application,
        ]);
    }
}

