<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationApplication;
use App\Models\OrganizationMember;
use App\Models\WorkProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $type = $request->query('type'); // ukm, bem, hima, dpm
        $search = $request->query('search');

        $organizations = Organization::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($type, fn($q) => $q->where('type', $type))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")))
            ->withCount(['members', 'events'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $organizations,
        ]);
    }

    public function show($id): JsonResponse
    {
        $organization = Organization::with([
            'members.user:id,name,email,avatar',
            'workPrograms',
            'events' => fn($q) => $q->latest()->take(5),
            'university:id,name,code',
        ])
        ->where('id', $id)
        ->orWhere('slug', $id)
        ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $organization,
        ]);
    }

    public function apply(Request $request, $id): JsonResponse
    {
        $organization = Organization::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'motivation' => 'required|string|max:1000',
            'department_interest' => 'nullable|string',
            'resume_url' => 'nullable|string',
        ]);

        if (OrganizationMember::where('organization_id', $organization->id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are already an active member of this organization.',
            ], 400);
        }

        $existing = OrganizationApplication::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending application for this organization.',
            ], 400);
        }

        $app = OrganizationApplication::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'motivation' => $request->motivation,
            'department_interest' => $request->department_interest,
            'resume_url' => $request->resume_url,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully! The organization administrators will review it.',
            'data' => $app,
        ], 201);
    }

    public function listApplications($id): JsonResponse
    {
        $applications = OrganizationApplication::where('organization_id', $id)
            ->with(['user.studentProfile'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function reviewApplication(Request $request, $appId): JsonResponse
    {
        $app = OrganizationApplication::findOrFail($appId);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $app->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => $request->review_notes,
        ]);

        if ($request->status === 'approved') {
            OrganizationMember::firstOrCreate([
                'organization_id' => $app->organization_id,
                'user_id' => $app->user_id,
            ], [
                'role_title' => 'Member',
                'division' => $app->department_interest ?? 'General Division',
                'joined_at' => now(),
                'status' => 'active',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Application {$request->status} successfully",
            'data' => $app->fresh(['user', 'reviewer']),
        ]);
    }
}

