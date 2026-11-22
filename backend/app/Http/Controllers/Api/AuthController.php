<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\LecturerProfile;
use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\University;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password credentials.',
            ], 401);
        }

        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended. Please contact platform administration.',
            ], 403);
        }

        // Fetch active role assignments with scopes
        $roleAssignments = UserRoleAssignment::where('user_id', $user->id)
            ->where('status', 'active')
            ->with(['role', 'university', 'department', 'organization'])
            ->get();

        $activeAssignment = $roleAssignments->first();

        $token = $user->createToken('campusconnect_token')->plainTextToken;

        ActivityLog::create([
            'university_id' => $activeAssignment?->university_id,
            'user_id' => $user->id,
            'action' => 'auth.login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['email' => $user->email],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'status' => $user->status,
                ],
                'role_assignments' => $roleAssignments,
                'active_role' => $activeAssignment?->role?->slug ?? 'student',
                'active_assignment' => $activeAssignment,
            ],
        ]);
    }

    public function registerStudent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'university_id' => 'required|exists:universities,id',
            'nim' => 'required|string|max:50',
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
            'study_program' => 'nullable|string|max:100',
            'enrollment_year' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ensure unique NIM per university
        if (StudentProfile::where('university_id', $request->university_id)->where('nim', $request->nim)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'The Student ID (NIM) has already been registered in this university.',
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'default_university_id' => $request->university_id,
            'status' => 'active',
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'university_id' => $request->university_id,
            'faculty_id' => $request->faculty_id,
            'department_id' => $request->department_id,
            'nim' => $request->nim,
            'study_program' => $request->study_program,
            'enrollment_year' => $request->enrollment_year ?? date('Y'),
        ]);

        $studentRole = Role::where('slug', 'student')->first();
        if ($studentRole) {
            UserRoleAssignment::create([
                'user_id' => $user->id,
                'role_id' => $studentRole->id,
                'university_id' => $request->university_id,
                'department_id' => $request->department_id,
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('campusconnect_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Student registration successful',
            'data' => [
                'token' => $token,
                'user' => $user,
            ],
        ], 201);
    }

    public function registerLecturer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'university_id' => 'required|exists:universities,id',
            'nidn' => 'required|string|max:50',
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'nullable|string',
            'specialization' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'default_university_id' => $request->university_id,
            'status' => 'active',
        ]);

        LecturerProfile::create([
            'user_id' => $user->id,
            'university_id' => $request->university_id,
            'faculty_id' => $request->faculty_id,
            'department_id' => $request->department_id,
            'nidn' => $request->nidn,
            'title' => $request->title,
            'specialization' => $request->specialization,
        ]);

        $lecturerRole = Role::where('slug', 'lecturer')->first();
        if ($lecturerRole) {
            UserRoleAssignment::create([
                'user_id' => $user->id,
                'role_id' => $lecturerRole->id,
                'university_id' => $request->university_id,
                'department_id' => $request->department_id,
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('campusconnect_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Lecturer registration successful',
            'data' => [
                'token' => $token,
                'user' => $user,
            ],
        ], 201);
    }


    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $roleAssignments = UserRoleAssignment::where('user_id', $user->id)
            ->where('status', 'active')
            ->with(['role', 'university', 'department', 'organization'])
            ->get();

        $studentProfile = StudentProfile::where('user_id', $user->id)->with(['university', 'department'])->first();
        $lecturerProfile = LecturerProfile::where('user_id', $user->id)->with(['university', 'department'])->first();

        $unreadNotifications = $user->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'role_assignments' => $roleAssignments,
                'student_profile' => $studentProfile,
                'lecturer_profile' => $lecturerProfile,
                'unread_notifications' => $unreadNotifications,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'avatar' => $request->avatar ?? $user->avatar,
        ]);

        ActivityLog::create([
            'university_id' => $user->default_university_id,
            'user_id' => $user->id,
            'action' => 'auth.profile_update',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['updated_fields' => ['name', 'phone']],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|different:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Your current password does not match our records.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        ActivityLog::create([
            'university_id' => $user->default_university_id,
            'user_id' => $user->id,
            'action' => 'auth.password_update',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['info' => 'Password changed successfully'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. You can now log in with your new password.',
        ]);
    }
}

