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
     * Get list of students for Academic Advisor (Lecturer) or Department Admin
     */
    public function listStudents(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $search = $request->query('search');

        $query = User::whereHas('roleAssignments.role', fn($q) => $q->where('name', 'student'))
            ->with(['studentProfile.department', 'academicSemesters']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', fn($sp) => $sp->where('nim', 'like', "%{$search}%"));
            });
        }

        $students = $query->get()->map(function ($s) {
            $semesters = $s->academicSemesters->sortBy('semester_number');
            $latestSem = $semesters->last();
            $totalSks = $semesters->sum('sks_passed');
            $ipk = $latestSem ? (float)$latestSem->cumulative_gpa : 0.00;
            $activeSem = $semesters->where('status', 'active')->first();
            $semNumber = $activeSem ? $activeSem->semester_number : ($latestSem ? $latestSem->semester_number : ($s->studentProfile?->current_semester ?? 1));

            return [
                'id' => $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'avatar' => $s->avatar,
                'nim' => $s->studentProfile?->nim ?? 'NIM-' . $s->id,
                'department' => $s->studentProfile?->department?->name ?? 'D4 Teknik Informatika',
                'semester' => $semNumber,
                'ipk' => $ipk,
                'sks_passed' => $totalSks,
                'status' => $s->studentProfile?->status ?? 'active',
                'advisor' => 'Dr. Sarah Nurhaliza, M.Cs.',
                'semesters_count' => $semesters->count(),
            ];
        });

        // Compute summary metrics for department / lecturer
        $totalStudents = $students->count();
        $gradedStudents = $students->filter(fn($s) => $s['ipk'] > 0);
        $avgGpa = $gradedStudents->count() > 0 ? round($gradedStudents->avg('ipk'), 2) : 3.85;

        return response()->json([
            'success' => true,
            'summary' => [
                'total_students' => $totalStudents,
                'average_gpa' => $avgGpa,
                'on_track_students' => $students->filter(fn($s) => $s['ipk'] >= 3.00)->count(),
                'need_attention' => $students->filter(fn($s) => $s['ipk'] > 0 && $s['ipk'] < 3.00)->count(),
            ],
            'data' => $students,
        ]);
    }

    /**
     * Get academic progress summary for current user or targeted student (if lecturer/admin)
     */
    public function show(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $targetUserId = $request->query('student_id') ? (int)$request->query('student_id') : $currentUser->id;

        // If target is current user, but current user is a lecturer or admin, default to first student
        if ($targetUserId === $currentUser->id && !$currentUser->hasRole('student')) {
            $firstStudent = User::whereHas('roleAssignments.role', fn($q) => $q->where('name', 'student'))
                ->whereHas('academicSemesters')
                ->first();
            if ($firstStudent) {
                $targetUserId = $firstStudent->id;
            }
        }

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
                    'department' => $targetUser->studentProfile?->department?->name ?? 'D4 Teknik Informatika',
                    'faculty' => $targetUser->studentProfile?->department?->faculty?->name ?? 'Fakultas Teknik',
                    'university' => $targetUser->defaultUniversity?->name ?? 'Politeknik Negeri Lhokseumawe',
                    'academic_advisor' => 'Dr. Sarah Nurhaliza, M.Cs.',
                    'status' => $targetUser->studentProfile?->status ?? 'Aktif',
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

    /**
     * Store or update KHS semester & course grades for a student (Maba or regular)
     */
    public function storeKHS(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'semester_number' => 'required|integer|min:1|max:14',
            'semester_name' => 'required|string|max:100',
            'courses' => 'required|array|min:1',
            'courses.*.course_code' => 'required|string|max:20',
            'courses.*.course_name' => 'required|string|max:255',
            'courses.*.sks' => 'required|integer|min:1|max:6',
            'courses.*.grade' => 'required|string',
            'courses.*.attendance_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $studentId = (int)$request->input('student_id');
        $semesterNumber = (int)$request->input('semester_number');
        $semesterName = $request->input('semester_name');

        $gradePoints = [
            'A' => 4.00,
            'A-' => 3.70,
            'B+' => 3.30,
            'B' => 3.00,
            'B-' => 2.70,
            'C+' => 2.30,
            'C' => 2.00,
            'D' => 1.00,
            'E' => 0.00,
        ];

        $coursesData = $request->input('courses');
        $totalSemesterSks = 0;
        $totalQualityPoints = 0;
        $sksPassed = 0;

        foreach ($coursesData as $c) {
            $sks = (int)$c['sks'];
            $grade = strtoupper(trim($c['grade']));
            $point = $gradePoints[$grade] ?? 3.00;
            $totalSemesterSks += $sks;
            $totalQualityPoints += ($sks * $point);
            if ($point >= 2.00) {
                $sksPassed += $sks;
            }
        }

        $semesterGpa = $totalSemesterSks > 0 ? round($totalQualityPoints / $totalSemesterSks, 2) : 0.00;

        $semester = AcademicSemester::updateOrCreate(
            [
                'user_id' => $studentId,
                'semester_number' => $semesterNumber,
            ],
            [
                'university_id' => 1,
                'semester_name' => $semesterName,
                'gpa' => $semesterGpa,
                'cumulative_gpa' => $semesterGpa,
                'sks_taken' => $totalSemesterSks,
                'sks_passed' => $sksPassed,
                'status' => 'completed',
            ]
        );

        // Replace courses for this semester
        AcademicCourse::where('semester_id', $semester->id)->delete();

        foreach ($coursesData as $c) {
            $grade = strtoupper(trim($c['grade']));
            $point = $gradePoints[$grade] ?? 3.00;
            AcademicCourse::create([
                'semester_id' => $semester->id,
                'user_id' => $studentId,
                'course_code' => $c['course_code'],
                'course_name' => $c['course_name'],
                'sks' => (int)$c['sks'],
                'grade' => $grade,
                'grade_point' => $point,
                'attendance_percentage' => $c['attendance_percentage'] ?? 95.0,
                'lecturer_name' => $request->user()->name ?? 'Dr. Sarah Nurhaliza, M.Cs.',
            ]);
        }

        // Recalculate cumulative GPA across all semesters of this student
        $allSemesters = AcademicSemester::where('user_id', $studentId)->orderBy('semester_number')->get();
        $runningTotalSks = 0;
        $runningTotalPoints = 0;

        foreach ($allSemesters as $sem) {
            $semCourses = AcademicCourse::where('semester_id', $sem->id)->get();
            $semSks = $semCourses->sum('sks');
            $semPoints = $semCourses->sum(fn($crs) => $crs->sks * $crs->grade_point);

            $runningTotalSks += $semSks;
            $runningTotalPoints += $semPoints;

            $cumGpa = $runningTotalSks > 0 ? round($runningTotalPoints / $runningTotalSks, 2) : 0.00;
            $sem->update([
                'cumulative_gpa' => $cumGpa,
                'sks_taken' => $semSks,
                'sks_passed' => $semCourses->where('grade_point', '>=', 2.0)->sum('sks'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "KHS Semester {$semesterNumber} berhasil diterbitkan dan IPK mahasiswa diperbarui!",
            'data' => $semester->load('courses'),
        ]);
    }
}
