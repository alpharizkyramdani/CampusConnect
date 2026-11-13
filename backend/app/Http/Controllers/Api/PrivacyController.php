<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBlock;
use App\Models\UserMute;
use App\Models\UserPrivacySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivacyController extends Controller
{
    /**
     * Get or create current user's privacy settings
     */
    public function getSettings(Request $request): JsonResponse
    {
        $user = $request->user();

        $settings = UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'profile_visibility' => 'campus',
                'dm_permission' => 'everyone',
                'notify_follow' => true,
                'notify_message' => true,
                'notify_like' => true,
                'notify_comment' => true,
                'notify_event' => true,
            ]
        );

        $blockedUsers = UserBlock::where('blocker_id', $user->id)
            ->with('blocked:id,name,email,avatar')
            ->get();

        $mutedUsers = UserMute::where('user_id', $user->id)
            ->with('mutedUser:id,name,email,avatar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'settings' => $settings,
                'blocked_users' => $blockedUsers,
                'muted_users' => $mutedUsers,
            ],
        ]);
    }

    /**
     * Update user privacy settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'profile_visibility' => 'required|in:public,campus,followers,private',
            'dm_permission' => 'required|in:everyone,followers,nobody',
            'notify_follow' => 'required|boolean',
            'notify_message' => 'required|boolean',
            'notify_like' => 'required|boolean',
            'notify_comment' => 'required|boolean',
            'notify_event' => 'required|boolean',
        ]);

        $settings = UserPrivacySetting::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan privasi dan notifikasi berhasil disimpan.',
            'data' => $settings,
        ]);
    }

    /**
     * Block a user
     */
    public function blockUser(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === (int)$targetUserId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat memblokir akun Anda sendiri.',
            ], 422);
        }

        $targetUser = User::findOrFail($targetUserId);

        // Cannot block super_admin
        if ($targetUser->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Administrator Sistem tidak dapat diblokir.',
            ], 403);
        }

        UserBlock::firstOrCreate([
            'blocker_id' => $currentUser->id,
            'blocked_id' => $targetUser->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Akun {$targetUser->name} telah diblokir. Interaksi dan pesan dari akun ini tidak akan lagi muncul.",
        ]);
    }

    /**
     * Unblock a user
     */
    public function unblockUser(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();

        $deleted = UserBlock::where('blocker_id', $currentUser->id)
            ->where('blocked_id', $targetUserId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Pemblokiran akun berhasil dicabut.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Akun tidak ditemukan dalam daftar blokir Anda.',
        ], 404);
    }

    /**
     * Mute a user
     */
    public function muteUser(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === (int)$targetUserId) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat membisukan diri sendiri.'], 422);
        }

        UserMute::firstOrCreate([
            'user_id' => $currentUser->id,
            'muted_user_id' => $targetUserId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dibisukan. Notifikasi dan postingannya tidak akan mengganggu beranda Anda.',
        ]);
    }

    /**
     * Unmute a user
     */
    public function unmuteUser(Request $request, $targetUserId): JsonResponse
    {
        $currentUser = $request->user();

        UserMute::where('user_id', $currentUser->id)
            ->where('muted_user_id', $targetUserId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengguna tidak lagi dibisukan.',
        ]);
    }
}

