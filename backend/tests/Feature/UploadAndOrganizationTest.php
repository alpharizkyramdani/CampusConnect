<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UploadAndOrganizationTest extends TestCase
{
    use DatabaseTransactions;

    protected function getTestUser(): User
    {
        $user = User::factory()->create();
        $univ = University::first() ?? University::create([
            'name' => 'Test University',
            'code' => 'TESTU',
            'status' => 'active',
        ]);
        $role = Role::firstOrCreate(['slug' => 'campus_admin'], ['name' => 'Campus Admin', 'description' => 'Test admin']);
        UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'university_id' => $univ->id,
            'status' => 'active',
        ]);
        return $user;
    }

    public function test_image_upload_endpoint(): void
    {
        Storage::fake('public');
        $user = $this->getTestUser();

        $file = UploadedFile::fake()->image('test_logo.png', 200, 200);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertNotNull($response->json('url'));
        $this->assertNotNull($response->json('path'));
        Storage::disk('public')->assertExists($response->json('path'));
    }

    public function test_organization_update_and_logo(): void
    {
        $user = $this->getTestUser();
        $univ = University::first();

        $org = Organization::create([
            'university_id' => $univ->id,
            'name' => 'HIMA Test Elektro',
            'slug' => 'hima-test-elektro',
            'type' => 'hima',
            'category' => 'Engineering',
            'description' => 'Test HIMA description',
            'status' => 'active',
            'recruitment_open' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/organizations/{$org->id}", [
            'name' => 'HIMA Elektro PNL Updated',
            'logo' => 'https://example.com/logo-hima.png',
            'description' => 'Updated description with logo',
            'recruitment_open' => false,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'HIMA Elektro PNL Updated',
                    'logo' => 'https://example.com/logo-hima.png',
                    'recruitment_open' => false,
                ],
            ]);

        $this->assertDatabaseHas('organizations', [
            'id' => $org->id,
            'name' => 'HIMA Elektro PNL Updated',
            'logo' => 'https://example.com/logo-hima.png',
        ]);
    }
}

