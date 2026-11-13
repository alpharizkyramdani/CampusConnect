<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationFinance;
use App\Models\WorkProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationEnhancementController extends Controller
{
    /**
     * List work programs for an organization
     */
    public function listWorkPrograms($orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);

        $programs = WorkProgram::where('organization_id', $org->id)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    /**
     * Store work program
     */
    public function storeWorkProgram(Request $request, $orgId): JsonResponse
    {
        $user = $request->user();
        $org = Organization::findOrFail($orgId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'status' => 'required|in:planned,in_progress,completed,cancelled',
        ]);

        $validated['organization_id'] = $org->id;

        $program = WorkProgram::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program kerja organisasi berhasil ditambahkan.',
            'data' => $program,
        ], 201);
    }

    /**
     * List finances for an organization
     */
    public function listFinances($orgId): JsonResponse
    {
        $org = Organization::findOrFail($orgId);

        $finances = OrganizationFinance::where('organization_id', $org->id)
            ->with('creator:id,name')
            ->orderBy('transaction_date', 'desc')
            ->get();

        $totalIncome = $finances->where('type', 'income')->sum('amount');
        $totalExpense = $finances->where('type', 'expense')->sum('amount');
        $balance = $totalIncome - $totalExpense;

        return response()->json([
            'success' => true,
            'summary' => [
                'total_income' => (float)$totalIncome,
                'total_expense' => (float)$totalExpense,
                'current_balance' => (float)$balance,
            ],
            'data' => $finances,
        ]);
    }

    /**
     * Store finance entry
     */
    public function storeFinance(Request $request, $orgId): JsonResponse
    {
        $user = $request->user();
        $org = Organization::findOrFail($orgId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $validated['organization_id'] = $org->id;
        $validated['created_by'] = $user->id;

        $finance = OrganizationFinance::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan keuangan organisasi berhasil dicatat.',
            'data' => $finance,
        ], 201);
    }
}
