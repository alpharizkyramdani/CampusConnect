<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
        $currentUser = $request->user();
        $targetUser = User::findOrFail($id);

        $request->validate([
            'status' => 'required|in:active,suspended,pending',
        ]);

        $isSuperAdmin = $currentUser->roleAssignments()->whereHas('role', fn($q) => $q->where('slug', 'super_admin'))->exists();
        $isCampusAdmin = $currentUser->roleAssignments()->whereHas('role', fn($q) => $q->where('slug', 'campus_admin'))->exists();
        $isDeptAdmin = $currentUser->roleAssignments()->whereHas('role', fn($q) => $q->where('slug', 'department_admin'))->exists();

        $newStatus = $request->status;
        $note = "User status updated to {$newStatus}";

        if (!$isSuperAdmin && !$isCampusAdmin && $isDeptAdmin) {
            $note = "Student suspension requested by Department Admin, awaiting Campus Admin approval.";
        }

        $targetUser->update(['status' => $newStatus]);

        ActivityLog::create([
            'university_id' => $targetUser->default_university_id,
            'user_id' => $currentUser->id,
            'action' => 'user.update_status',
            'entity_type' => 'User',
            'entity_id' => $targetUser->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['target_user' => $targetUser->email, 'new_status' => $newStatus, 'note' => $note],
        ]);

        return response()->json([
            'success' => true,
            'message' => $note,
            'data' => $targetUser,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($id);

        if ($currentUser->id === $targetUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account while logged in.',
            ], 400);
        }

        ActivityLog::create([
            'university_id' => $targetUser->default_university_id,
            'user_id' => $currentUser->id,
            'action' => 'user.delete',
            'entity_type' => 'User',
            'entity_id' => $targetUser->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['target_user' => $targetUser->email, 'name' => $targetUser->name],
        ]);

        $name = $targetUser->name;
        $email = $targetUser->email;

        // Revoke tokens and clean related profile records
        $targetUser->tokens()->delete();
        $targetUser->roleAssignments()->delete();
        $targetUser->studentProfile()?->delete();
        $targetUser->lecturerProfile()?->delete();
        $targetUser->delete();

        return response()->json([
            'success' => true,
            'message' => "User account {$name} ({$email}) has been deleted successfully.",
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

        $existing = UserRoleAssignment::where('user_id', $user->id)
            ->where('role_id', $request->role_id)
            ->where('university_id', $request->university_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => "User already holds this role for the specified scope.",
                'data' => $existing->load(['role', 'university', 'department']),
            ]);
        }

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

    public function revokeRole(Request $request, $userId, $assignmentId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $assignment = UserRoleAssignment::where('user_id', $user->id)
            ->where('id', $assignmentId)
            ->first();

        if (!$assignment) {
            return response()->json([
                'success' => true,
                'message' => 'Role assignment has already been removed or updated.',
            ]);
        }

        $roleName = $assignment->role ? $assignment->role->name : 'Role';

        ActivityLog::create([
            'university_id' => $assignment->university_id ?? $user->default_university_id,
            'user_id' => $request->user()->id,
            'action' => 'user.revoke_role',
            'entity_type' => 'UserRoleAssignment',
            'entity_id' => $assignment->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => [
                'target_user' => $user->email,
                'revoked_role' => $roleName,
                'university_id' => $assignment->university_id,
            ],
        ]);

        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => "Role {$roleName} has been revoked successfully from {$user->name}.",
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'university_id' => 'nullable|exists:universities,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'default_university_id' => $request->university_id,
            'status' => 'active',
        ]);

        $role = Role::findOrFail($request->role_id);

        UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'status' => 'active',
            'assigned_by' => $request->user()->id,
            'assigned_at' => now(),
        ]);

        ActivityLog::create([
            'university_id' => $request->university_id,
            'user_id' => $request->user()->id,
            'action' => 'user.create_and_assign',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['email' => $user->email, 'role' => $role->slug, 'university_id' => $request->university_id],
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} created successfully with role {$role->name}.",
            'data' => $user->load('roleAssignments.role', 'roleAssignments.university'),
        ], 201);
    }

    public function roles(): JsonResponse
    {
        $roles = Role::all();
        return response()->json(['success' => true, 'data' => $roles]);
    }
}

