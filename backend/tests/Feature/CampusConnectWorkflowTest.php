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
        
        // Find or create an open event
        $event = Event::first();
        $existing = EventRegistration::where('event_id', $event->id)->where('user_id', $student->id)->first();
        
        if ($existing) {
            $ticketCode = $existing->ticket_code;
            // Reset status to registered if previously attended
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
}
