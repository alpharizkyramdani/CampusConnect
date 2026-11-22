<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Department;
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
            'nim' => ['required', 'string', 'regex:/^\d{13}$/'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar pada sistem.',
            'password.min' => 'Password minimal terdiri dari 6 karakter.',
            'nim.required' => 'NIM mahasiswa wajib diisi.',
            'nim.regex' => 'NIM harus terdiri dari tepat 13 digit angka.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $nim = trim($request->nim);
        $universityId = 5; // Enforce Politeknik Negeri Lhokseumawe (PNL)

        // Parse 13-digit NIM: [YYYY (4)][PRODI (5)][MHS (4)]
        $enrollmentYear = intval(substr($nim, 0, 4));
        $prodiCode = substr($nim, 4, 5);
        $studentNumber = substr($nim, 9, 4);

        $currentYear = intval(date('Y'));
        if ($enrollmentYear < 2000 || $enrollmentYear > ($currentYear + 1)) {
            return response()->json([
                'success' => false,
                'message' => "Tahun masuk '{$enrollmentYear}' pada 4 digit awal NIM tidak valid (harus antara 2000 - " . ($currentYear + 1) . ").",
            ], 422);
        }

        // Match prodi_code with PNL departments
        $department = Department::where('university_id', $universityId)
            ->where('prodi_code', $prodiCode)
            ->first();

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => "Kode program studi '{$prodiCode}' (digit ke-5 s/d 9 NIM) tidak terdaftar di Politeknik Negeri Lhokseumawe.",
            ], 422);
        }

        // Ensure unique NIM in PNL
        if (StudentProfile::where('university_id', $universityId)->where('nim', $nim)->exists()) {
            return response()->json([
                'success' => false,
                'message' => "NIM '{$nim}' sudah terdaftar pada sistem Civitas PNL.",
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'default_university_id' => $universityId,
            'status' => 'active',
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'university_id' => $universityId,
            'faculty_id' => $department->faculty_id,
            'department_id' => $department->id,
            'nim' => $nim,
            'study_program' => $department->name,
            'enrollment_year' => $enrollmentYear,
        ]);

        $studentRole = Role::where('slug', 'student')->first();
        if ($studentRole) {
            UserRoleAssignment::create([
                'user_id' => $user->id,
                'role_id' => $studentRole->id,
                'university_id' => $universityId,
                'department_id' => $department->id,
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('campusconnect_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran Mahasiswa PNL berhasil',
            'data' => [
                'token' => $token,
                'user' => $user,
                'detected_program' => $department->name,
                'enrollment_year' => $enrollmentYear,
                'student_number' => $studentNumber,
            ],
        ], 201);
    }

    public function registerLecturer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'nip' => ['required', 'string', 'regex:/^\d{18}$/'],
            'gender' => 'required|in:L,P',
            'department_id' => 'required|exists:departments,id',
            'nidn' => 'nullable|string|max:50',
            'title' => 'nullable|string',
            'specialization' => 'nullable|string',
        ], [
            'name.required' => 'Nama dosen / tenaga pendidik wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar pada sistem.',
            'password.min' => 'Password minimal terdiri dari 6 karakter.',
            'nip.required' => 'NIP dosen wajib diisi.',
            'nip.regex' => 'NIP harus terdiri dari tepat 18 digit angka sesuai standar BKN/ASN.',
            'gender.required' => 'Jenis kelamin dosen wajib dipilih.',
            'gender.in' => 'Pilihan jenis kelamin harus L (Laki-laki) atau P (Perempuan).',
            'department_id.required' => 'Program studi / jurusan dosen wajib dipilih.',
            'department_id.exists' => 'Program studi yang dipilih tidak valid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $nip = trim($request->nip);
        $gender = $request->gender;
        $universityId = 5; // Enforce PNL

        // Validate 15th digit against gender
        // Format NIP 18 Digit: [YYYYMMDD (8)][YYYYMM (6)][G (1)][NNN (3)]
        $genderDigit = substr($nip, 14, 1);

        if (!in_array($genderDigit, ['1', '2'])) {
            return response()->json([
                'success' => false,
                'message' => "Digit ke-15 NIP harus berupa angka 1 (Laki-laki) atau 2 (Perempuan), ditemukan: '{$genderDigit}'.",
            ], 422);
        }

        if ($gender === 'L' && $genderDigit !== '1') {
            return response()->json([
                'success' => false,
                'message' => "Digit ke-15 NIP Anda bernilai '{$genderDigit}', tidak cocok dengan jenis kelamin Laki-laki (wajib bernilai 1).",
            ], 422);
        }

        if ($gender === 'P' && $genderDigit !== '2') {
            return response()->json([
                'success' => false,
                'message' => "Digit ke-15 NIP Anda bernilai '{$genderDigit}', tidak cocok dengan jenis kelamin Perempuan (wajib bernilai 2).",
            ], 422);
        }

        // Validate birthdate in NIP (YYYYMMDD)
        $birthYear = intval(substr($nip, 0, 4));
        $birthMonth = intval(substr($nip, 4, 2));
        $birthDay = intval(substr($nip, 6, 2));
        $currentYear = intval(date('Y'));
        if ($birthMonth < 1 || $birthMonth > 12 || $birthDay < 1 || $birthDay > 31 || $birthYear < 1940 || $birthYear > $currentYear) {
            return response()->json([
                'success' => false,
                'message' => "Format tanggal lahir pada 8 digit awal NIP tidak valid.",
            ], 422);
        }

        // Ensure unique NIP in PNL
        if (LecturerProfile::where('university_id', $universityId)->where('nip', $nip)->exists()) {
            return response()->json([
                'success' => false,
                'message' => "NIP '{$nip}' sudah terdaftar pada sistem Civitas PNL.",
            ], 422);
        }

        $department = Department::where('university_id', $universityId)->where('id', $request->department_id)->first();
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Program studi yang dipilih bukan bagian dari Politeknik Negeri Lhokseumawe.',
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'default_university_id' => $universityId,
            'status' => 'active',
        ]);

        LecturerProfile::create([
            'user_id' => $user->id,
            'university_id' => $universityId,
            'faculty_id' => $department->faculty_id,
            'department_id' => $department->id,
            'nip' => $nip,
            'nidn' => $request->nidn ?: $nip,
            'gender' => $gender,
            'title' => $request->title,
            'specialization' => $request->specialization,
        ]);

        $lecturerRole = Role::where('slug', 'lecturer')->first();
        if ($lecturerRole) {
            UserRoleAssignment::create([
                'user_id' => $user->id,
                'role_id' => $lecturerRole->id,
                'university_id' => $universityId,
                'department_id' => $department->id,
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('campusconnect_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran Dosen / Tendik PNL berhasil',
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

