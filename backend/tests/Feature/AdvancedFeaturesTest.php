<?php

namespace Tests\Feature;

use App\Models\AcademicCourse;
use App\Models\AcademicSemester;
use App\Models\Achievement;
use App\Models\CampusLocation;
use App\Models\CampusPost;
use App\Models\CareerOpportunity;
use App\Models\ContentReport;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\LibraryItem;
use App\Models\LibraryLoan;
use App\Models\Organization;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserPrivacySetting;
use App\Models\UserRoleAssignment;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    use DatabaseTransactions;

    protected function createTestUser(string $name = 'User Test', ?string $roleSlug = null): User
    {
        $univ = University::first() ?? University::create([
            'name' => 'Politeknik Negeri Lhokseumawe',
            'code' => 'PNL',
            'status' => 'active',
        ]);

        $user = User::factory()->create([
            'name' => $name,
            'default_university_id' => $univ->id,
        ]);

        if ($roleSlug) {
            $role = Role::firstOrCreate(['slug' => $roleSlug], ['name' => ucfirst($roleSlug)]);
            UserRoleAssignment::create([
                'user_id' => $user->id,
                'role_id' => $role->id,
                'university_id' => $univ->id,
                'status' => 'active',
            ]);
        }

        return $user;
    }

    public function test_community_safety_report_and_moderation(): void
    {
        $reporter = $this->createTestUser('Reporter Alice');
        $violator = $this->createTestUser('Violator Bob');
        $admin = $this->createTestUser('Admin Charlie', 'campus_admin');

        $post = CampusPost::create([
            'user_id' => $violator->id,
            'content' => 'Promosi joki tugas akademik illegal #spam',
        ]);

        // Alice reports Bob's post
        $reportRes = $this->actingAs($reporter, 'sanctum')->postJson('/api/v1/reports', [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'category' => 'spam',
            'reason' => 'Mengandung promosi joki tugas ilegal',
        ]);

        $reportRes->assertStatus(201)
            ->assertJson(['success' => true]);

        $reportId = $reportRes->json('data.id');

        // Admin lists reports
        $listRes = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/moderation/reports');
        $listRes->assertStatus(200);

        // Admin resolves report by hiding content
        $resolveRes = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/moderation/reports/{$reportId}/resolve", [
            'status' => 'resolved',
            'action_taken' => 'hidden',
            'moderator_notes' => 'Konten disembunyikan karena melanggar pedoman integritas akademik.',
        ]);

        $resolveRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verify post is hidden in database
        $this->assertDatabaseHas('campus_posts', [
            'id' => $post->id,
            'is_hidden' => true,
        ]);
    }

    public function test_user_block_and_privacy_settings(): void
    {
        $userA = $this->createTestUser('User David');
        $userB = $this->createTestUser('User Edward');

        // David blocks Edward
        $blockRes = $this->actingAs($userA, 'sanctum')->postJson("/api/v1/users/{$userB->id}/block");
        $blockRes->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('user_blocks', [
            'blocker_id' => $userA->id,
            'blocked_id' => $userB->id,
        ]);

        // David updates privacy settings
        $privRes = $this->actingAs($userA, 'sanctum')->putJson('/api/v1/privacy/settings', [
            'profile_visibility' => 'campus',
            'dm_permission' => 'followers',
            'notify_follow' => true,
            'notify_message' => true,
            'notify_like' => false,
            'notify_comment' => true,
            'notify_event' => true,
        ]);

        $privRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'dm_permission' => 'followers',
                    'notify_like' => false,
                ],
            ]);

        // David unblocks Edward
        $unblockRes = $this->actingAs($userA, 'sanctum')->deleteJson("/api/v1/users/{$userB->id}/block");
        $unblockRes->assertStatus(200);

        $this->assertDatabaseMissing('user_blocks', [
            'blocker_id' => $userA->id,
            'blocked_id' => $userB->id,
        ]);
    }

    public function test_academic_progress_endpoint(): void
    {
        $student = $this->createTestUser('Student Felicia', 'student');

        $sem = AcademicSemester::create([
            'user_id' => $student->id,
            'university_id' => $student->default_university_id,
            'semester_name' => 'Semester 1 - Ganjil 2024',
            'semester_number' => 1,
            'gpa' => 3.85,
            'cumulative_gpa' => 3.85,
            'sks_taken' => 20,
            'sks_passed' => 20,
            'status' => 'completed',
        ]);

        AcademicCourse::create([
            'semester_id' => $sem->id,
            'user_id' => $student->id,
            'course_code' => 'TIF101',
            'course_name' => 'Pemrograman Web',
            'sks' => 3,
            'grade' => 'A',
            'grade_point' => 4.00,
            'attendance_percentage' => 96.5,
        ]);

        $res = $this->actingAs($student, 'sanctum')->getJson('/api/v1/academic-progress');

        $res->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'summary' => [
                        'cumulative_gpa' => 3.85,
                        'total_sks_taken' => 20,
                        'total_sks_passed' => 20,
                    ],
                ],
            ]);
    }

    public function test_campus_map_locations(): void
    {
        $admin = $this->createTestUser('Admin Gary', 'campus_admin');

        // Admin adds a campus map location
        $createRes = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/campus-map/locations', [
            'university_id' => $admin->default_university_id,
            'name' => 'Gedung Riset AI & Robotika',
            'category' => 'laboratory',
            'description' => 'Pusat riset otomasi dan kecerdasan artifisial terpadu.',
            'latitude' => 5.1234000,
            'longitude' => 97.1567000,
            'floor_count' => 3,
            'facilities_available' => ['WiFi 6', 'GPU Cluster', 'Lift'],
            'opening_hours' => '08:00 - 18:00',
        ]);

        $createRes->assertStatus(201)->assertJson(['success' => true]);
        $locId = $createRes->json('data.id');

        // Query map locations
        $listRes = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/campus-map/locations');
        $listRes->assertStatus(200)->assertJson(['success' => true]);

        // Delete location
        $delRes = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/campus-map/locations/{$locId}");
        $delRes->assertStatus(200);
    }

    public function test_career_center_and_application(): void
    {
        $admin = $this->createTestUser('Recruiter Hanna', 'campus_admin');
        $student = $this->createTestUser('Student Ian', 'student');

        // Admin posts career opportunity
        $oppRes = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/career/opportunities', [
            'company_name' => 'Tech Corp Nusantara',
            'title' => 'Software Engineer Intern',
            'category' => 'internship',
            'location' => 'Jakarta / Remote',
            'type' => 'hybrid',
            'description' => 'Magang pengembangan software web berbayar.',
            'deadline' => now()->addDays(30)->toDateString(),
        ]);

        $oppRes->assertStatus(201)->assertJson(['success' => true]);
        $oppId = $oppRes->json('data.id');

        // Student bookmarks opportunity
        $bmRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/career/opportunities/{$oppId}/bookmark");
        $bmRes->assertStatus(200)->assertJson(['is_bookmarked' => true]);

        // Student applies with CV
        $applyRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/career/opportunities/{$oppId}/apply", [
            'cv_url' => 'https://storage.campusconnect.id/cv/ian.pdf',
            'cover_letter' => 'Saya tertarik berkontribusi pada pengembangan frontend.',
        ]);

        $applyRes->assertStatus(201)->assertJson(['success' => true]);

        // Student checks my applications
        $myApps = $this->actingAs($student, 'sanctum')->getJson('/api/v1/career/my-applications');
        $myApps->assertStatus(200);
        $this->assertCount(1, $myApps->json('data'));
    }

    public function test_digital_library_borrow_and_return(): void
    {
        $student = $this->createTestUser('Student Julia', 'student');
        $admin = $this->createTestUser('Librarian Kevin', 'campus_admin');

        $item = LibraryItem::create([
            'university_id' => $admin->default_university_id,
            'title' => 'Struktur Data & Pemrograman Java',
            'author' => 'Dr. Indrawan',
            'category' => 'academic_book',
            'total_copies' => 3,
            'available_copies' => 3,
        ]);

        // Student borrows book
        $borrowRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/library/items/{$item->id}/borrow");
        $borrowRes->assertStatus(201)->assertJson(['success' => true]);

        $loanId = $borrowRes->json('data.id');

        // Verify available copies decreased to 2
        $this->assertEquals(2, $item->fresh()->available_copies);

        // Student returns book
        $returnRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/library/loans/{$loanId}/return");
        $returnRes->assertStatus(200)->assertJson(['success' => true]);

        // Verify available copies restored to 3
        $this->assertEquals(3, $item->fresh()->available_copies);
    }

    public function test_global_search(): void
    {
        $user = $this->createTestUser('Searcher Leo');

        $searchRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/search/global?q=Informatika');

        $searchRes->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_social_hub_saved_posts_and_edit(): void
    {
        $author = $this->createTestUser('Author Mia');

        $post = CampusPost::create([
            'user_id' => $author->id,
            'content' => 'Postingan orisinal pertama #info',
        ]);

        // Bookmark post
        $bmRes = $this->actingAs($author, 'sanctum')->postJson("/api/v1/feed/{$post->id}/bookmark");
        $bmRes->assertStatus(200)->assertJson(['is_saved' => true]);

        // Author edits post
        $editRes = $this->actingAs($author, 'sanctum')->putJson("/api/v1/feed/{$post->id}", [
            'content' => 'Postingan telah direvisi dengan informasi lengkap #info',
        ]);

        $editRes->assertStatus(200)->assertJson(['success' => true]);
        $this->assertEquals('Postingan telah direvisi dengan informasi lengkap #info', $post->fresh()->content);

        // Fetch trending
        $trendRes = $this->actingAs($author, 'sanctum')->getJson('/api/v1/feed-trending');
        $trendRes->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_event_waitlist_and_cancel(): void
    {
        $userA = $this->createTestUser('User Noah');
        $userB = $this->createTestUser('User Olivia');

        $event = Event::create([
            'university_id' => $userA->default_university_id,
            'created_by' => $userA->id,
            'title' => 'Workshop GenAI 2026',
            'slug' => 'workshop-genai-2026',
            'start_time' => now()->addDays(5),
            'end_time' => now()->addDays(5)->addHours(4),
            'max_participants' => 1,
            'current_participants' => 1,
            'status' => 'published',
        ]);

        EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $userA->id,
            'ticket_code' => 'TKT-NOAH1',
            'qr_token' => 'QR-TOKEN-NOAH',
            'status' => 'registered',
        ]);

        // Olivia joins waitlist because quota is full
        $waitRes = $this->actingAs($userB, 'sanctum')->postJson("/api/v1/events/{$event->id}/waitlist");
        $waitRes->assertStatus(201)->assertJson(['success' => true]);

        // Noah cancels his registration
        $cancelRes = $this->actingAs($userA, 'sanctum')->postJson("/api/v1/events/{$event->id}/cancel");
        $cancelRes->assertStatus(200)->assertJson(['success' => true]);

        // Olivia should be auto-promoted to registered
        $this->assertDatabaseHas('event_registrations', [
            'event_id' => $event->id,
            'user_id' => $userB->id,
            'status' => 'registered',
        ]);
    }

    public function test_organization_work_programs_and_finances(): void
    {
        $admin = $this->createTestUser('President Peter', 'ukm_admin');
        $org = Organization::create([
            'university_id' => $admin->default_university_id,
            'name' => 'UKM Robotika & AI',
            'slug' => 'ukm-robotika-ai',
            'type' => 'ukm',
            'category' => 'Technology',
            'status' => 'active',
        ]);

        // Add work program
        $progRes = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/organizations/{$org->id}/work-programs", [
            'name' => 'Kontes Robot Nasional 2026',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'budget' => 5000000,
            'status' => 'planned',
        ]);
        $progRes->assertStatus(201)->assertJson(['success' => true]);

        // Add finance record
        $finRes = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/organizations/{$org->id}/finances", [
            'title' => 'Dana Hibah Riset Kampus',
            'type' => 'income',
            'amount' => 7500000,
            'transaction_date' => now()->toDateString(),
            'category' => 'Hibah',
        ]);
        $finRes->assertStatus(201)->assertJson(['success' => true]);

        // List finances
        $listFin = $this->actingAs($admin, 'sanctum')->getJson("/api/v1/organizations/{$org->id}/finances");
        $listFin->assertStatus(200)
            ->assertJson([
                'success' => true,
                'summary' => [
                    'total_income' => 7500000,
                ],
            ]);
    }

    public function test_document_versioning(): void
    {
        $user = $this->createTestUser('Author Quinn');

        $doc = Document::create([
            'university_id' => $user->default_university_id,
            'user_id' => $user->id,
            'title' => 'Pedoman Akademik 2026',
            'file_name' => 'pedoman_v1.pdf',
            'file_path' => 'https://storage.campusconnect.id/docs/pedoman_v1.pdf',
            'file_size' => 1024000,
            'file_type' => 'pdf',
            'access_level' => 'campus',
        ]);

        // Upload new version v1.1
        $verRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/documents/{$doc->id}/versions", [
            'version_number' => 'v1.1',
            'file_path' => 'https://storage.campusconnect.id/docs/pedoman_v1_1.pdf',
            'file_size' => 1056000,
            'change_summary' => 'Penambahan bab aturan beasiswa dan pertukaran pelajar.',
        ]);

        $verRes->assertStatus(201)->assertJson(['success' => true]);

        // List versions
        $listRes = $this->actingAs($user, 'sanctum')->getJson("/api/v1/documents/{$doc->id}/versions");
        $listRes->assertStatus(200);
        $this->assertCount(2, $listRes->json('data')); // Original v1.0 (auto-archived) + new v1.1
    }

    public function test_achievement_submission_with_certificate_and_verification_workflow(): void
    {
        $student = $this->createTestUser('Student Champion', 'student');
        $deptAdmin = $this->createTestUser('Department Admin IT', 'department_admin');

        // Student submits competition award with certificate proof
        $submitRes = $this->actingAs($student, 'sanctum')->postJson('/api/v1/portfolio/achievement', [
            'title' => 'Juara 1 Hackathon IoT & Smart City Nasional 2026',
            'level' => 'national',
            'rank' => '1st Place Winner / Gold Medal',
            'organizer' => 'Puspresnas Kemdikbudristek',
            'year' => 2026,
            'certificate_url' => 'https://storage.campusconnect.id/certificates/juara1_hackathon.png',
            'description' => 'Membangun platform smart energy meter berbasis LoRaWAN & ESP32.',
        ]);

        $submitRes->assertStatus(201)->assertJson(['success' => true]);
        $achievementId = $submitRes->json('data.id');

        $achievement = Achievement::find($achievementId);
        $this->assertNotNull($achievement);
        $this->assertEquals('https://storage.campusconnect.id/certificates/juara1_hackathon.png', $achievement->certificate_url);
        $this->assertEquals('Puspresnas Kemdikbudristek', $achievement->organizer);
        $this->assertFalse($achievement->is_verified);

        // Department Admin verifies the achievement
        $verifyRes = $this->actingAs($deptAdmin, 'sanctum')->putJson("/api/v1/achievements/{$achievementId}/verify");
        $verifyRes->assertStatus(200)->assertJson(['success' => true]);

        $this->assertTrue($achievement->fresh()->is_verified);
        $this->assertEquals($deptAdmin->id, $achievement->fresh()->verified_by);
        $this->assertNotNull($achievement->fresh()->verified_at);

        // Admin rejects/reverts with reason
        $rejectRes = $this->actingAs($deptAdmin, 'sanctum')->putJson("/api/v1/achievements/{$achievementId}/reject", [
            'rejection_reason' => 'Perlu revisi nomor registrasi sertifikat resmi.',
        ]);
        $rejectRes->assertStatus(200)->assertJson(['success' => true]);

        $this->assertFalse($achievement->fresh()->is_verified);
        $this->assertEquals('Perlu revisi nomor registrasi sertifikat resmi.', $achievement->fresh()->rejection_reason);
    }
}

