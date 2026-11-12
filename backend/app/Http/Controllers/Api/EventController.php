<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventCategory;
use App\Models\EventRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categoryId = $request->query('category_id');
        $status = $request->query('status');
        $eventType = $request->query('event_type');
        $search = $request->query('search');

        $events = Event::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($eventType, fn($q) => $q->where('event_type', $eventType))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")))
            ->with(['category', 'organization:id,name,logo', 'university:id,name,code'])
            ->latest('start_time')
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    public function show($id): JsonResponse
    {
        $event = Event::with(['category', 'organization', 'department', 'creator:id,name', 'university'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:event_categories,id',
            'organization_id' => 'nullable|exists:organizations,id',
            'department_id' => 'nullable|exists:departments,id',
            'description' => 'required|string',
            'banner_image' => 'nullable|string',
            'location' => 'required|string',
            'event_type' => 'required|in:online,offline,hybrid',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'registration_deadline' => 'nullable|date',
            'max_participants' => 'nullable|integer|min:1',
            'certificate_enabled' => 'nullable|boolean',
        ]);

        $event = Event::create([
            'university_id' => $request->university_id,
            'organization_id' => $request->organization_id,
            'department_id' => $request->department_id,
            'category_id' => $request->category_id,
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(5),
            'description' => $request->description,
            'banner_image' => $request->banner_image,
            'location' => $request->location,
            'event_type' => $request->event_type,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'registration_deadline' => $request->registration_deadline ?? $request->start_time,
            'max_participants' => $request->max_participants ?? 100,
            'status' => 'registration_open',
            'certificate_enabled' => $request->certificate_enabled ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => $event,
        ], 201);
    }

    public function register(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $user = $request->user();

        // Check if already registered
        $existing = EventRegistration::where('event_id', $event->id)->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You are already registered for this event.',
                'data' => $existing,
            ], 400);
        }

        // Concurrency-safe registration check
        return DB::transaction(function () use ($event, $user, $request) {
            $lockedEvent = Event::where('id', $event->id)->lockForUpdate()->first();

            if ($lockedEvent->current_participants >= $lockedEvent->max_participants) {
                return response()->json([
                    'success' => false,
                    'message' => 'This event has reached its maximum participant limit.',
                ], 400);
            }

            $ticketCode = 'TCK-' . strtoupper(Str::random(8));
            $qrToken = hash('sha256', $ticketCode . '-' . $user->id . '-' . time() . '-' . config('app.key'));

            $registration = EventRegistration::create([
                'event_id' => $lockedEvent->id,
                'user_id' => $user->id,
                'ticket_code' => $ticketCode,
                'qr_token' => $qrToken,
                'status' => 'registered',
                'registered_at' => now(),
            ]);

            $lockedEvent->increment('current_participants');

            ActivityLog::create([
                'university_id' => $lockedEvent->university_id,
                'user_id' => $user->id,
                'action' => 'event.register',
                'entity_type' => 'EventRegistration',
                'entity_id' => $registration->id,
                'ip_address' => $request->ip(),
                'details' => ['event_title' => $lockedEvent->title, 'ticket_code' => $ticketCode],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Your digital ticket is ready.',
                'data' => $registration->load('event'),
            ], 201);
        });
    }

    public function myTickets(Request $request): JsonResponse
    {
        $tickets = EventRegistration::where('user_id', $request->user()->id)
            ->with(['event.organization', 'event.university', 'event.category'])
            ->latest('registered_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    public function registrations($id): JsonResponse
    {
        $registrations = EventRegistration::where('event_id', $id)
            ->with(['user:id,name,email,avatar', 'attendance.scannedBy:id,name'])
            ->latest('registered_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $registrations,
        ]);
    }

    public function verifyTicket(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string', // can be ticket_code or qr_token
        ]);

        $token = trim($request->token);

        $registration = EventRegistration::where('ticket_code', $token)
            ->orWhere('qr_token', $token)
            ->with(['event', 'user.studentProfile'])
            ->first();

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ticket code or QR token. No matching record found.',
            ], 404);
        }

        if ($registration->status === 'attended') {
            return response()->json([
                'success' => false,
                'message' => 'DUPLICATE CHECK-IN PREVENTED: This participant has already checked in on ' . $registration->checked_in_at?->format('d M Y H:i'),
                'data' => [
                    'registration' => $registration,
                    'already_attended' => true,
                ],
            ], 409);
        }

        if ($registration->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'This ticket registration was previously cancelled.',
            ], 400);
        }

        // Perform check-in
        DB::transaction(function () use ($registration, $request) {
            $registration->update([
                'status' => 'attended',
                'checked_in_at' => now(),
                'checked_in_by' => $request->user()->id,
            ]);

            EventAttendance::create([
                'event_id' => $registration->event_id,
                'registration_id' => $registration->id,
                'user_id' => $registration->user_id,
                'scanned_by' => $request->user()->id,
                'scanned_at' => now(),
                'notes' => 'Checked in via CampusConnect QR Scanner',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Check-in confirmed successfully! Welcome ' . $registration->user->name,
            'data' => [
                'registration' => $registration->fresh(['user', 'event']),
                'already_attended' => false,
            ],
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        $categories = EventCategory::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }
}

