<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LibraryItem;
use App\Models\LibraryLoan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DigitalLibraryController extends Controller
{
    /**
     * List library catalog items
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $request->query('university_id') ?? $user?->default_university_id ?? University::where('code', 'PNL')->value('id') ?? University::first()?->id ?? 5;
        $category = $request->query('category');
        $search = $request->query('search');

        $items = LibraryItem::where('university_id', $universityId)
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('author', 'like', "%{$search}%")->orWhere('publisher', 'like', "%{$search}%")))
            ->latest()
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Store new book or journal (Admin / Librarian)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin') && !$user->hasRole('department_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to add library items.'], 403);
        }

        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn_issn' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'publication_year' => 'nullable|integer',
            'category' => 'required|in:academic_book,journal,thesis,final_project,lab_module,general_reference',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'file_url' => 'nullable|string',
            'total_copies' => 'required|integer|min:1',
            'shelf_location' => 'nullable|string|max:100',
            'is_digital_access' => 'nullable|boolean',
        ]);

        $validated['available_copies'] = $validated['total_copies'];

        $item = LibraryItem::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Koleksi perpustakaan berhasil ditambahkan ke katalog.',
            'data' => $item,
        ], 201);
    }

    /**
     * Borrow / Reserve a book
     */
    public function borrow(Request $request, $itemId): JsonResponse
    {
        $user = $request->user();
        $item = LibraryItem::findOrFail($itemId);

        if ($item->available_copies < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Stok buku ini sedang habis dipinjam oleh civitas lain.',
            ], 400);
        }

        // Check if user already has active loan for this item
        $existing = LibraryLoan::where('user_id', $user->id)
            ->where('library_item_id', $item->id)
            ->where('status', 'borrowed')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda masih memiliki peminjaman aktif untuk koleksi buku ini.',
            ], 400);
        }

        $loanCode = 'LIB-' . strtoupper(Str::random(8));
        $borrowDate = now();
        $dueDate = now()->addDays(14); // 2-week loan period

        $loan = LibraryLoan::create([
            'university_id' => $item->university_id,
            'library_item_id' => $item->id,
            'user_id' => $user->id,
            'loan_code' => $loanCode,
            'borrow_date' => $borrowDate->toDateString(),
            'due_date' => $dueDate->toDateString(),
            'status' => 'borrowed',
            'fine_amount' => 0,
        ]);

        $item->decrement('available_copies');
        $item->increment('borrow_count');

        return response()->json([
            'success' => true,
            'message' => "Peminjaman buku berhasil dicatat dengan kode: {$loanCode}. Batas waktu pengembalian: " . $dueDate->translatedFormat('d F Y'),
            'data' => $loan->load('item'),
        ], 201);
    }

    /**
     * Return a borrowed book
     */
    public function returnBook(Request $request, $loanId): JsonResponse
    {
        $user = $request->user();
        $loan = LibraryLoan::findOrFail($loanId);

        if ($loan->status === 'returned') {
            return response()->json(['success' => false, 'message' => 'Buku ini telah dikembalikan sebelumnya.'], 400);
        }

        // Calculate fine if overdue (Rp 1.000 per day)
        $today = now()->startOfDay();
        $dueDate = \Carbon\Carbon::parse($loan->due_date)->startOfDay();
        $fine = 0;

        if ($today->gt($dueDate)) {
            $daysLate = $today->diffInDays($dueDate);
            $fine = $daysLate * 1000;
        }

        $loan->update([
            'return_date' => now()->toDateString(),
            'status' => 'returned',
            'fine_amount' => $fine,
        ]);

        $loan->item->increment('available_copies');

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil dikembalikan ke perpustakaan.' . ($fine > 0 ? " Terdapat denda keterlambatan: Rp " . number_format($fine, 0, ',', '.') : ''),
            'data' => $loan,
        ]);
    }

    /**
     * List user loans
     */
    public function myLoans(Request $request): JsonResponse
    {
        $user = $request->user();

        $loans = LibraryLoan::where('user_id', $user->id)
            ->with('item:id,title,author,category,cover_image,shelf_location')
            ->latest('borrow_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $loans,
        ]);
    }
}

