<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\MaintenanceReport;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\ServiceRequest;
use App\Models\StudentProfile;
use App\Models\University;
use App\Models\UniversityRegistrationRequest;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $request->query('role');
        $universityId = $request->query('university_id') ?? $user->default_university_id;

        // Auto-detect role if not explicitly provided
        if (!$role) {
            $assignment = UserRoleAssignment::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('role')
                ->first();
            $role = $assignment?->role?->slug ?? 'student';
            if ($assignment?->university_id) {
                $universityId = $assignment->university_id;
            }
        }

        switch ($role) {
            case 'super_admin':
                return $this->getSuperAdminDashboard();
            case 'campus_admin':
                return $this->getCampusAdminDashboard($universityId);
            case 'department_admin':
                $deptId = $request->query('department_id') ?? UserRoleAssignment::where('user_id', $user->id)->whereHas('role', fn($q) => $q->where('slug', 'department_admin'))->value('department_id');
                return $this->getDeptAdminDashboard($deptId, $universityId);
            case 'ukm_admin':
            case 'ormawa_admin':
                $orgId = $request->query('organization_id') ?? UserRoleAssignment::where('user_id', $user->id)->whereHas('role', fn($q) => $q->whereIn('slug', ['ukm_admin', 'ormawa_admin']))->value('organization_id');
                return $this->getOrgAdminDashboard($orgId);
            case 'lecturer':
                return $this->getLecturerDashboard($user, $universityId);
            case 'student':
            default:
                return $this->getStudentDashboard($user, $universityId);
        }
    }

    private function getSuperAdminDashboard(): JsonResponse
    {
        $totalUniversities = University::count();
        $activeUniversities = University::where('status', 'active')->count();
        $pendingRequests = UniversityRegistrationRequest::where('status', 'pending')->count();
        $totalUsers = User::count();
        $totalEvents = Event::count();
        $totalBorrowings = FacilityBorrowing::count();

        // Monthly user growth chart data
        $userGrowth = User::selectRaw('DATE_FORMAT(created_at, "%b %Y") as month, COUNT(*) as count')
            ->groupBy('month')
            ->take(6)
            ->get();

        $recentActivities = ActivityLog::with(['user:id,name', 'university:id,name'])->latest()->take(8)->get();
        $recentRequests = UniversityRegistrationRequest::latest()->take(5)->get();

        $campusBreakdown = University::whereNull('deleted_at')
            ->withCount(['departments', 'organizations', 'events'])
            ->get()
            ->map(function ($u) {
                return [
                    'name' => $u->code,
                    'full_name' => $u->name,
                    'users_count' => User::where('default_university_id', $u->id)->count(),
                    'events_count' => $u->events_count,
                    'organizations_count' => $u->organizations_count,
                    'departments_count' => $u->departments_count,
                ];
            });

        $roleDistribution = Role::withCount('userRoleAssignments')->get()->map(function ($r) {
            return [
                'name' => $r->name,
                'slug' => $r->slug,
                'count' => $r->user_role_assignments_count,
            ];
        });

        return response()->json([
            'success' => true,
            'role' => 'super_admin',
            'data' => [
                'stats' => [
                    'total_universities' => $totalUniversities,
                    'active_universities' => $activeUniversities,
                    'pending_requests' => $pendingRequests,
                    'total_users' => $totalUsers,
                    'total_events' => $totalEvents,
                    'total_borrowings' => $totalBorrowings,
                ],
                'user_growth' => $userGrowth,
                'recent_activities' => $recentActivities,
                'recent_requests' => $recentRequests,
                'campus_breakdown' => $campusBreakdown,
                'role_distribution' => $roleDistribution,
            ],
        ]);
    }

    private function getCampusAdminDashboard($universityId): JsonResponse
    {
        $totalStudents = StudentProfile::where('university_id', $universityId)->count();
        $totalLecturers = UserRoleAssignment::where('university_id', $universityId)
            ->whereHas('role', fn($q) => $q->where('slug', 'lecturer'))
            ->count();
        $totalOrganizations = Organization::where('university_id', $universityId)->count();
        $totalEvents = Event::where('university_id', $universityId)->count();
        $totalReports = MaintenanceReport::where('university_id', $universityId)->count();
        $pendingReports = MaintenanceReport::where('university_id', $universityId)->where('status', 'submitted')->count();

        $monthlyEvents = Event::where('university_id', $universityId)
            ->selectRaw('DATE_FORMAT(start_time, "%b") as month, COUNT(*) as total_events, SUM(current_participants) as participants')
            ->groupBy('month')
            ->take(6)
            ->get();

        $recentAnnouncements = Announcement::where('university_id', $universityId)->with('category')->latest()->take(5)->get();
        $recentEvents = Event::where('university_id', $universityId)->with('category')->latest()->take(5)->get();
        $recentReports = MaintenanceReport::where('university_id', $universityId)->latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'role' => 'campus_admin',
            'data' => [
                'stats' => [
                    'total_students' => $totalStudents,
                    'total_lecturers' => $totalLecturers,
                    'total_organizations' => $totalOrganizations,
                    'total_events' => $totalEvents,
                    'total_reports' => $totalReports,
                    'pending_reports' => $pendingReports,
                ],
                'event_trends' => $monthlyEvents,
                'recent_announcements' => $recentAnnouncements,
                'recent_events' => $recentEvents,
                'recent_reports' => $recentReports,
            ],
        ]);
    }

    private function getDeptAdminDashboard($deptId, $universityId): JsonResponse
    {
        $totalEquipment = Facility::when($deptId, fn($q) => $q->where('department_id', $deptId))->sum('total_quantity');
        $availableEquipment = Facility::when($deptId, fn($q) => $q->where('department_id', $deptId))->sum('available_quantity');
        $borrowingRequests = FacilityBorrowing::when($deptId, fn($q) => $q->where('department_id', $deptId))->where('status', 'pending')->count();
        $activeBorrowings = FacilityBorrowing::when($deptId, fn($q) => $q->where('department_id', $deptId))->where('status', 'borrowed')->count();
        $overdueEquipment = FacilityBorrowing::when($deptId, fn($q) => $q->where('department_id', $deptId))->where('status', 'overdue')->count();
        $maintenanceReports = MaintenanceReport::when($deptId, fn($q) => $q->where('department_id', $deptId))->count();

        $recentRequests = FacilityBorrowing::when($deptId, fn($q) => $q->where('department_id', $deptId))
            ->with(['facility', 'user:id,name,email,avatar'])
            ->latest()
            ->take(6)
            ->get();

        $equipmentList = Facility::when($deptId, fn($q) => $q->where('department_id', $deptId))
            ->with('category')
            ->take(8)
            ->get();

        return response()->json([
            'success' => true,
            'role' => 'department_admin',
            'data' => [
                'stats' => [
                    'total_equipment' => $totalEquipment,
                    'available_equipment' => $availableEquipment,
                    'borrowing_requests' => $borrowingRequests,
                    'active_borrowings' => $activeBorrowings,
                    'overdue_equipment' => $overdueEquipment,
                    'maintenance_reports' => $maintenanceReports,
                ],
                'recent_requests' => $recentRequests,
                'inventory_summary' => $equipmentList,
            ],
        ]);
    }

    private function getOrgAdminDashboard($orgId): JsonResponse
    {
        $org = Organization::withCount(['members', 'events', 'workPrograms', 'applications'])->find($orgId);

        $pendingApplications = $org ? $org->applications()->where('status', 'pending')->count() : 0;
        $upcomingEvents = $org ? $org->events()->where('start_time', '>=', now())->count() : 0;
        $totalParticipants = $org ? $org->events()->sum('current_participants') : 0;

        $recentEvents = $org ? $org->events()->latest()->take(5)->get() : [];
        $recentMembers = $org ? $org->members()->with('user')->latest()->take(5)->get() : [];

        return response()->json([
            'success' => true,
            'role' => 'org_admin',
            'data' => [
                'organization' => $org,
                'stats' => [
                    'total_members' => $org?->members_count ?? 0,
                    'pending_applications' => $pendingApplications,
                    'total_events' => $org?->events_count ?? 0,
                    'upcoming_events' => $upcomingEvents,
                    'total_participants' => $totalParticipants,
                    'work_programs' => $org?->work_programs_count ?? 0,
                ],
                'recent_events' => $recentEvents,
                'recent_members' => $recentMembers,
            ],
        ]);
    }

    private function getStudentDashboard($user, $universityId): JsonResponse
    {
        $registeredEventsCount = EventRegistration::where('user_id', $user->id)->count();
        $attendedEventsCount = EventRegistration::where('user_id', $user->id)->where('status', 'attended')->count();
        $activeBorrowingsCount = FacilityBorrowing::where('user_id', $user->id)->whereIn('status', ['pending', 'approved', 'borrowed'])->count();
        $activeReportsCount = MaintenanceReport::where('user_id', $user->id)->whereIn('status', ['submitted', 'under_review', 'assigned', 'in_progress'])->count();

        $registeredEvents = EventRegistration::where('user_id', $user->id)
            ->with(['event.organization', 'event.category'])
            ->latest()
            ->take(4)
            ->get();

        $upcomingEvents = Event::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->where('start_time', '>=', now())
            ->with(['organization', 'category'])
            ->orderBy('start_time')
            ->take(4)
            ->get();

        $recentAnnouncements = Announcement::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->with('category')
            ->latest('published_at')
            ->take(4)
            ->get();

        $borrowings = FacilityBorrowing::where('user_id', $user->id)
            ->with(['facility', 'department'])
            ->latest()
            ->take(4)
            ->get();

        return response()->json([
            'success' => true,
            'role' => 'student',
            'data' => [
                'stats' => [
                    'registered_events' => $registeredEventsCount,
                    'attended_events' => $attendedEventsCount,
                    'active_borrowings' => $activeBorrowingsCount,
                    'active_reports' => $activeReportsCount,
                ],
                'registered_events' => $registeredEvents,
                'upcoming_events' => $upcomingEvents,
                'recent_announcements' => $recentAnnouncements,
                'recent_borrowings' => $borrowings,
            ],
        ]);
    }

    private function getLecturerDashboard($user, $universityId): JsonResponse
    {
        $recentAnnouncements = Announcement::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->with('category')
            ->latest()
            ->take(5)
            ->get();

        $upcomingEvents = Event::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->where('start_time', '>=', now())
            ->with('category')
            ->orderBy('start_time')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'role' => 'lecturer',
            'data' => [
                'recent_announcements' => $recentAnnouncements,
                'upcoming_events' => $upcomingEvents,
            ],
        ]);
    }
}

