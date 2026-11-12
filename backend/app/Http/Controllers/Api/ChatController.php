<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Find all unique partner IDs
        $sentPartners = DirectMessage::where('sender_id', $userId)->pluck('receiver_id');
        $receivedPartners = DirectMessage::where('receiver_id', $userId)->pluck('sender_id');
        $partnerIds = $sentPartners->merge($receivedPartners)->unique()->values();

        $conversations = [];

        foreach ($partnerIds as $partnerId) {
            $partner = User::with(['studentProfile.department', 'lecturerProfile'])->find($partnerId);
            if (!$partner) continue;

            $lastMessage = DirectMessage::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })->latest()->first();

            $unreadCount = DirectMessage::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $conversations[] = [
                'partner' => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'email' => $partner->email,
                    'avatar' => $partner->avatar,
                    'department' => $partner->studentProfile?->department?->name ?? $partner->lecturerProfile?->title ?? 'Campus Member',
                ],
                'last_message' => $lastMessage,
                'unread_count' => $unreadCount,
            ];
        }

        // Sort by last message time
        usort($conversations, function ($a, $b) {
            $tA = $a['last_message'] ? strtotime($a['last_message']->created_at) : 0;
            $tB = $b['last_message'] ? strtotime($b['last_message']->created_at) : 0;
            return $tB <=> $tA;
        });

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function messages(Request $request, $partnerId): JsonResponse
    {
        $userId = $request->user()->id;
        $partner = User::with(['studentProfile.department', 'lecturerProfile'])->findOrFail($partnerId);

        // Mark incoming messages from this partner as read
        DirectMessage::where('sender_id', $partnerId)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = DirectMessage::where(function ($q) use ($userId, $partnerId) {
            $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
        })->orWhere(function ($q) use ($userId, $partnerId) {
            $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
        })
        ->orderBy('created_at', 'asc')
        ->limit(100)
        ->get();

        return response()->json([
            'success' => true,
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
                'avatar' => $partner->avatar,
                'department' => $partner->studentProfile?->department?->name ?? $partner->lecturerProfile?->title ?? 'Campus Member',
            ],
            'data' => $messages,
        ]);
    }

    public function sendMessage(Request $request, $partnerId): JsonResponse
    {
        $sender = $request->user();
        $receiver = User::findOrFail($partnerId);

        if ($sender->id === $receiver->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot send direct messages to yourself.',
            ], 400);
        }

        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $msg = DirectMessage::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $msg->load(['sender:id,name,avatar', 'receiver:id,name,avatar']),
        ], 201);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = DirectMessage::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count,
        ]);
    }
}
