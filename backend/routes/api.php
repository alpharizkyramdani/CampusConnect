<?php

use App\Http\Controllers\Api\AcademicCalendarController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\DiscussionController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\LostFoundController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\StudentServiceController;
use App\Http\Controllers\Api\UniversityController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - CampusConnect V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. PUBLIC & AUTH ROUTES
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register-student', [AuthController::class, 'registerStudent']);
    Route::post('/auth/register-lecturer', [AuthController::class, 'registerLecturer']);
    Route::post('/auth/register-university', [AuthController::class, 'registerUniversity']);

    // Public University & Directory
    Route::get('/universities', [UniversityController::class, 'index']);
    Route::get('/universities/{id}', [UniversityController::class, 'show']);
    Route::get('/universities/{id}/faculties', [UniversityController::class, 'faculties']);
    Route::get('/universities/{id}/departments', [UniversityController::class, 'departments']);

    // Public Events & Announcements
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::get('/event-categories', [EventController::class, 'categories']);

    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);
    Route::get('/announcement-categories', [AnnouncementController::class, 'categories']);

    // Public Organizations & Academic Calendar
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
    Route::get('/academic-calendar', [AcademicCalendarController::class, 'index']);

    // Public Certificate Verification
    Route::get('/certificates/verify/{hash}', [CertificateController::class, 'verify']);

    // 2. AUTHENTICATED ROUTES
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Dashboard & Analytics
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboard']);

        // Announcements Management
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        // Events & Ticketing & QR Attendance Check-in
        Route::post('/events', [EventController::class, 'store']);
        Route::post('/events/{id}/register', [EventController::class, 'register']);
        Route::get('/events/{id}/registrations', [EventController::class, 'registrations']);
        Route::post('/events/verify-ticket', [EventController::class, 'verifyTicket']);
        Route::get('/my-tickets', [EventController::class, 'myTickets']);

        // Academic Calendar
        Route::post('/academic-calendar', [AcademicCalendarController::class, 'store']);
        Route::delete('/academic-calendar/{id}', [AcademicCalendarController::class, 'destroy']);

        // Facilities & Borrowing (Module 05)
        Route::get('/facilities', [FacilityController::class, 'index']);
        Route::get('/facilities/{id}', [FacilityController::class, 'show']);
        Route::post('/facilities', [FacilityController::class, 'store']);
        Route::put('/facilities/{id}', [FacilityController::class, 'update']);
        Route::get('/facility-categories/{universityId}', [FacilityController::class, 'categories']);

        Route::post('/borrowings', [FacilityController::class, 'requestBorrow']);
        Route::get('/borrowings', [FacilityController::class, 'listBorrowings']);
        Route::post('/borrowings/{id}/approve', [FacilityController::class, 'approveBorrowing']);
        Route::post('/borrowings/{id}/reject', [FacilityController::class, 'rejectBorrowing']);
        Route::post('/borrowings/{id}/pickup', [FacilityController::class, 'recordPickup']);
        Route::post('/borrowings/{id}/return', [FacilityController::class, 'recordReturn']);

        // Maintenance Reports (Module 06)
        Route::get('/maintenance', [MaintenanceController::class, 'index']);
        Route::get('/maintenance/{id}', [MaintenanceController::class, 'show']);
        Route::post('/maintenance', [MaintenanceController::class, 'store']);
        Route::put('/maintenance/{id}/status', [MaintenanceController::class, 'updateStatus']);

        // Lost & Found (Module 07)
        Route::get('/lost-found', [LostFoundController::class, 'index']);
        Route::get('/lost-found/{id}', [LostFoundController::class, 'show']);
        Route::post('/lost-found', [LostFoundController::class, 'store']);
        Route::post('/lost-found/{id}/claim', [LostFoundController::class, 'submitClaim']);
        Route::get('/lost-found/{id}/claims', [LostFoundController::class, 'listClaims']);
        Route::post('/claims/{id}/review', [LostFoundController::class, 'reviewClaim']);

        // Organizations (Module 08)
        Route::post('/organizations/{id}/apply', [OrganizationController::class, 'apply']);
        Route::get('/organizations/{id}/applications', [OrganizationController::class, 'listApplications']);
        Route::post('/applications/{id}/review', [OrganizationController::class, 'reviewApplication']);

        // Student Services (Module 09)
        Route::get('/service-types', [StudentServiceController::class, 'serviceTypes']);
        Route::get('/service-requests', [StudentServiceController::class, 'listRequests']);
        Route::post('/service-requests', [StudentServiceController::class, 'submitRequest']);
        Route::put('/service-requests/{id}/status', [StudentServiceController::class, 'updateStatus']);

        // Digital Certificates (Module 10)
        Route::get('/certificates', [CertificateController::class, 'index']);
        Route::post('/certificates/issue', [CertificateController::class, 'issue']);

        // Notifications (Module 12)
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // Documents (Module 13)
        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
        Route::get('/document-categories/{universityId}', [DocumentController::class, 'categories']);

        // Discussions (Module 14)
        Route::get('/discussions', [DiscussionController::class, 'index']);
        Route::get('/discussions/{id}', [DiscussionController::class, 'show']);
        Route::post('/discussions', [DiscussionController::class, 'store']);
        Route::post('/discussions/{id}/comments', [DiscussionController::class, 'comment']);
        Route::post('/discussions/{id}/report', [DiscussionController::class, 'report']);
        Route::get('/discussion-categories', [DiscussionController::class, 'categories']);

        // Portfolio (Module 15)
        Route::get('/portfolio', [PortfolioController::class, 'getPortfolio']);
        Route::post('/portfolio/activity', [PortfolioController::class, 'storeActivity']);
        Route::post('/portfolio/achievement', [PortfolioController::class, 'storeAchievement']);

        // User Management (Module 17)
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}/status', [UserManagementController::class, 'updateStatus']);
        Route::post('/users/{id}/assign-role', [UserManagementController::class, 'assignRole']);
        Route::get('/roles', [UserManagementController::class, 'roles']);

        // Audit Logs (Module 18)
        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        // University Requests (Super Admin)
        Route::get('/university-requests', [UniversityController::class, 'getRequests']);
        Route::post('/university-requests/{id}/approve', [UniversityController::class, 'approveRequest']);
        Route::post('/university-requests/{id}/reject', [UniversityController::class, 'rejectRequest']);
    });
});
