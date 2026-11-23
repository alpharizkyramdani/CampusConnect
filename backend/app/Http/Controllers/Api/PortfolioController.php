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
        $targetUserId = $request->query('user_id');
        $user = ($targetUserId && $targetUserId != $request->user()->id)
            ? (\App\Models\User::find($targetUserId) ?? $request->user())
            : $request->user();

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
            ->with(['verifier:id,name'])
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
            'rank' => 'nullable|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'year' => 'required|integer',
            'certificate_url' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $achievement = Achievement::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'level' => $request->level,
            'rank' => $request->rank,
            'organizer' => $request->organizer,
            'year' => $request->year,
            'certificate_url' => $request->certificate_url,
            'description' => $request->description,
            'is_verified' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Prestasi berhasil disubmit dan menunggu verifikasi Admin Jurusan / Kemahasiswaan.',
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
            ->with([
                'user:id,name,email,avatar',
                'user.studentProfile.university:id,name,code',
                'user.studentProfile.department:id,name',
                'verifier:id,name',
            ])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $achievements,
        ]);
    }

    public function verifyAchievement(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $achievement = Achievement::with(['user.studentProfile.department', 'user.studentProfile.university'])->findOrFail($id);

        // Verification authorization: super_admin, campus_admin, department_admin, lecturer, ukm_admin, ormawa_admin
        $allowedRoles = ['super_admin', 'campus_admin', 'department_admin', 'lecturer', 'ukm_admin', 'ormawa_admin'];
        $hasPermission = false;
        foreach ($allowedRoles as $role) {
            if ($user->hasRole($role)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses verifikasi prestasi. Wewenang khusus Admin Jurusan, Dosen, atau Kemahasiswaan.',
            ], 403);
        }

        // If Department Admin: verify department boundary
        if ($user->hasRole('department_admin')) {
            $adminDeptId = $user->roleAssignments()->whereHas('role', fn($q) => $q->where('name', 'department_admin'))->value('department_id') 
                ?? $user->lecturerProfile?->department_id;
            $studentDeptId = $achievement->user?->studentProfile?->department_id;

            if ($adminDeptId && $studentDeptId && (int)$adminDeptId !== (int)$studentDeptId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda hanya berwenang memverifikasi prestasi mahasiswa di jurusan/program studi Anda.',
                ], 403);
            }
        }

        $achievement->update([
            'is_verified' => true,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Prestasi mahasiswa berhasil diverifikasi dan disahkan untuk Portofolio & Hall of Fame.',
            'data' => $achievement->fresh(['user.studentProfile.university', 'user.studentProfile.department', 'verifier:id,name']),
        ]);
    }

    public function rejectAchievement(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $achievement = Achievement::with(['user.studentProfile.department'])->findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $allowedRoles = ['super_admin', 'campus_admin', 'department_admin', 'lecturer', 'ukm_admin', 'ormawa_admin'];
        $hasPermission = false;
        foreach ($allowedRoles as $role) {
            if ($user->hasRole($role)) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menolak pengajuan prestasi.',
            ], 403);
        }

        // Department scoping check
        if ($user->hasRole('department_admin')) {
            $adminDeptId = $user->roleAssignments()->whereHas('role', fn($q) => $q->where('name', 'department_admin'))->value('department_id') 
                ?? $user->lecturerProfile?->department_id;
            $studentDeptId = $achievement->user?->studentProfile?->department_id;

            if ($adminDeptId && $studentDeptId && (int)$adminDeptId !== (int)$studentDeptId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda hanya berwenang memproses prestasi mahasiswa di jurusan/program studi Anda.',
                ], 403);
            }
        }

        $achievement->update([
            'is_verified' => false,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan prestasi ditolak dengan catatan alasan untuk mahasiswa.',
            'data' => $achievement->fresh(['user.studentProfile.university', 'verifier:id,name']),
        ]);
    }
}

