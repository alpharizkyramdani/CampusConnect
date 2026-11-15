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
            OrganizationMember::updateOrCreate([
                'organization_id' => $app->organization_id,
                'user_id' => $app->user_id,
            ], [
                'role_title' => $request->role_title ?? 'Anggota Departemen',
                'division' => $request->division ?? ($app->department_interest ?? 'General Division'),
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

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:ukm,bem,hima,dpm',
            'category' => 'required|string|max:100',
            'description' => 'required|string',
            'website' => 'nullable|string',
            'instagram' => 'nullable|string',
            'contact_email' => 'nullable|string',
            'divisions' => 'nullable|array',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'logo' => 'nullable|string',
            'recruitment_open' => 'boolean',
        ]);

        $baseSlug = Str::slug($request->name) ?: 'org';
        $slug = $baseSlug;
        $counter = 1;
        while (Organization::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $org = Organization::create([
            'university_id' => $request->university_id,
            'name' => $request->name,
            'slug' => $slug,
            'type' => $request->type,
            'category' => $request->category,
            'description' => $request->description,
            'website' => $request->website,
            'instagram' => $request->instagram,
            'contact_email' => $request->contact_email,
            'divisions' => $request->divisions,
            'vision' => $request->vision,
            'mission' => $request->mission,
            'logo' => $request->logo,
            'status' => 'active',
            'recruitment_open' => $request->boolean('recruitment_open', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Organization {$org->name} created successfully.",
            'data' => $org->load('university'),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $org = Organization::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:ukm,bem,hima,dpm',
            'category' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'website' => 'nullable|string',
            'instagram' => 'nullable|string',
            'contact_email' => 'nullable|string',
            'divisions' => 'nullable|array',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'logo' => 'nullable|string',
            'status' => 'nullable|in:active,suspended',
            'recruitment_open' => 'nullable|boolean',
        ]);

        $org->update($request->only([
            'name',
            'type',
            'category',
            'description',
            'website',
            'instagram',
            'contact_email',
            'divisions',
            'vision',
            'mission',
            'logo',
            'status',
            'recruitment_open',
        ]));

        return response()->json([
            'success' => true,
            'message' => "Organization {$org->name} updated successfully.",
            'data' => $org->fresh('university'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $org = Organization::findOrFail($id);
        $name = $org->name;

        $org->members()->delete();
        $org->applications()->delete();
        $org->workPrograms()->delete();
        $org->delete();

        return response()->json([
            'success' => true,
            'message' => "Organization {$name} has been deleted successfully.",
        ]);
    }

    public function addMember(Request $request, $id): JsonResponse
    {
        $org = Organization::findOrFail($id);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_title' => 'required|string|max:100',
            'division' => 'nullable|string|max:100',
        ]);

        $member = OrganizationMember::updateOrCreate(
            [
                'organization_id' => $org->id,
                'user_id' => $request->user_id,
            ],
            [
                'role_title' => $request->role_title,
                'division' => $request->division ?? 'BPH / Pengurus Inti',
                'status' => 'active',
                'joined_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Member assigned as {$request->role_title} ({$member->division}) successfully.",
            'data' => $member->load('user'),
        ]);
    }

    public function removeMember($id, $memberId): JsonResponse
    {
        $member = OrganizationMember::where('organization_id', $id)->where('id', $memberId)->firstOrFail();
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member removed successfully.',
        ]);
    }
}

