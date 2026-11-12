<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\FacilityCategory;
use App\Models\InventoryMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FacilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $user = $request->user();
        if (!$universityId && $user) {
            $isSuperAdmin = $user->assignments()->whereHas('role', fn($r) => $r->where('slug', 'super_admin'))->exists();
            if (!$isSuperAdmin) {
                $universityId = $user->assignments()->where('status', 'active')->first()?->university_id;
            }
        }

        $departmentId = $request->query('department_id');
        $categoryId = $request->query('category_id');
        $condition = $request->query('condition');
        $search = $request->query('search');

        $facilities = Facility::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($departmentId, fn($q) => $q->where('department_id', $departmentId))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($condition, fn($q) => $q->where('condition', $condition))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")))
            ->with(['department:id,name,code', 'category:id,name', 'university:id,name,code'])
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $facilities,
        ]);
    }

    public function show($id): JsonResponse
    {
        $facility = Facility::with(['department', 'category', 'university', 'movements.user:id,name'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $facility,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'department_id' => 'required|exists:departments,id',
            'category_id' => 'nullable|exists:facility_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:facilities,code',
            'description' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'condition' => 'required|in:excellent,good,fair,damaged,in_repair',
            'total_quantity' => 'required|integer|min:1',
            'location' => 'nullable|string',
        ]);

        $facility = Facility::create([
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'photo_url' => $request->photo_url,
            'condition' => $request->condition,
            'total_quantity' => $request->total_quantity,
            'available_quantity' => $request->total_quantity,
            'location' => $request->location,
        ]);

        InventoryMovement::create([
            'facility_id' => $facility->id,
            'user_id' => $request->user()->id,
            'type' => 'restock',
            'quantity' => $facility->total_quantity,
            'notes' => 'Initial inventory intake',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facility equipment added successfully',
            'data' => $facility,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $facility = Facility::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'condition' => 'required|in:excellent,good,fair,damaged,in_repair',
            'total_quantity' => 'required|integer|min:1',
            'available_quantity' => 'required|integer|min:0|lte:total_quantity',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'photo_url' => 'nullable|string',
        ]);

        $diff = $request->available_quantity - $facility->available_quantity;

        $facility->update($request->only([
            'name',
            'condition',
            'total_quantity',
            'available_quantity',
            'location',
            'description',
            'photo_url',
        ]));

        if ($diff !== 0) {
            InventoryMovement::create([
                'facility_id' => $facility->id,
                'user_id' => $request->user()->id,
                'type' => 'adjustment',
                'quantity' => $diff,
                'notes' => 'Manual inventory stock adjustment by Department Admin',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Equipment updated successfully',
            'data' => $facility,
        ]);
    }

    // BORROWING OPERATIONS
    public function requestBorrow(Request $request): JsonResponse
    {
        $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'quantity' => 'required|integer|min:1',
            'purpose' => 'required|string|max:1000',
            'borrow_date' => 'required|date|after_or_equal:today',
            'return_due_date' => 'required|date|after:borrow_date',
        ]);

        $facility = Facility::findOrFail($request->facility_id);

        if ($facility->available_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => "Requested quantity ({$request->quantity}) exceeds current available quantity ({$facility->available_quantity}).",
            ], 422);
        }

        $borrowing = FacilityBorrowing::create([
            'university_id' => $facility->university_id,
            'department_id' => $facility->department_id,
            'facility_id' => $facility->id,
            'user_id' => $request->user()->id,
            'quantity' => $request->quantity,
            'purpose' => $request->purpose,
            'borrow_date' => $request->borrow_date,
            'return_due_date' => $request->return_due_date,
            'status' => 'pending',
        ]);

        ActivityLog::create([
            'university_id' => $facility->university_id,
            'user_id' => $request->user()->id,
            'action' => 'borrowing.request',
            'entity_type' => 'FacilityBorrowing',
            'entity_id' => $borrowing->id,
            'ip_address' => $request->ip(),
            'details' => ['equipment' => $facility->name, 'quantity' => $request->quantity],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Borrowing request submitted. Waiting for Department Admin approval.',
            'data' => $borrowing->load(['facility', 'department']),
        ], 201);
    }

    public function listBorrowings(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentId = $request->query('department_id');
        $status = $request->query('status');

        $query = FacilityBorrowing::with(['facility', 'department', 'user:id,name,email,avatar', 'approver:id,name'])
            ->latest();

        // If not department/campus admin, restrict to own borrowings
        if ($request->query('my_borrowings') === 'true' || (!$user->isSuperAdmin() && !$departmentId)) {
            $query->where('user_id', $user->id);
        } elseif ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(15),
        ]);
    }

    public function approveBorrowing(Request $request, $id): JsonResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $borrowing = FacilityBorrowing::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($borrowing->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending requests can be approved.',
                ], 400);
            }

            $facility = Facility::where('id', $borrowing->facility_id)->lockForUpdate()->firstOrFail();

            if ($facility->available_quantity < $borrowing->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Insufficient stock to approve: Requested {$borrowing->quantity}, but only {$facility->available_quantity} available.",
                ], 422);
            }

            // Reserve inventory
            $facility->decrement('available_quantity', $borrowing->quantity);

            $borrowing->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'admin_notes' => $request->admin_notes ?? 'Approved for pickup.',
            ]);

            InventoryMovement::create([
                'facility_id' => $facility->id,
                'user_id' => $request->user()->id,
                'type' => 'borrow',
                'quantity' => -$borrowing->quantity,
                'notes' => "Approved borrowing request #{$borrowing->id} by user #{$borrowing->user_id}",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Borrowing request approved. Ready for pickup.',
                'data' => $borrowing->fresh(['facility', 'user', 'approver']),
            ]);
        });
    }

    public function rejectBorrowing(Request $request, $id): JsonResponse
    {
        $borrowing = FacilityBorrowing::findOrFail($id);

        if ($borrowing->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending requests can be rejected.',
            ], 400);
        }

        $borrowing->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'admin_notes' => $request->admin_notes ?? 'Request rejected by Department Admin.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Borrowing request rejected.',
            'data' => $borrowing,
        ]);
    }

    public function recordPickup(Request $request, $id): JsonResponse
    {
        $borrowing = FacilityBorrowing::findOrFail($id);

        if (!in_array($borrowing->status, ['approved', 'ready_for_pickup'])) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment must be approved before pickup can be recorded.',
            ], 400);
        }

        $borrowing->update([
            'status' => 'borrowed',
            'handed_over_by' => $request->user()->id,
            'admin_notes' => $request->admin_notes ?? 'Equipment handed over in good condition.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pickup recorded successfully. Equipment is now in borrowed status.',
            'data' => $borrowing,
        ]);
    }

    public function recordReturn(Request $request, $id): JsonResponse
    {
        $request->validate([
            'return_condition' => 'required|in:excellent,good,fair,damaged',
            'admin_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $borrowing = FacilityBorrowing::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($borrowing->status !== 'borrowed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only borrowed equipment can be returned.',
                ], 400);
            }

            $facility = Facility::where('id', $borrowing->facility_id)->lockForUpdate()->firstOrFail();

            // Return quantity to available stock
            $facility->increment('available_quantity', $borrowing->quantity);

            // If condition deteriorated, update facility condition
            if ($request->return_condition === 'damaged') {
                $facility->update(['condition' => 'damaged']);
            }

            $borrowing->update([
                'status' => 'returned',
                'actual_return_date' => now(),
                'received_by' => $request->user()->id,
                'return_condition' => $request->return_condition,
                'admin_notes' => $request->admin_notes,
            ]);

            InventoryMovement::create([
                'facility_id' => $facility->id,
                'user_id' => $request->user()->id,
                'type' => 'return',
                'quantity' => $borrowing->quantity,
                'notes' => "Equipment returned in {$request->return_condition} condition. Admin notes: {$request->admin_notes}",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Return recorded successfully. Available inventory quantity restored.',
                'data' => $borrowing->fresh(['facility', 'user']),
            ]);
        });
    }

    public function categories($universityId): JsonResponse
    {
        $categories = FacilityCategory::where('university_id', $universityId)->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }
}

