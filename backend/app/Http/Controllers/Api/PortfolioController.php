<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Certificate;
use App\Models\EventRegistration;
use App\Models\OrganizationMember;
use App\Models\StudentActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function getPortfolio(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Events attended
        $eventsAttended = EventRegistration::where('user_id', $user->id)
            ->where('status', 'attended')
            ->with(['event.organization', 'event.university'])
            ->latest('checked_in_at')
            ->get();

        // 2. Certificates
        $certificates = Certificate::where('user_id', $user->id)
            ->with(['event', 'university'])
            ->latest('issue_date')
            ->get();

        // 3. Organization Memberships
        $organizations = OrganizationMember::where('user_id', $user->id)
            ->with(['organization'])
            ->get();

        // 4. Manual Activities
        $activities = StudentActivity::where('user_id', $user->id)
            ->latest('start_date')
            ->get();

        // 5. Achievements
        $achievements = Achievement::where('user_id', $user->id)
            ->latest('year')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->load('studentProfile.university', 'studentProfile.department'),
                'events_attended' => $eventsAttended,
                'certificates' => $certificates,
                'organizations' => $organizations,
                'activities' => $activities,
                'achievements' => $achievements,
                'stats' => [
                    'total_events' => $eventsAttended->count(),
                    'total_certificates' => $certificates->count(),
                    'total_organizations' => $organizations->count(),
                    'total_achievements' => $achievements->count(),
                ],
            ],
        ]);
    }

    public function storeActivity(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'activity_type' => 'required|in:event,organization,competition,volunteering,achievement',
            'role' => 'nullable|string',
            'organizer' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'proof_url' => 'nullable|string',
        ]);

        $activity = StudentActivity::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'activity_type' => $request->activity_type,
            'role' => $request->role,
            'organizer' => $request->organizer,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
            'proof_url' => $request->proof_url,
            'is_verified' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Portfolio activity added successfully',
            'data' => $activity,
        ], 201);
    }

    public function storeAchievement(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'level' => 'required|in:campus,regional,national,international',
            'rank' => 'nullable|string',
            'year' => 'required|integer',
            'certificate_url' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $achievement = Achievement::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'level' => $request->level,
            'rank' => $request->rank,
            'year' => $request->year,
            'certificate_url' => $request->certificate_url,
            'description' => $request->description,
            'is_verified' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Achievement recorded successfully',
            'data' => $achievement,
        ], 201);
    }

    public function listAchievements(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $level = $request->query('level');
        $search = $request->query('search');

        $achievements = Achievement::when($universityId, function ($q) use ($universityId) {
                $q->whereHas('user.studentProfile', fn($sub) => $sub->where('university_id', $universityId));
            })
            ->when($level, fn($q) => $q->where('level', $level))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('rank', 'like', "%{$search}%")))
            ->with(['user:id,name,email,avatar', 'user.studentProfile.university:id,name,code', 'user.studentProfile.department:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $achievements,
        ]);
    }

    public function verifyAchievement(Request $request, $id): JsonResponse
    {
        $achievement = Achievement::findOrFail($id);
        $achievement->update([
            'is_verified' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student achievement successfully verified and published to Hall of Fame.',
            'data' => $achievement->fresh(['user.studentProfile.university']),
        ]);
    }
}

