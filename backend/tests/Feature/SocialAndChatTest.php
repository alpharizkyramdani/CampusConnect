<?php

namespace Tests\Feature;

use App\Models\CampusPost;
use App\Models\DirectMessage;
use App\Models\University;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SocialAndChatTest extends TestCase
{
    use DatabaseTransactions;

    protected function createTestUser(string $name = 'User Test'): User
    {
        $univ = University::first() ?? University::create([
            'name' => 'Politeknik Negeri Lhokseumawe',
            'code' => 'PNL',
            'status' => 'active',
        ]);

        return User::factory()->create([
            'name' => $name,
            'default_university_id' => $univ->id,
        ]);
    }

    public function test_campus_feed_crud_and_interactions(): void
    {
        $userA = $this->createTestUser('Alice');
        $userB = $this->createTestUser('Bob');

        // Alice creates a campus post (tweet)
        $response = $this->actingAs($userA, 'sanctum')->postJson('/api/v1/feed', [
            'content' => 'Halo semuanya! Ada info jadwal kuliah pengganti kalkulus? #InfoKuliah',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'content' => 'Halo semuanya! Ada info jadwal kuliah pengganti kalkulus? #InfoKuliah',
                ],
            ]);

        $postId = $response->json('data.id');

        // Bob likes Alice's post
        $likeRes = $this->actingAs($userB, 'sanctum')->postJson("/api/v1/feed/{$postId}/like");
        $likeRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_liked' => true,
                'likes_count' => 1,
            ]);

        // Bob comments on Alice's post
        $commentRes = $this->actingAs($userB, 'sanctum')->postJson("/api/v1/feed/{$postId}/comments", [
            'content' => 'Hari Jumat jam 9 pagi di Gedung Utama!',
        ]);
        $commentRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'comments_count' => 1,
            ]);

        // Bob reposts Alice's post
        $repostRes = $this->actingAs($userB, 'sanctum')->postJson("/api/v1/feed/{$postId}/repost");
        $repostRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_reposted' => true,
                'reposts_count' => 1,
            ]);

        // Feed list should return posts with like and repost flags
        $feedRes = $this->actingAs($userB, 'sanctum')->getJson('/api/v1/feed?feed_type=for_you');
        $feedRes->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_social_following_system(): void
    {
        $userA = $this->createTestUser('Charlie');
        $userB = $this->createTestUser('Diana');

        // Charlie follows Diana
        $followRes = $this->actingAs($userA, 'sanctum')->postJson("/api/v1/users/{$userB->id}/follow");
        $followRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_following' => true,
                'followers_count' => 1,
            ]);

        // Check that Diana received a follow notification
        $dianaNotif = $userB->notifications()->first();
        $this->assertNotNull($dianaNotif);
        $this->assertEquals('follow', $dianaNotif->data['type']);
        $this->assertEquals($userA->id, $dianaNotif->data['sender_id']);

        // Check follow status
        $statusRes = $this->actingAs($userA, 'sanctum')->getJson("/api/v1/users/{$userB->id}/follow-status");
        $statusRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_following' => true,
                    'followers_count' => 1,
                    'following_count' => 0,
                ],
            ]);

        // Charlie unfollows Diana
        $unfollowRes = $this->actingAs($userA, 'sanctum')->postJson("/api/v1/users/{$userB->id}/follow");
        $unfollowRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'is_following' => false,
                'followers_count' => 0,
            ]);
    }

    public function test_direct_messaging_chat(): void
    {
        $userA = $this->createTestUser('Evan');
        $userB = $this->createTestUser('Fiona');

        // Evan sends a DM to Fiona
        $sendRes = $this->actingAs($userA, 'sanctum')->postJson("/api/v1/chat/messages/{$userB->id}", [
            'message' => 'Hai Fiona, besok jadi ketemuan bahas proyek akhir?',
        ]);

        $sendRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'message' => 'Hai Fiona, besok jadi ketemuan bahas proyek akhir?',
                    'is_read' => false,
                ],
            ]);

        // Fiona checks unread count
        $unreadRes = $this->actingAs($userB, 'sanctum')->getJson('/api/v1/chat/unread-count');
        $unreadRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'unread_count' => 1,
            ]);

        // Fiona lists conversations
        $convRes = $this->actingAs($userB, 'sanctum')->getJson('/api/v1/chat/conversations');
        $convRes->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertCount(1, $convRes->json('data'));

        // Fiona opens messages from Evan (which marks them read)
        $messagesRes = $this->actingAs($userB, 'sanctum')->getJson("/api/v1/chat/messages/{$userA->id}");
        $messagesRes->assertStatus(200);
        $this->assertCount(1, $messagesRes->json('data'));

        // Check unread count is now 0
        $unreadAfter = $this->actingAs($userB, 'sanctum')->getJson('/api/v1/chat/unread-count');
        $this->assertEquals(0, $unreadAfter->json('unread_count'));
    }

    public function test_super_admin_is_protected_from_follow_and_casual_dm(): void
    {
        $student = $this->createTestUser('Student George');
        $adminRole = \App\Models\Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Administrator']);
        $adminUser = $this->createTestUser('Root Admin');
        
        \App\Models\UserRoleAssignment::create([
            'user_id' => $adminUser->id,
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);

        // Student tries to follow super_admin -> Expect 403 Forbidden
        $followRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/users/{$adminUser->id}/follow");
        $followRes->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // Student tries to direct message super_admin -> Expect 403 Forbidden
        $dmRes = $this->actingAs($student, 'sanctum')->postJson("/api/v1/chat/messages/{$adminUser->id}", [
            'message' => 'Halo min, iseng chat aja nih',
        ]);
        $dmRes->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // Follow suggestions should NOT include super_admin
        $suggRes = $this->actingAs($student, 'sanctum')->getJson('/api/v1/users-suggestions');
        $suggRes->assertStatus(200);
        $suggestedIds = collect($suggRes->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($adminUser->id, $suggestedIds);
    }

    public function test_user_can_remove_follower_from_their_profile(): void
    {
        $userMe = $this->createTestUser('Myself');
        $userFollower = $this->createTestUser('Follower Person');

        // Follower Person follows Myself
        UserFollow::create([
            'user_id' => $userMe->id,
            'follower_id' => $userFollower->id,
        ]);

        $this->assertDatabaseHas('user_follows', [
            'user_id' => $userMe->id,
            'follower_id' => $userFollower->id,
        ]);

        // Myself removes Follower Person from my followers
        $removeRes = $this->actingAs($userMe, 'sanctum')->deleteJson("/api/v1/users/followers/{$userFollower->id}");

        $removeRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'followers_count' => 0,
            ]);

        $this->assertDatabaseMissing('user_follows', [
            'user_id' => $userMe->id,
            'follower_id' => $userFollower->id,
        ]);
    }
}

