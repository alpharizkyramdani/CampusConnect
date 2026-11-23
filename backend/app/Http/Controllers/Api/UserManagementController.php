<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\LecturerProfile;
use App\Models\Role;
use App\Models\StudentProfile;
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
            ->with(['roleAssignments.role', 'roleAssignments.university', 'studentProfile.department', 'lecturerProfile.department', 'lecturerProfile.faculty'])
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
            'nidn' => 'nullable|string|max:50',
            'title' => 'nullable|string|max:100',
            'specialization' => 'nullable|string|max:255',
        ]);

        $existing = UserRoleAssignment::where('user_id', $user->id)
            ->where('role_id', $request->role_id)
            ->where('university_id', $request->university_id)
            ->where('department_id', $request->department_id)
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

        $role = Role::find($request->role_id);
        if ($role && $role->slug === 'lecturer') {
            $department = $request->department_id ? Department::find($request->department_id) : null;
            LecturerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'university_id' => $request->university_id ?? $user->default_university_id,
                    'faculty_id' => $department?->faculty_id,
                    'department_id' => $request->department_id,
                    'nidn' => $request->nidn ?: ($user->lecturerProfile?->nidn ?? ('00' . rand(10000000, 99999999))),
                    'title' => $request->title ?: ($user->lecturerProfile?->title ?? 'Dosen Pengajar / Lektor'),
                    'specialization' => $request->specialization ?: ($user->lecturerProfile?->specialization ?? ($department ? 'Dosen ' . $department->name : 'Teknologi & Komputasi')),
                ]
            );
        }

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
            'nidn' => 'nullable|string|max:50',
            'nim' => 'nullable|string|max:50',
            'title' => 'nullable|string|max:100',
            'specialization' => 'nullable|string|max:255',
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

        $department = $request->department_id ? Department::find($request->department_id) : null;

        if ($role->slug === 'lecturer' || $request->filled('nidn')) {
            LecturerProfile::create([
                'user_id' => $user->id,
                'university_id' => $request->university_id,
                'faculty_id' => $department?->faculty_id,
                'department_id' => $request->department_id,
                'nidn' => $request->nidn ?? ('00' . rand(10000000, 99999999)),
                'title' => $request->title ?? 'Dosen Pengajar / Peneliti',
                'specialization' => $request->specialization ?? 'Academic Research & Education',
            ]);
        } elseif ($role->slug === 'student' || $request->filled('nim')) {
            StudentProfile::create([
                'user_id' => $user->id,
                'university_id' => $request->university_id,
                'faculty_id' => $department?->faculty_id,
                'department_id' => $request->department_id,
                'nim' => $request->nim ?? ('220' . rand(100000, 999999)),
                'batch_year' => $request->batch_year ?? date('Y'),
                'academic_status' => 'active',
            ]);
        }

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
            'data' => $user->load('roleAssignments.role', 'roleAssignments.university', 'lecturerProfile', 'studentProfile'),
        ], 201);
    }

    public function verifyUser(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser->isSuperAdmin() && !$currentUser->isCampusAdmin()) {
            return response()->json(['success' => false, 'message' => 'Hanya Administrator yang berwenang memverifikasi akun civitas.'], 403);
        }

        $user = User::findOrFail($id);
        $user->update([
            'is_verified' => true,
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $currentUser->id,
        ]);

        ActivityLog::create([
            'university_id' => $user->default_university_id,
            'user_id' => $currentUser->id,
            'action' => 'user.verify_identity',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['target_user' => $user->email, 'name' => $user->name, 'verified_by' => $currentUser->name],
        ]);

        $user->notify(new \App\Notifications\SocialNotification(
            'system',
            'Akun Civitas Telah Terverifikasi',
            'Selamat! Identitas akun Anda telah diverifikasi oleh Administrator Kampus PNL. Seluruh hak akses layanan kini telah aktif.',
            ['action_url' => '/profile']
        ));

        return response()->json([
            'success' => true,
            'message' => "Identitas akun {$user->name} ({$user->email}) berhasil diverifikasi.",
            'data' => $user->fresh(['studentProfile', 'lecturerProfile', 'roleAssignments.role']),
        ]);
    }

    public function transitionToAlumni(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser->isSuperAdmin() && !$currentUser->isCampusAdmin()) {
            return response()->json(['success' => false, 'message' => 'Hanya Administrator yang berwenang mengalihkan status ke Alumni.'], 403);
        }

        $user = User::findOrFail($id);
        $alumniRole = Role::firstOrCreate(
            ['slug' => 'alumni'],
            ['name' => 'Alumni PNL', 'scope_level' => 'university', 'description' => 'Lulusan civitas Politeknik Negeri Lhokseumawe']
        );

        // Update student profile status if exists
        if ($user->studentProfile) {
            $user->studentProfile->update([
                'academic_status' => 'graduated',
            ]);
        }

        // Add alumni role assignment
        UserRoleAssignment::firstOrCreate(
            [
                'user_id' => $user->id,
                'role_id' => $alumniRole->id,
            ],
            [
                'university_id' => $user->default_university_id ?? 5,
                'status' => 'active',
                'assigned_by' => $currentUser->id,
                'assigned_at' => now(),
            ]
        );

        ActivityLog::create([
            'university_id' => $user->default_university_id,
            'user_id' => $currentUser->id,
            'action' => 'user.transition_alumni',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['target_user' => $user->email, 'name' => $user->name],
        ]);

        $user->notify(new \App\Notifications\SocialNotification(
            'system',
            'Peralihan Status Alumni Berhasil',
            'Selamat atas kelulusan Anda! Akun Anda kini memiliki status Alumni Politeknik Negeri Lhokseumawe dengan akses portal karier dan jejaring alumni.',
            ['action_url' => '/career-center']
        ));

        return response()->json([
            'success' => true,
            'message' => "Status {$user->name} berhasil dialihkan menjadi Alumni PNL.",
            'data' => $user->fresh(['studentProfile', 'roleAssignments.role']),
        ]);
    }

    public function roles(): JsonResponse
    {
        $roles = Role::all();
        return response()->json(['success' => true, 'data' => $roles]);
    }
}

