<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventWaitlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventEnhancementController extends Controller
{
    /**
     * Cancel an event registration
     */
    public function cancelRegistration(Request $request, $eventId): JsonResponse
    {
        $user = $request->user();
        $event = Event::findOrFail($eventId);

        $registration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$registration) {
            return response()->json(['success' => false, 'message' => 'Pendaftaran acara tidak ditemukan.'], 404);
        }

        if ($registration->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'Pendaftaran ini sudah dibatalkan sebelumnya.'], 400);
        }

        $registration->update(['status' => 'cancelled']);
        $event->decrement('current_participants');

        // Check if there is someone in waitlist to promote
        $nextInLine = EventWaitlist::where('event_id', $event->id)
            ->where('status', 'waiting')
            ->orderBy('position', 'asc')
            ->first();

        if ($nextInLine) {
            $nextInLine->update(['status' => 'promoted']);

            // Automatically create registration for promoted user
            EventRegistration::create([
                'event_id' => $event->id,
                'user_id' => $nextInLine->user_id,
                'ticket_code' => 'TKT-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'qr_token' => hash('sha256', "EVENT-{$event->id}-USER-{$nextInLine->user_id}-" . time()),
                'status' => 'registered',
            ]);

            $event->increment('current_participants');
        }

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran acara berhasil dibatalkan.',
        ]);
    }

    /**
     * Join event waitlist when quota is full
     */
    public function joinWaitlist(Request $request, $eventId): JsonResponse
    {
        $user = $request->user();
        $event = Event::findOrFail($eventId);

        // Check if already registered
        $isRegistered = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($isRegistered) {
            return response()->json(['success' => false, 'message' => 'Anda sudah terdaftar dalam acara ini.'], 400);
        }

        $existingWaitlist = EventWaitlist::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingWaitlist && $existingWaitlist->status === 'waiting') {
            return response()->json(['success' => false, 'message' => 'Anda sudah berada di dalam antrean waitlist acara ini.'], 400);
        }

        $maxPosition = EventWaitlist::where('event_id', $event->id)->where('status', 'waiting')->max('position') ?? 0;
        $nextPosition = $maxPosition + 1;

        $waitlist = EventWaitlist::updateOrCreate(
            ['event_id' => $event->id, 'user_id' => $user->id],
            ['position' => $nextPosition, 'status' => 'waiting']
        );

        return response()->json([
            'success' => true,
            'message' => "Anda berhasil masuk antrean waitlist pada urutan nomor #{$nextPosition}. Sistem akan otomatis mengonfirmasi tiket Anda jika ada peserta yang membatalkan.",
            'data' => $waitlist,
        ], 201);
    }
}

