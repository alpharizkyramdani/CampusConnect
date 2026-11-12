<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\University;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\Certificate;
use App\Models\MaintenanceReport;
use App\Models\LostFoundItem;
use App\Models\ServiceType;
use App\Models\ServiceRequest;
use App\Models\Role;
use App\Models\DiscussionCategory;
use App\Models\DiscussionPost;
use Illuminate\Support\Facades\Hash;

class CampusConnectWorkflowTest extends TestCase
{
    public function test_auth_login_returns_token_and_roles()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'student.alex@uir.ac.id',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonStructure([
                     'data' => [
                         'user' => ['id', 'name', 'email'],
                         'token',
                         'role_assignments',
                         'active_role',
                     ]
                 ]);
    }

    public function test_unauthenticated_requests_are_rejected()
    {
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401);
    }

    public function test_public_universities_listing()
    {
        $response = $this->getJson('/api/v1/universities');
        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_equipment_borrowing_lifecycle()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();
        $facility = Facility::first();

        // 1. Student requests borrow with required fields
        $requestResponse = $this->actingAs($student)->postJson('/api/v1/borrowings', [
            'facility_id' => $facility->id,
            'quantity' => 1,
            'purpose' => 'Automated test research project',
            'borrow_date' => now()->addDay()->format('Y-m-d'),
            'return_due_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $requestResponse->assertStatus(201);
        $borrowingId = $requestResponse->json('data.id');

        // 2. Department Admin approves
        $deptAdmin = User::where('email', 'dept.ti@uir.ac.id')->first();
        $approveResponse = $this->actingAs($deptAdmin)->postJson("/api/v1/borrowings/{$borrowingId}/approve", [
            'admin_notes' => 'Approved for research testing'
        ]);
        $approveResponse->assertStatus(200);

        // 3. Record Pickup
        $pickupResponse = $this->actingAs($deptAdmin)->postJson("/api/v1/borrowings/{$borrowingId}/pickup");
        $pickupResponse->assertStatus(200);

        // 4. Record Return with return_condition
        $returnResponse = $this->actingAs($deptAdmin)->postJson("/api/v1/borrowings/{$borrowingId}/return", [
            'return_condition' => 'good',
            'admin_notes' => 'Returned safely without damage'
        ]);
        $returnResponse->assertStatus(200);

        $borrowing = FacilityBorrowing::find($borrowingId);
        $this->assertEquals('returned', $borrowing->status);
    }

    public function test_event_registration_and_qr_attendance()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();
        
        $event = Event::first();
        if (!$event) {
            $cat = \App\Models\EventCategory::firstOrCreate(['name' => 'Academic Seminar', 'slug' => 'academic-seminar']);
            $event = Event::create([
                'university_id' => 1,
                'category_id' => $cat->id,
                'created_by' => $student->id,
                'title' => 'National AI Summit 2026',
                'slug' => 'national-ai-summit-2026-' . rand(100, 999),
                'start_time' => now()->addDays(5),
                'end_time' => now()->addDays(6),
                'location' => 'Main Auditorium',
                'quota' => 200,
                'registered_count' => 0,
                'status' => 'published',
            ]);
        }

        $existing = EventRegistration::where('event_id', $event->id)->where('user_id', $student->id)->first();
        
        if ($existing) {
            $ticketCode = $existing->ticket_code;
            $existing->update(['status' => 'registered', 'checked_in_at' => null]);
        } else {
            $regResponse = $this->actingAs($student)->postJson("/api/v1/events/{$event->id}/register");
            $this->assertEquals(201, $regResponse->status());
            $ticketCode = $regResponse->json('data.ticket_code');
        }

        $this->assertNotEmpty($ticketCode);

        // 2. Campus Admin verifies ticket via QR Scanner endpoint using 'token' parameter
        $admin = User::where('email', 'admin.uir@campusconnect.id')->first();
        $scannerResponse = $this->actingAs($admin)->postJson('/api/v1/events/verify-ticket', [
            'token' => $ticketCode,
        ]);

        $scannerResponse->assertStatus(200)
                        ->assertJsonPath('success', true);

        // 3. Duplicate scan prevention test: status 409
        $dupResponse = $this->actingAs($admin)->postJson('/api/v1/events/verify-ticket', [
            'token' => $ticketCode,
        ]);

        $dupResponse->assertStatus(409)
                    ->assertJsonPath('success', false);
    }

    public function test_certificate_public_verification()
    {
        $cert = Certificate::first();
        if (!$cert) {
            $student = User::where('email', 'student.alex@uir.ac.id')->first();
            $cert = Certificate::create([
                'university_id' => 1,
                'user_id' => $student->id,
                'title' => 'Certificate of Achievement',
                'certificate_number' => 'CERT-UIR-2026-' . rand(1000, 9999),
                'verify_hash' => \Illuminate\Support\Str::random(32),
                'recipient_name' => $student->name,
                'issue_date' => now()->format('Y-m-d'),
                'issuer_name' => 'CampusConnect Academic Board',
                'issued_at' => now(),
            ]);
        }

        // 1. Valid verification by verify_hash
        $response = $this->getJson("/api/v1/certificates/verify/{$cert->verify_hash}");
        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonPath('data.certificate_number', $cert->certificate_number);

        // 2. Valid verification by certificate_number
        $responseByNumber = $this->getJson("/api/v1/certificates/verify/{$cert->certificate_number}");
        $responseByNumber->assertStatus(200)
                         ->assertJsonPath('success', true)
                         ->assertJsonPath('data.recipient_name', $cert->recipient_name);

        // 3. Invalid hash verification
        $invalidResponse = $this->getJson('/api/v1/certificates/verify/NON_EXISTENT_CERT_HASH');
        $invalidResponse->assertStatus(404)
                        ->assertJsonPath('success', false);
    }

    public function test_multi_tenant_isolation_uir_and_itn()
    {
        // UIR student queries facilities scoped to UIR
        $uirStudent = User::where('email', 'student.alex@uir.ac.id')->first();
        $uirFacilitiesResponse = $this->actingAs($uirStudent)->getJson('/api/v1/facilities');
        $uirFacilitiesResponse->assertStatus(200);

        foreach ($uirFacilitiesResponse->json('data.data') as $item) {
            $this->assertEquals(1, $item['university_id'], 'Facility must be scoped to UIR (university_id = 1)');
        }

        // ITN student queries facilities scoped to ITN
        $itnStudent = User::where('email', 'student.budi@itn.ac.id')->first();
        $itnFacilitiesResponse = $this->actingAs($itnStudent)->getJson('/api/v1/facilities');
        $itnFacilitiesResponse->assertStatus(200);

        foreach ($itnFacilitiesResponse->json('data.data') as $item) {
            $this->assertEquals(2, $item['university_id'], 'Facility must be scoped to ITN (university_id = 2)');
        }
    }

    public function test_user_profile_and_password_update()
    {
        $user = User::where('email', 'student.alex@uir.ac.id')->first();

        // 1. Update profile
        $profileResponse = $this->actingAs($user)->putJson('/api/v1/auth/profile', [
            'name' => 'Alex Chandra S.Kom Candidate',
            'phone' => '+628123456789',
        ]);
        $profileResponse->assertStatus(200)
                        ->assertJsonPath('success', true);

        // 2. Update password with invalid current password -> error 422
        $badPassResponse = $this->actingAs($user)->putJson('/api/v1/auth/password', [
            'current_password' => 'wrong_password',
            'new_password' => 'new_secret_123',
        ]);
        $badPassResponse->assertStatus(422);

        // 3. Update password with valid current password -> success 200
        $goodPassResponse = $this->actingAs($user)->putJson('/api/v1/auth/password', [
            'current_password' => 'password',
            'new_password' => 'new_secret_123',
        ]);
        $goodPassResponse->assertStatus(200);

        // Restore password to 'password' for demo convenience
        $user->update(['password' => Hash::make('password')]);
    }

    public function test_reset_password_endpoint()
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'student.budi@itn.ac.id',
            'new_password' => 'new_password_reset',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        // Restore password for demo convenience
        User::where('email', 'student.budi@itn.ac.id')->update(['password' => Hash::make('password')]);
    }

    public function test_facility_maintenance_report_lifecycle()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();

        // 1. Submit damage report
        $createResponse = $this->actingAs($student)->postJson('/api/v1/maintenance', [
            'university_id' => 1,
            'title' => 'Projector Lens Glitch in Room 304',
            'location' => 'Building C, Room 304',
            'category' => 'it_equipment',
            'priority' => 'medium',
            'description' => 'Display exhibits pink discoloration during presentation.',
        ]);
        $createResponse->assertStatus(201);
        $reportId = $createResponse->json('data.id');

        // 2. Campus Admin updates status to resolved
        $admin = User::where('email', 'admin.uir@campusconnect.id')->first();
        $statusResponse = $this->actingAs($admin)->putJson("/api/v1/maintenance/{$reportId}/status", [
            'status' => 'resolved',
            'admin_notes' => 'Lens cable replaced by technician.',
        ]);
        $statusResponse->assertStatus(200)
                       ->assertJsonPath('data.status', 'resolved');
    }

    public function test_student_service_request_lifecycle()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();
        $serviceType = ServiceType::first();

        // 1. Submit service request
        $requestResponse = $this->actingAs($student)->postJson('/api/v1/service-requests', [
            'service_type_id' => $serviceType->id,
            'notes' => 'Required for internship application at tech company.',
        ]);
        $requestResponse->assertStatus(201);
        $reqId = $requestResponse->json('data.id');

        // 2. Campus Admin marks processing and completed
        $admin = User::where('email', 'admin.uir@campusconnect.id')->first();
        $updateResponse = $this->actingAs($admin)->putJson("/api/v1/service-requests/{$reqId}/status", [
            'status' => 'completed',
            'admin_notes' => 'Official letter signed and ready for digital download.',
        ]);
        $updateResponse->assertStatus(200)
                       ->assertJsonPath('data.status', 'completed');
    }

    public function test_discussion_forum_thread()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();
        $cat = DiscussionCategory::first();

        // 1. Create discussion post
        $postResponse = $this->actingAs($student)->postJson('/api/v1/discussions', [
            'category_id' => $cat->id,
            'title' => 'Tips for National Robotics Competition 2026',
            'content' => 'Anyone interested in forming a cross-disciplinary team for the upcoming contest?',
        ]);
        $postResponse->assertStatus(201);
        $postId = $postResponse->json('data.id');

        // 2. Comment on discussion
        $commentResponse = $this->actingAs($student)->postJson("/api/v1/discussions/{$postId}/comments", [
            'content' => 'I can contribute on the computer vision and ROS subsystem!',
        ]);
        $commentResponse->assertStatus(201);
    }

    public function test_portfolio_activity_and_achievement()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();

        // 1. Record extracurricular activity
        $actResponse = $this->actingAs($student)->postJson('/api/v1/portfolio/activity', [
            'title' => 'National Hackathon Project Lead',
            'activity_type' => 'competition',
            'role' => 'Team Captain',
            'organizer' => 'Higher Education Innovation Council',
            'start_date' => now()->subMonths(2)->format('Y-m-d'),
            'end_date' => now()->subMonths(1)->format('Y-m-d'),
            'description' => 'Architected an automated student disaster relief coordination system.',
        ]);
        $actResponse->assertStatus(201);

        // 2. Record achievement
        $achResponse = $this->actingAs($student)->postJson('/api/v1/portfolio/achievement', [
            'title' => '1st Place Winner National AI Challenge',
            'level' => 'national',
            'rank' => '1st Place',
            'year' => 2025,
            'description' => 'Awarded gold trophy in autonomous robotic vision track.',
        ]);
        $achResponse->assertStatus(201);

        // 3. Fetch comprehensive portfolio
        $portfolioResponse = $this->actingAs($student)->getJson('/api/v1/portfolio');
        $portfolioResponse->assertStatus(200)
                          ->assertJsonPath('success', true);
    }

    public function test_campus_announcement_crud()
    {
        $admin = User::where('email', 'admin.uir@campusconnect.id')->first();

        // 1. Create announcement
        $createResponse = $this->actingAs($admin)->postJson('/api/v1/announcements', [
            'category_id' => 1,
            'title' => 'Important Semester Exam Rules 2026',
            'content' => 'All students must bring their validated student identity card (KTM).',
            'priority' => 'high',
            'target_audience' => 'students',
        ]);
        $createResponse->assertStatus(201);
        $announcementId = $createResponse->json('data.id');

        // 2. Fetch announcements list
        $listResponse = $this->getJson('/api/v1/announcements');
        $listResponse->assertStatus(200);

        // 3. Delete announcement
        $deleteResponse = $this->actingAs($admin)->deleteJson("/api/v1/announcements/{$announcementId}");
        $deleteResponse->assertStatus(200);
    }

    public function test_lost_and_found_posting_and_claim()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();

        // 1. Post found item
        $postResponse = $this->actingAs($student)->postJson('/api/v1/lost-found', [
            'university_id' => 1,
            'title' => 'Blue Scientific Calculator Casio fx-991EX',
            'type' => 'found',
            'category' => 'electronics',
            'location' => 'Informatics Lab 2 desk B4',
            'event_date' => now()->format('Y-m-d'),
            'description' => 'Calculator left behind after calculus practical session.',
        ]);
        $postResponse->assertStatus(201);
        $itemId = $postResponse->json('data.id');

        // 2. Another user submits claim
        $otherStudent = User::where('email', 'student.budi@itn.ac.id')->first();
        $claimResponse = $this->actingAs($otherStudent)->postJson("/api/v1/lost-found/{$itemId}/claim", [
            'proof_description' => 'Has my initials A.C. scratched with a marker on the rear battery lid.',
            'contact_info' => '+6281987654321',
        ]);
        $claimResponse->assertStatus(201);
    }

    public function test_document_repository_download_counter()
    {
        $student = User::where('email', 'student.alex@uir.ac.id')->first();

        // 1. List documents
        $listRes = $this->actingAs($student)->getJson('/api/v1/documents');
        $listRes->assertStatus(200);

        $docs = $listRes->json('data.data');
        if (!empty($docs)) {
            $docId = $docs[0]['id'];
            $initialCount = $docs[0]['download_count'];

            // 2. Trigger download
            $downRes = $this->actingAs($student)->getJson("/api/v1/documents/{$docId}/download");
            $downRes->assertStatus(200);
            $this->assertEquals($initialCount + 1, $downRes->json('data.download_count'));
        }
    }

    public function test_super_admin_university_registration_approval()
    {
        $rand = rand(1000, 9999);
        // 1. Submit university request
        $reqResponse = $this->postJson('/api/v1/auth/register-university', [
            'university_name' => "Universitas Sains Terbuka {$rand}",
            'email' => "contact_{$rand}@ust.ac.id",
            'website' => "https://ust{$rand}.ac.id",
            'address' => 'Jl. Pendidikan Nasional No. 10',
            'contact_person' => 'Prof. Dr. Hendriawan',
            'contact_phone' => '+62811223344',
        ]);
        $reqResponse->assertStatus(201);
        $reqId = $reqResponse->json('data.id');

        // 2. Super Admin approves request
        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $approveResponse = $this->actingAs($superAdmin)->postJson("/api/v1/university-requests/{$reqId}/approve");
        $approveResponse->assertStatus(200)
                        ->assertJsonPath('success', true);
    }

    public function test_super_admin_can_delete_university()
    {
        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $rand = rand(1000, 9999);
        $univ = University::create([
            'name' => "Campus to Delete {$rand}",
            'slug' => "campus-delete-{$rand}",
            'code' => "DEL{$rand}",
            'email' => "del_{$rand}@test.com",
            'address' => 'Jl. Test Delete No. 1',
            'status' => 'active',
        ]);

        $deleteResponse = $this->actingAs($superAdmin)->deleteJson("/api/v1/universities/{$univ->id}");
        $deleteResponse->assertStatus(200)
                       ->assertJsonPath('success', true);

        $this->assertSoftDeleted('universities', ['id' => $univ->id]);
    }

    public function test_admin_can_assign_and_revoke_user_role()
    {
        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $student = User::where('email', 'student.alex@uir.ac.id')->first();
        $role = \App\Models\Role::where('slug', 'department_admin')->first();

        // 1. Assign role
        $assignResponse = $this->actingAs($superAdmin)->postJson("/api/v1/users/{$student->id}/assign-role", [
            'role_id' => $role->id,
            'university_id' => 1,
        ]);
        $assignResponse->assertStatus(201);
        $assignmentId = $assignResponse->json('data.id');

        // 2. Revoke role
        $revokeResponse = $this->actingAs($superAdmin)->deleteJson("/api/v1/users/{$student->id}/roles/{$assignmentId}");
        $revokeResponse->assertStatus(200)
                       ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('user_role_assignments', ['id' => $assignmentId]);
    }

    public function test_faculty_and_department_crud_lifecycle()
    {
        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $rand = rand(100, 999);

        // 1. Create Faculty / Jurusan
        $facCreate = $this->actingAs($superAdmin)->postJson('/api/v1/universities/1/faculties', [
            'name' => "Jurusan Teknik Elektro {$rand}",
            'code' => "JTE{$rand}",
            'description' => 'Jurusan Rekayasa Kelistrikan & Komputasi',
        ]);
        $facCreate->assertStatus(201);
        $facId = $facCreate->json('data.id');

        // 2. Update Faculty / Jurusan
        $facUpdate = $this->actingAs($superAdmin)->putJson("/api/v1/faculties/{$facId}", [
            'name' => "Jurusan Teknik Elektro & Informatika {$rand}",
            'code' => "JTEI{$rand}",
            'description' => 'Jurusan Terpadu Elektro & Informatika',
        ]);
        $facUpdate->assertStatus(200)
                  ->assertJsonPath('data.code', "JTEI{$rand}");

        // 3. Create Department / Prodi
        $deptCreate = $this->actingAs($superAdmin)->postJson("/api/v1/faculties/{$facId}/departments", [
            'name' => "Prodi Teknologi Rekayasa Komputer {$rand}",
            'code' => "TRK{$rand}",
            'description' => 'Program Sarjana Terapan',
        ]);
        $deptCreate->assertStatus(201);
        $deptId = $deptCreate->json('data.id');

        // 4. Update Department / Prodi
        $deptUpdate = $this->actingAs($superAdmin)->putJson("/api/v1/departments/{$deptId}", [
            'name' => "Prodi Rekayasa Perangkat Lunak {$rand}",
            'code' => "RPL{$rand}",
            'description' => 'Program Vokasi Unggulan',
        ]);
        $deptUpdate->assertStatus(200)
                   ->assertJsonPath('data.code', "RPL{$rand}");

        // 5. Delete Department / Prodi
        $deptDelete = $this->actingAs($superAdmin)->deleteJson("/api/v1/departments/{$deptId}");
        $deptDelete->assertStatus(200);
        $this->assertDatabaseMissing('departments', ['id' => $deptId]);

        // 6. Delete Faculty / Jurusan
        $facDelete = $this->actingAs($superAdmin)->deleteJson("/api/v1/faculties/{$facId}");
        $facDelete->assertStatus(200);
        $this->assertDatabaseMissing('faculties', ['id' => $facId]);
    }

    public function test_user_account_deletion_and_graceful_role_revocation()
    {
        $superAdmin = User::where('email', 'superadmin@campusconnect.id')->first();
        $univ = University::first();
        $role = Role::where('slug', 'student')->first();
        $rand = rand(1000, 9999);

        // 1. Create a user
        $createRes = $this->actingAs($superAdmin)->postJson('/api/v1/users', [
            'name' => "Temporary Test User {$rand}",
            'email' => "tempuser{$rand}@example.com",
            'password' => 'Password123!',
            'role_id' => $role->id,
            'university_id' => $univ->id,
        ]);
        $createRes->assertStatus(201);
        $userId = $createRes->json('data.id');
        $assignmentId = $createRes->json('data.role_assignments.0.id');

        // 2. Revoke role once
        $revoke1 = $this->actingAs($superAdmin)->deleteJson("/api/v1/users/{$userId}/roles/{$assignmentId}");
        $revoke1->assertStatus(200)
                ->assertJsonPath('success', true);

        // 3. Double revoke (should be handled gracefully, no ModelNotFoundException!)
        $revoke2 = $this->actingAs($superAdmin)->deleteJson("/api/v1/users/{$userId}/roles/{$assignmentId}");
        $revoke2->assertStatus(200)
                ->assertJsonPath('success', true);

        // 4. Super Admin deletes user account
        $deleteRes = $this->actingAs($superAdmin)->deleteJson("/api/v1/users/{$userId}");
        $deleteRes->assertStatus(200)
                  ->assertJsonPath('success', true);
        $this->assertDatabaseMissing('users', ['id' => $userId]);

        // 5. Attempting to delete own account is rejected
        $selfDelete = $this->actingAs($superAdmin)->deleteJson("/api/v1/users/{$superAdmin->id}");
        $selfDelete->assertStatus(400);
    }
}
