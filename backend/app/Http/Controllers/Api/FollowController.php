<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserFollow;
use App\Notifications\SocialNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggleFollow(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($targetUserId);

        if ($currentUser->id === $targetUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself.',
            ], 400);
        }

        // Governance Security: Super Admin cannot be followed publicly
        if ($targetUser->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Administrator Platform diproteksi untuk keamanan tata kelola sistem dan tidak dapat diikuti secara publik.',
            ], 403);
        }

        $existing = UserFollow::where('user_id', $targetUser->id)
            ->where('follower_id', $currentUser->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFollowing = false;
            $message = "You unfollowed {$targetUser->name}.";
        } else {
            UserFollow::create([
                'user_id' => $targetUser->id,
                'follower_id' => $currentUser->id,
            ]);
            $isFollowing = true;
            $message = "You are now following {$targetUser->name}!";

            // Send notification to target user
            $targetUser->notify(new SocialNotification(
                type: 'follow',
                title: 'Pengikut Baru',
                message: "{$currentUser->name} mulai mengikuti Anda.",
                extraData: [
                    'sender_id' => $currentUser->id,
                    'sender_name' => $currentUser->name,
                    'sender_avatar' => $currentUser->avatar,
                    'action_url' => "/profile/{$currentUser->id}",
                ]
            ));
        }

        $followersCount = UserFollow::where('user_id', $targetUser->id)->count();
        $followingCount = UserFollow::where('follower_id', $targetUser->id)->count();

        return response()->json([
            'success' => true,
            'message' => $message,
            'is_following' => $isFollowing,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
        ]);
    }

    public function status(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();
        $targetUser = User::findOrFail($targetUserId);

        $isFollowing = false;
        if ($currentUser) {
            $isFollowing = UserFollow::where('user_id', $targetUser->id)
                ->where('follower_id', $currentUser->id)
                ->exists();
        }

        $followersCount = UserFollow::where('user_id', $targetUser->id)->count();
        $followingCount = UserFollow::where('follower_id', $targetUser->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $targetUser->id,
                'is_following' => $isFollowing,
                'followers_count' => $followersCount,
                'following_count' => $followingCount,
            ],
        ]);
    }

    public function followers($userId): JsonResponse
    {
        $targetUser = User::findOrFail($userId);
        $followers = UserFollow::where('user_id', $targetUser->id)
            ->with(['follower:id,name,email,avatar', 'follower.studentProfile.department'])
            ->latest()
            ->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $followers,
        ]);
    }

    public function following($userId): JsonResponse
    {
        $targetUser = User::findOrFail($userId);
        $following = UserFollow::where('follower_id', $targetUser->id)
            ->with(['user:id,name,email,avatar', 'user.studentProfile.department'])
            ->latest()
            ->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $following,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $user = $request->user();
        $alreadyFollowingIds = $user->following()->pluck('user_id')->push($user->id);

        $suggestions = User::whereNotIn('id', $alreadyFollowingIds)
            ->whereDoesntHave('roleAssignments', function ($q) {
                $q->whereHas('role', fn($rq) => $rq->where('slug', 'super_admin'))
                  ->where('status', 'active');
            })
            ->when($user->default_university_id, fn($q) => $q->where('default_university_id', $user->default_university_id))
            ->with(['studentProfile.department', 'lecturerProfile'])
            ->inRandomOrder()
            ->limit(5)
            ->get(['id', 'name', 'email', 'avatar', 'default_university_id']);

        return response()->json([
            'success' => true,
            'data' => $suggestions,
        ]);
    }
}

