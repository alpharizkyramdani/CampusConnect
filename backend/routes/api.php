<?php

use App\Http\Controllers\Api\AcademicCalendarController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampusMapController;
use App\Http\Controllers\Api\CareerCenterController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DigitalLibraryController;
use App\Http\Controllers\Api\DiscussionController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentVersionController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\EventEnhancementController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\GlobalSearchController;
use App\Http\Controllers\Api\LostFoundController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\OrganizationEnhancementController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\PrivacyController;
use App\Http\Controllers\Api\SocialFeedController;
use App\Http\Controllers\Api\SocialHubEnhancementController;
use App\Http\Controllers\Api\StudentServiceController;
use App\Http\Controllers\Api\UniversityController;
use App\Http\Controllers\Api\UploadController;
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
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

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

    // Public Smart Campus Map Locations
    Route::get('/campus-map/locations', [CampusMapController::class, 'index']);

    // Public Organizations & Academic Calendar
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
    Route::get('/academic-calendar', [AcademicCalendarController::class, 'index']);
    Route::get('/achievements', [PortfolioController::class, 'listAchievements']);

    // Public Certificate & Student Document Verification
    Route::get('/certificates/verify/{hash}', [CertificateController::class, 'verify']);
    Route::get('/student-services/verify/{code}', [StudentServiceController::class, 'verifyDocument']);
    Route::get('/files/private', [UploadController::class, 'servePrivateFile'])->name('private.file.download');

    // Public Campus Social Feed
    Route::get('/feed', [SocialFeedController::class, 'index']);
    Route::get('/feed/{id}/comments', [SocialFeedController::class, 'getComments']);

    // 2. AUTHENTICATED ROUTES
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'updatePassword']);
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
        Route::post('/events/scan-ticket', [EventController::class, 'verifyTicket']);
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
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::put('/organizations/{id}', [OrganizationController::class, 'update']);
        Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy']);
        Route::post('/organizations/{id}/members', [OrganizationController::class, 'addMember']);
        Route::delete('/organizations/{id}/members/{memberId}', [OrganizationController::class, 'removeMember']);
        Route::post('/organizations/{id}/apply', [OrganizationController::class, 'apply']);
        Route::get('/organizations/{id}/applications', [OrganizationController::class, 'listApplications']);
        Route::post('/applications/{id}/review', [OrganizationController::class, 'reviewApplication']);

        // File Upload (Avatar & Logos & Post Media & Private Storage)
        Route::post('/upload', [UploadController::class, 'uploadImage']);
        Route::post('/upload/private', [UploadController::class, 'uploadPrivateFile']);

        // Campus Social Feed (Twitter-style Microblogging)
        Route::post('/feed', [SocialFeedController::class, 'store']);
        Route::post('/feed/{id}/like', [SocialFeedController::class, 'toggleLike']);
        Route::post('/feed/{id}/repost', [SocialFeedController::class, 'repost']);
        Route::post('/feed/{id}/comments', [SocialFeedController::class, 'comment']);
        Route::delete('/feed/{id}', [SocialFeedController::class, 'destroy']);

        // Social Follows (Pertemanan & Following)
        Route::post('/users/{id}/follow', [FollowController::class, 'toggleFollow']);
        Route::get('/users/{id}/follow-status', [FollowController::class, 'status']);
        Route::get('/users/{id}/followers', [FollowController::class, 'followers']);
        Route::get('/users/{id}/following', [FollowController::class, 'following']);
        Route::delete('/users/followers/{followerId}', [FollowController::class, 'removeFollower']);
        Route::get('/users-suggestions', [FollowController::class, 'suggestions']);

        // Direct Messaging (Chatan 1-on-1)
        Route::get('/chat/conversations', [ChatController::class, 'conversations']);
        Route::get('/chat/messages/{partnerId}', [ChatController::class, 'messages']);
        Route::post('/chat/messages/{partnerId}', [ChatController::class, 'sendMessage']);
        Route::get('/chat/unread-count', [ChatController::class, 'unreadCount']);

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
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
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
        Route::put('/achievements/{id}/verify', [PortfolioController::class, 'verifyAchievement']);
        Route::put('/achievements/{id}/reject', [PortfolioController::class, 'rejectAchievement']);

        // User Management (Module 17)
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}/status', [UserManagementController::class, 'updateStatus']);
        Route::post('/users/{id}/verify', [UserManagementController::class, 'verifyUser']);
        Route::post('/users/{id}/transition-alumni', [UserManagementController::class, 'transitionToAlumni']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::post('/users/{id}/assign-role', [UserManagementController::class, 'assignRole']);
        Route::delete('/users/{userId}/roles/{assignmentId}', [UserManagementController::class, 'revokeRole']);
        Route::get('/roles', [UserManagementController::class, 'roles']);

        // Audit Logs (Module 18)
        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        // 1. Community Safety & Content Moderation
        Route::post('/reports', [ModerationController::class, 'report']);
        Route::get('/moderation/reports', [ModerationController::class, 'index']);
        Route::post('/moderation/reports/{id}/resolve', [ModerationController::class, 'resolve']);

        // 2. Privacy & Account Controls
        Route::get('/privacy/settings', [PrivacyController::class, 'getSettings']);
        Route::put('/privacy/settings', [PrivacyController::class, 'updateSettings']);
        Route::post('/users/{id}/block', [PrivacyController::class, 'blockUser']);
        Route::delete('/users/{id}/block', [PrivacyController::class, 'unblockUser']);
        Route::post('/users/{id}/mute', [PrivacyController::class, 'muteUser']);
        Route::delete('/users/{id}/mute', [PrivacyController::class, 'unmuteUser']);

        // 4. Smart Campus Map (Admin Management)
        Route::post('/campus-map/locations', [CampusMapController::class, 'store']);
        Route::put('/campus-map/locations/{id}', [CampusMapController::class, 'update']);
        Route::delete('/campus-map/locations/{id}', [CampusMapController::class, 'destroy']);

        // 5. Career & Internship Center
        Route::get('/career/opportunities', [CareerCenterController::class, 'index']);
        Route::get('/career/opportunities/{id}', [CareerCenterController::class, 'show']);
        Route::post('/career/opportunities', [CareerCenterController::class, 'store']);
        Route::post('/career/opportunities/{id}/apply', [CareerCenterController::class, 'apply']);
        Route::post('/career/opportunities/{id}/bookmark', [CareerCenterController::class, 'toggleBookmark']);
        Route::get('/career/my-applications', [CareerCenterController::class, 'myApplications']);
        Route::get('/career/opportunities/{id}/applicants', [CareerCenterController::class, 'listApplicants']);
        Route::put('/career/applications/{id}/status', [CareerCenterController::class, 'updateApplicationStatus']);

        // 6. Digital Library
        Route::get('/library/items', [DigitalLibraryController::class, 'index']);
        Route::post('/library/items', [DigitalLibraryController::class, 'store']);
        Route::get('/library/items/{id}/read-access', [DigitalLibraryController::class, 'readAccess']);
        Route::post('/library/items/{id}/borrow', [DigitalLibraryController::class, 'borrow']);
        Route::post('/library/loans/{id}/return', [DigitalLibraryController::class, 'returnBook']);
        Route::get('/library/my-loans', [DigitalLibraryController::class, 'myLoans']);

        // 7. Global Search
        Route::get('/search/global', [GlobalSearchController::class, 'search']);

        // 8. Social Hub Enhancements (Bookmarks, Edit Post, Detail, Trending, Chat Search)
        Route::post('/feed/{id}/bookmark', [SocialHubEnhancementController::class, 'toggleBookmark']);
        Route::get('/feed/saved-posts', [SocialHubEnhancementController::class, 'mySavedPosts']);
        Route::put('/feed/{id}', [SocialHubEnhancementController::class, 'updatePost']);
        Route::get('/feed/{id}/detail', [SocialHubEnhancementController::class, 'showPost']);
        Route::get('/feed-trending', [SocialHubEnhancementController::class, 'trending']);
        Route::get('/chat/search', [ChatController::class, 'search']);

        // 9. Event Waitlist & Cancellation
        Route::post('/events/{id}/cancel', [EventEnhancementController::class, 'cancelRegistration']);
        Route::post('/events/{id}/waitlist', [EventEnhancementController::class, 'joinWaitlist']);

        // 10. Organization Programs & Finances
        Route::get('/organizations/{id}/work-programs', [OrganizationEnhancementController::class, 'listWorkPrograms']);
        Route::post('/organizations/{id}/work-programs', [OrganizationEnhancementController::class, 'storeWorkProgram']);
        Route::get('/organizations/{id}/finances', [OrganizationEnhancementController::class, 'listFinances']);
        Route::post('/organizations/{id}/finances', [OrganizationEnhancementController::class, 'storeFinance']);

        // 11. Document Version History
        Route::get('/documents/{id}/versions', [DocumentVersionController::class, 'index']);
        Route::post('/documents/{id}/versions', [DocumentVersionController::class, 'store']);

        // University Management (Super Admin & Campus Admin)
        Route::post('/universities', [UniversityController::class, 'store']);
        Route::put('/universities/{id}', [UniversityController::class, 'update']);
        Route::delete('/universities/{id}', [UniversityController::class, 'destroy']);
        Route::post('/universities/{universityId}/faculties', [UniversityController::class, 'storeFaculty']);
        Route::put('/faculties/{id}', [UniversityController::class, 'updateFaculty']);
        Route::delete('/faculties/{id}', [UniversityController::class, 'destroyFaculty']);
        Route::post('/faculties/{facultyId}/departments', [UniversityController::class, 'storeDepartment']);
        Route::put('/departments/{id}', [UniversityController::class, 'updateDepartment']);
        Route::delete('/departments/{id}', [UniversityController::class, 'destroyDepartment']);
    });
});
