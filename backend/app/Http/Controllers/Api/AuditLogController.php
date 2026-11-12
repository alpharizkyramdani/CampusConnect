<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $action = $request->query('action');
        $search = $request->query('search');

        $logs = ActivityLog::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($action, fn($q) => $q->where('action', 'like', "%{$action}%"))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('action', 'like', "%{$search}%")->orWhere('entity_type', 'like', "%{$search}%")))
            ->with(['user:id,name,email,avatar', 'university:id,name,code'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}

