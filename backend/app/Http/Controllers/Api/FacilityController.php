<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\FacilityCategory;
use App\Models\InventoryMovement;
use App\Models\MaintenanceReport;
use App\Notifications\SocialNotification;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            'notes' => 'Registrasi inventaris peralatan laboratorium baru',
        ]);

        AuditLogService::log(
            'facility.create',
            'Facility',
            $facility->id,
            ['name' => $facility->name, 'code' => $facility->code, 'total' => $facility->total_quantity]
        );

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
                'notes' => 'Penyesuaian stok inventaris secara manual oleh Admin',
            ]);
        }

        AuditLogService::log(
            'facility.update',
            'Facility',
            $facility->id,
            ['name' => $facility->name, 'condition' => $facility->condition, 'available' => $facility->available_quantity]
        );

        return response()->json([
            'success' => true,
            'message' => 'Equipment updated successfully',
            'data' => $facility,
        ]);
    }

    // BORROWING OPERATIONS

    /**
     * Submit borrowing request with Overdue & Double-Booking prevention
     */
    public function requestBorrow(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Identity Verification Check
        if ($user->is_verified === false) {
            return response()->json([
                'success' => false,
                'message' => 'Akun civitas Anda belum terverifikasi oleh Admin Kampus. Peminjaman peralatan laboratorium memerlukan verifikasi identitas resmi.',
            ], 403);
        }

        $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'quantity' => 'required|integer|min:1',
            'purpose' => 'required|string|max:1000',
            'borrow_date' => 'required|date|after_or_equal:today',
            'return_due_date' => 'required|date|after:borrow_date',
        ]);

        // 2. Overdue Loan Check: Block user if they hold active overdue loans
        $hasOverdue = FacilityBorrowing::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('status', 'overdue')
                    ->orWhere(fn($sub) => $sub->where('status', 'borrowed')->where('return_due_date', '<', now()));
            })
            ->exists();

        if ($hasOverdue) {
            return response()->json([
                'success' => false,
                'message' => 'Anda memiliki pinjaman alat yang telah melewati batas waktu pengembalian (Overdue). Harap kembalikan peralatan laboratorium sebelum mengajukan permohonan baru.',
            ], 403);
        }

        $facility = Facility::findOrFail($request->facility_id);

        if ($facility->condition === 'damaged' || $facility->condition === 'in_repair') {
            return response()->json([
                'success' => false,
                'message' => 'Peralatan ini sedang dalam perbaikan (maintenance) dan tidak dapat dipinjam saat ini.',
            ], 422);
        }

        if ($facility->available_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => "Jumlah yang diminta ({$request->quantity}) melebihi stok yang saat ini tersedia ({$facility->available_quantity} unit).",
            ], 422);
        }

        // 3. Double-Booking Overlap Validation: Check committed quantity in the requested date range
        $overlappingBookingsQty = FacilityBorrowing::where('facility_id', $facility->id)
            ->whereIn('status', ['approved', 'borrowed', 'ready_for_pickup'])
            ->where(function ($q) use ($request) {
                $q->whereBetween('borrow_date', [$request->borrow_date, $request->return_due_date])
                    ->orWhereBetween('return_due_date', [$request->borrow_date, $request->return_due_date])
                    ->orWhere(function ($sub) use ($request) {
                        $sub->where('borrow_date', '<=', $request->borrow_date)
                            ->where('return_due_date', '>=', $request->return_due_date);
                    });
            })
            ->sum('quantity');

        $maxAvailableInRange = $facility->total_quantity - $overlappingBookingsQty;

        if ($maxAvailableInRange < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => "Stok alat tidak mencukupi untuk rentang tanggal tersebut karena terdapat {$overlappingBookingsQty} unit yang telah disetujui untuk peminjam lain. Maksimal tersedia pada rentang jadwal ini: {$maxAvailableInRange} unit.",
            ], 422);
        }

        $borrowing = FacilityBorrowing::create([
            'university_id' => $facility->university_id,
            'department_id' => $facility->department_id,
            'facility_id' => $facility->id,
            'user_id' => $user->id,
            'quantity' => $request->quantity,
            'purpose' => $request->purpose,
            'borrow_date' => $request->borrow_date,
            'return_due_date' => $request->return_due_date,
            'status' => 'pending',
        ]);

        AuditLogService::log(
            'borrowing.request',
            'FacilityBorrowing',
            $borrowing->id,
            ['equipment' => $facility->name, 'quantity' => $request->quantity, 'dates' => "{$request->borrow_date} s/d {$request->return_due_date}"]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permohonan peminjaman berhasil diajukan dan sedang menunggu verifikasi Admin Laboratorium.',
            'data' => $borrowing->load(['facility', 'department']),
        ], 201);
    }

    public function listBorrowings(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentId = $request->query('department_id');
        $status = $request->query('status');

        // Automatically update overdue status on active borrowed loans whose return_due_date has passed
        FacilityBorrowing::where('status', 'borrowed')
            ->where('return_due_date', '<', now())
            ->update(['status' => 'overdue']);

        $query = FacilityBorrowing::with(['facility', 'department', 'user:id,name,email,avatar', 'approver:id,name'])
            ->latest();

        $canManageAll = $user->isSuperAdmin() || $user->isCampusAdmin() || $user->isSarprasAdmin();

        // If not department/campus admin, restrict to own borrowings
        if ($request->query('my_borrowings') === 'true' || (!$canManageAll && !$departmentId)) {
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
                    'message' => 'Hanya pengajuan berstatus pending yang dapat disetujui.',
                ], 400);
            }

            $facility = Facility::where('id', $borrowing->facility_id)->lockForUpdate()->firstOrFail();

            if ($facility->available_quantity < $borrowing->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok tidak mencukupi untuk disetujui: Diminta {$borrowing->quantity}, tetapi saat ini hanya tersedia {$facility->available_quantity} unit.",
                ], 422);
            }

            // Reserve inventory
            $facility->decrement('available_quantity', $borrowing->quantity);

            $borrowing->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'admin_notes' => $request->admin_notes ?? 'Disetujui. Silakan ambil alat di laboratorium sesuai jadwal.',
            ]);

            InventoryMovement::create([
                'facility_id' => $facility->id,
                'user_id' => $request->user()->id,
                'type' => 'borrow',
                'quantity' => -$borrowing->quantity,
                'notes' => "Persetujuan peminjaman #{$borrowing->id} untuk pemohon #{$borrowing->user_id}",
            ]);

            AuditLogService::log(
                'borrowing.approve',
                'FacilityBorrowing',
                $borrowing->id,
                ['equipment' => $facility->name, 'quantity' => $borrowing->quantity, 'borrower_id' => $borrowing->user_id]
            );

            // Notify Borrower
            $borrower = $borrowing->user;
            if ($borrower) {
                $borrower->notify(new SocialNotification(
                    'system',
                    'Peminjaman Alat Disetujui',
                    "Pengajuan pinjam alat {$facility->name} ({$borrowing->quantity} unit) telah disetujui! Silakan ambil barang di laboratorium.",
                    ['action_url' => '/borrowings']
                ));
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan peminjaman berhasil disetujui. Alat siap untuk diserahterimakan.',
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
                'message' => 'Hanya pengajuan berstatus pending yang dapat ditolak.',
            ], 400);
        }

        $borrowing->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'admin_notes' => $request->admin_notes ?? 'Permohonan peminjaman ditolak oleh Administrator.',
        ]);

        AuditLogService::log(
            'borrowing.reject',
            'FacilityBorrowing',
            $borrowing->id,
            ['reason' => $borrowing->admin_notes, 'borrower_id' => $borrowing->user_id]
        );

        $borrower = $borrowing->user;
        if ($borrower) {
            $borrower->notify(new SocialNotification(
                'system',
                'Peminjaman Alat Ditolak',
                "Permohonan pinjam alat {$borrowing->facility?->name} ditolak. Catatan: {$borrowing->admin_notes}",
                ['action_url' => '/borrowings']
            ));
        }

        return response()->json([
            'success' => true,
            'message' => 'Permohonan peminjaman telah ditolak.',
            'data' => $borrowing,
        ]);
    }

    /**
     * Record handover pickup with photo proof
     */
    public function recordPickup(Request $request, $id): JsonResponse
    {
        $borrowing = FacilityBorrowing::findOrFail($id);

        if (!in_array($borrowing->status, ['approved', 'ready_for_pickup'])) {
            return response()->json([
                'success' => false,
                'message' => 'Peralatan harus berstatus disetujui (approved) sebelum serah terima dapat dicatat.',
            ], 400);
        }

        $request->validate([
            'pickup_photo_url' => 'nullable|string',
            'pickup_notes' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        $borrowing->update([
            'status' => 'borrowed',
            'handed_over_by' => $request->user()->id,
            'pickup_photo_url' => $request->pickup_photo_url,
            'pickup_notes' => $request->pickup_notes ?? 'Peralatan diserahkan dalam kondisi lengkap dan baik.',
            'admin_notes' => $request->admin_notes ?? $borrowing->admin_notes,
        ]);

        AuditLogService::log(
            'borrowing.pickup',
            'FacilityBorrowing',
            $borrowing->id,
            ['equipment' => $borrowing->facility?->name, 'handed_over_by' => $request->user()->name]
        );

        $borrower = $borrowing->user;
        if ($borrower) {
            $borrower->notify(new SocialNotification(
                'system',
                'Serah Terima Alat Selesai',
                "Peralatan {$borrowing->facility?->name} telah dicatat serah terimanya. Batas pengembalian: " . Carbon::parse($borrowing->return_due_date)->format('d M Y'),
                ['action_url' => '/borrowings']
            ));
        }

        return response()->json([
            'success' => true,
            'message' => 'Serah terima fisik peralatan berhasil dicatat. Status kini aktif dipinjam.',
            'data' => $borrowing,
        ]);
    }

    /**
     * Record equipment return with damage protection rule
     */
    public function recordReturn(Request $request, $id): JsonResponse
    {
        $request->validate([
            'return_condition' => 'required|in:excellent,good,fair,damaged',
            'return_photo_url' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $borrowing = FacilityBorrowing::where('id', $id)->lockForUpdate()->firstOrFail();

            if (!in_array($borrowing->status, ['borrowed', 'overdue'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya peralatan yang berstatus sedang dipinjam atau terlambat yang dapat dicatat pengembaliannya.',
                ], 400);
            }

            $facility = Facility::where('id', $borrowing->facility_id)->lockForUpdate()->firstOrFail();

            // CRUCIAL STOCK RULE:
            // If condition is marked as 'damaged', DO NOT restore available quantity to stock!
            // Instead, transition facility condition to 'damaged' and automatically create Maintenance Report for Sarpras repair.
            if ($request->return_condition === 'damaged') {
                $facility->update(['condition' => 'damaged']);

                // Auto-create maintenance repair ticket for Sarpras Admin
                MaintenanceReport::create([
                    'university_id' => $facility->university_id,
                    'department_id' => $facility->department_id,
                    'user_id' => $request->user()->id,
                    'title' => "Perbaikan Kerusakan Alat: {$facility->name} ({$facility->code})",
                    'location' => $facility->location ?? 'Laboratorium PNL',
                    'category' => 'it_equipment',
                    'description' => "Peralatan dikembalikan dalam kondisi rusak pada peminjaman #{$borrowing->id} oleh peminjam {$borrowing->user?->name}. Catatan audit: {$request->admin_notes}",
                    'photo_url' => $request->return_photo_url,
                    'priority' => 'high',
                    'status' => 'submitted',
                ]);

                InventoryMovement::create([
                    'facility_id' => $facility->id,
                    'user_id' => $request->user()->id,
                    'type' => 'damage',
                    'quantity' => 0, // No stock restored
                    'notes' => "Peralatan dikembalikan dalam kondisi rusak (Stok tidak dipulihkan). Catatan audit: {$request->admin_notes}",
                ]);
            } else {
                // Return stock to available inventory only if pristine or minor cosmetic wear
                $facility->increment('available_quantity', $borrowing->quantity);
                $facility->update(['condition' => $request->return_condition]);

                InventoryMovement::create([
                    'facility_id' => $facility->id,
                    'user_id' => $request->user()->id,
                    'type' => 'return',
                    'quantity' => $borrowing->quantity,
                    'notes' => "Peralatan dikembalikan dalam kondisi {$request->return_condition}. Stok tersedia dipulihkan.",
                ]);
            }

            $borrowing->update([
                'status' => 'returned',
                'actual_return_date' => now(),
                'received_by' => $request->user()->id,
                'return_condition' => $request->return_condition,
                'return_photo_url' => $request->return_photo_url,
                'admin_notes' => $request->admin_notes,
            ]);

            AuditLogService::log(
                'borrowing.return',
                'FacilityBorrowing',
                $borrowing->id,
                [
                    'equipment' => $facility->name,
                    'condition' => $request->return_condition,
                    'stock_restored' => $request->return_condition !== 'damaged',
                ]
            );

            $borrower = $borrowing->user;
            if ($borrower) {
                $borrower->notify(new SocialNotification(
                    'system',
                    'Pengembalian Alat Berhasil Dicatat',
                    "Peralatan {$facility->name} telah diterima kembali oleh laboratorium dengan kondisi: {$request->return_condition}.",
                    ['action_url' => '/borrowings']
                ));
            }

            return response()->json([
                'success' => true,
                'message' => $request->return_condition === 'damaged'
                    ? 'Pengembalian dicatat dengan kondisi rusak. Stok tidak dipulihkan dan tiket perbaikan fasilitas telah otomatis dibuat.'
                    : 'Pengembalian peralatan berhasil diverifikasi. Stok ketersediaan laboratorium telah dipulihkan.',
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
