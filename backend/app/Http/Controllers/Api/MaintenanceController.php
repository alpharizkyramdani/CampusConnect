<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MaintenanceReport;
use App\Models\MaintenanceUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $departmentId = $request->query('department_id');
        $status = $request->query('status');
        $priority = $request->query('priority');

        $reports = MaintenanceReport::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($departmentId, fn($q) => $q->where('department_id', $departmentId))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($priority, fn($q) => $q->where('priority', $priority))
            ->with(['user:id,name,email,avatar', 'assignedTo:id,name', 'department:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    public function show($id): JsonResponse
    {
        $report = MaintenanceReport::with(['user', 'assignedTo', 'department', 'updates.user:id,name'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:255',
            'location' => 'required|string',
            'category' => 'required|in:plumbing,electrical,hvac,furniture,structural,it_equipment,other',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,critical',
            'photo_url' => 'nullable|string',
        ]);

        $report = MaintenanceReport::create([
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'location' => $request->location,
            'category' => $request->category,
            'description' => $request->description,
            'priority' => $request->priority,
            'photo_url' => $request->photo_url,
            'status' => 'submitted',
        ]);

        MaintenanceUpdate::create([
            'maintenance_report_id' => $report->id,
            'user_id' => $request->user()->id,
            'status' => 'submitted',
            'notes' => 'Report submitted by user.',
        ]);

        ActivityLog::create([
            'university_id' => $request->university_id,
            'user_id' => $request->user()->id,
            'action' => 'maintenance.submit',
            'entity_type' => 'MaintenanceReport',
            'entity_id' => $report->id,
            'ip_address' => $request->ip(),
            'details' => ['title' => $report->title, 'location' => $report->location],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facility maintenance report submitted successfully',
            'data' => $report,
        ], 201);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $report = MaintenanceReport::findOrFail($id);

        $request->validate([
            'status' => 'required|in:submitted,under_review,assigned,in_progress,resolved,rejected',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'resolution_notes' => 'nullable|string',
        ]);

        $report->status = $request->status;

        if ($request->assigned_to) {
            $report->assigned_to = $request->assigned_to;
        }

        if ($request->status === 'resolved') {
            $report->resolved_at = now();
            $report->resolution_notes = $request->resolution_notes ?? $request->notes;
        }

        $report->save();

        MaintenanceUpdate::create([
            'maintenance_report_id' => $report->id,
            'user_id' => $request->user()->id,
            'status' => $request->status,
            'notes' => $request->notes ?? "Status updated to {$request->status}",
        ]);

        return response()->json([
            'success' => true,
            'message' => "Report status updated to {$request->status}",
            'data' => $report->fresh(['user', 'assignedTo', 'updates.user']),
        ]);
    }
}

