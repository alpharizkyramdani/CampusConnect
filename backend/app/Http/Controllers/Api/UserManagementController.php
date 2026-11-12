<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $role = $request->query('role');
        $status = $request->query('status');
        $search = $request->query('search');

        $users = User::when($universityId, function ($q) use ($universityId) {
                $q->where('default_university_id', $universityId)
                  ->orWhereHas('roleAssignments', fn($sub) => $sub->where('university_id', $universityId));
            })
            ->when($role, function ($q) use ($role) {
                $q->whereHas('roleAssignments.role', fn($sub) => $sub->where('slug', $role));
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
            ->with(['roleAssignments.role', 'roleAssignments.university', 'studentProfile', 'lecturerProfile'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function show($id): JsonResponse
    {
        $user = User::with([
            'roleAssignments.role', 
            'roleAssignments.university', 
            'roleAssignments.department',
            'roleAssignments.organization',
            'studentProfile.university',
            'studentProfile.department',
            'lecturerProfile.university',
            'certificates',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,suspended,pending',
        ]);

        $user->update(['status' => $request->status]);

        ActivityLog::create([
            'university_id' => $user->default_university_id,
            'user_id' => $request->user()->id,
            'action' => 'user.update_status',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'details' => ['target_user' => $user->email, 'new_status' => $request->status],
        ]);

        return response()->json([
            'success' => true,
            'message' => "User status updated to {$request->status}",
            'data' => $user,
        ]);
    }

    public function assignRole(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'university_id' => 'nullable|exists:universities,id',
            'department_id' => 'nullable|exists:departments,id',
            'organization_id' => 'nullable|exists:organizations,id',
        ]);

        $assignment = UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => $request->role_id,
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'organization_id' => $request->organization_id,
            'status' => 'active',
            'assigned_by' => $request->user()->id,
            'assigned_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully',
            'data' => $assignment->load(['role', 'university', 'department']),
        ], 201);
    }

    public function roles(): JsonResponse
    {
        $roles = Role::all();
        return response()->json(['success' => true, 'data' => $roles]);
    }
}
