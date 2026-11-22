<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\LecturerProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Tests\TestCase;

class PnlRegistrationRulesTest extends TestCase
{
    public function test_student_nim_must_be_13_digits(): void
    {
        $response = $this->postJson('/api/v1/auth/register-student', [
            'name' => 'Test Student',
            'email' => 'shortnim@student.pnl.ac.id',
            'password' => 'password123',
            'nim' => '202557301', // only 9 digits
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('13 digit', $response->json('message'));
    }

    public function test_student_nim_rejects_unregistered_prodi_code(): void
    {
        $response = $this->postJson('/api/v1/auth/register-student', [
            'name' => 'Test Student',
            'email' => 'fakecode@student.pnl.ac.id',
            'password' => 'password123',
            'nim' => '2025999990001', // 99999 is invalid prodi
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('99999', $response->json('message'));
    }

    public function test_student_nim_accepts_valid_13_digits_and_auto_assigns_prodi(): void
    {
        // Cleanup if existing
        User::where('email', 'cutmutia_test@student.pnl.ac.id')->delete();
        StudentProfile::where('nim', '2025573010078')->delete();

        $response = $this->postJson('/api/v1/auth/register-student', [
            'name' => 'Cut Mutia',
            'email' => 'cutmutia_test@student.pnl.ac.id',
            'password' => 'password123',
            'nim' => '2025573010078', // 2025 + 57301 (D4 TI) + 0078
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.detected_program', 'D4 Teknik Informatika');
        $response->assertJsonPath('data.enrollment_year', 2025);

        // Cleanup
        User::where('email', 'cutmutia_test@student.pnl.ac.id')->delete();
    }

    public function test_lecturer_nip_rejects_gender_mismatch(): void
    {
        $dept = Department::where('university_id', 5)->first();

        // Male with digit 15 = 2 (Female)
        $response = $this->postJson('/api/v1/auth/register-lecturer', [
            'name' => 'Dr. Teuku Umar',
            'email' => 'teukuumar@pnl.ac.id',
            'password' => 'password123',
            'nip' => '198001012005012001', // digit 15 is 2
            'gender' => 'L',
            'department_id' => $dept->id,
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Laki-laki', $response->json('message'));
    }

    public function test_lecturer_nip_accepts_valid_data(): void
    {
        User::where('email', 'teuku_valid@pnl.ac.id')->delete();
        LecturerProfile::where('nip', '198001012005011001')->delete();

        $dept = Department::where('university_id', 5)->first();

        // Male with digit 15 = 1 (Male)
        $response = $this->postJson('/api/v1/auth/register-lecturer', [
            'name' => 'Dr. Teuku Valid',
            'email' => 'teuku_valid@pnl.ac.id',
            'password' => 'password123',
            'nip' => '198001012005011001', // digit 15 is 1
            'gender' => 'L',
            'department_id' => $dept->id,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        // Cleanup
        User::where('email', 'teuku_valid@pnl.ac.id')->delete();
    }
}

