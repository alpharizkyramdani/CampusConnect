<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ItemClaim;
use App\Models\LostFoundItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LostFoundController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $type = $request->query('type'); // lost, found
        $category = $request->query('category');
        $status = $request->query('status');
        $search = $request->query('search');

        $items = LostFoundItem::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($type, fn($q) => $q->where('type', $type))
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")->orWhere('location', 'like', "%{$search}%")))
            ->with(['user:id,name,avatar'])
            ->withCount('claims')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function show($id): JsonResponse
    {
        $item = LostFoundItem::with(['user:id,name,avatar'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'type' => 'required|in:lost,found',
            'title' => 'required|string|max:255',
            'category' => 'required|in:electronics,documents,clothing,keys,bags,other',
            'description' => 'required|string',
            'location' => 'required|string',
            'event_date' => 'required|date',
            'photo_url' => 'nullable|string',
            'contact_info' => 'nullable|string',
        ]);

        $item = LostFoundItem::create([
            'university_id' => $request->university_id,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'title' => $request->title,
            'category' => $request->category,
            'description' => $request->description,
            'location' => $request->location,
            'event_date' => $request->event_date,
            'photo_url' => $request->photo_url,
            'contact_info' => $request->contact_info,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lost & Found item posted successfully',
            'data' => $item,
        ], 201);
    }

    public function submitClaim(Request $request, $id): JsonResponse
    {
        $item = LostFoundItem::findOrFail($id);

        $request->validate([
            'proof_description' => 'required|string',
            'proof_photo_url' => 'nullable|string',
        ]);

        $claim = ItemClaim::create([
            'lost_found_item_id' => $item->id,
            'user_id' => $request->user()->id,
            'proof_description' => $request->proof_description,
            'proof_photo_url' => $request->proof_photo_url,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Claim submitted successfully. It will be reviewed by campus administrators.',
            'data' => $claim,
        ], 201);
    }

    public function listClaims($itemId): JsonResponse
    {
        $claims = ItemClaim::where('lost_found_item_id', $itemId)
            ->with(['user:id,name,email,avatar'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $claims,
        ]);
    }

    public function reviewClaim(Request $request, $claimId): JsonResponse
    {
        $claim = ItemClaim::findOrFail($claimId);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $claim->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => $request->review_notes,
        ]);

        if ($request->status === 'approved') {
            $claim->item->update(['status' => 'claimed']);
        }

        return response()->json([
            'success' => true,
            'message' => "Claim {$request->status} successfully",
            'data' => $claim->fresh('user'),
        ]);
    }
}
