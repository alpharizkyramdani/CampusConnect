<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicCourse;
use App\Models\AcademicSemester;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicProgressController extends Controller
{
    /**
     * Get academic progress summary for current user or targeted student (if lecturer/admin)
     */
    public function show(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $targetUserId = $request->query('student_id') ? (int)$request->query('student_id') : $currentUser->id;

        // Authorization check: If viewing someone else's data
        if ($targetUserId !== $currentUser->id) {
            $isLecturer = $currentUser->hasRole('lecturer');
            $isDeptAdmin = $currentUser->hasRole('department_admin');
            $isCampusAdmin = $currentUser->hasRole('campus_admin');
            $isSuperAdmin = $currentUser->isSuperAdmin();

            if (!$isLecturer && !$isDeptAdmin && !$isCampusAdmin && !$isSuperAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki wewenang untuk mengakses rekaman akademik mahasiswa ini.',
                ], 403);
            }
        }

        $targetUser = User::with(['studentProfile.department.faculty', 'defaultUniversity'])->findOrFail($targetUserId);

        // Fetch semesters with courses
        $semesters = AcademicSemester::where('user_id', $targetUserId)
            ->with('courses')
            ->orderBy('semester_number', 'asc')
            ->get();

        // Calculate cumulative metrics
        $totalSksTaken = $semesters->sum('sks_taken');
        $totalSksPassed = $semesters->sum('sks_passed');
        $latestSemester = $semesters->last();
        $cumulativeGpa = $latestSemester?->cumulative_gpa ?? 0.00;

        // Target SKS for undergraduate / diploma graduation standard: 144 SKS
        $targetGraduationSks = 144;
        $remainingSks = max(0, $targetGraduationSks - $totalSksPassed);
        $completionPercentage = min(100, round(($totalSksPassed / $targetGraduationSks) * 100, 1));

        // Active semester courses
        $activeSemester = $semesters->where('status', 'active')->first();
        $activeCourses = $activeSemester ? $activeSemester->courses : collect();

        // Average attendance across all graded courses
        $allCourses = $semesters->flatMap->courses;
        $averageAttendance = $allCourses->count() > 0 ? round($allCourses->avg('attendance_percentage'), 1) : 100.0;

        // Chart data progression (Semester, IPS, IPK)
        $chartData = $semesters->map(function ($s) {
            return [
                'semester' => "Sem {$s->semester_number}",
                'semester_name' => $s->semester_name,
                'ips' => (float)$s->gpa,
                'ipk' => (float)$s->cumulative_gpa,
                'sks' => (int)$s->sks_taken,
            ];
        });

        return response()->json([
            'success' => true,
            'disclaimer' => 'Data akademik ini merupakan data simulasi portal kampus digital internal dan tidak terhubung secara real-time ke PDDikti/SIAKAD eksternal.',
            'data' => [
                'student' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'nim' => $targetUser->studentProfile?->nim ?? 'NIM-' . $targetUser->id,
                    'department' => $targetUser->studentProfile?->department?->name ?? 'Teknik Informatika',
                    'faculty' => $targetUser->studentProfile?->department?->faculty?->name ?? 'Fakultas Teknik',
                    'university' => $targetUser->defaultUniversity?->name ?? 'Politeknik Negeri Lhokseumawe',
                    'academic_advisor' => 'Dr. Ir. Teuku Fachruddin, M.T.',
                    'status' => 'Aktif',
                ],
                'summary' => [
                    'cumulative_gpa' => (float)$cumulativeGpa,
                    'total_sks_taken' => (int)$totalSksTaken,
                    'total_sks_passed' => (int)$totalSksPassed,
                    'target_graduation_sks' => $targetGraduationSks,
                    'remaining_sks' => (int)$remainingSks,
                    'completion_percentage' => $completionPercentage,
                    'average_attendance' => $averageAttendance,
                ],
                'chart_data' => $chartData,
                'active_courses' => $activeCourses,
                'all_semesters' => $semesters,
            ],
        ]);
    }
}

