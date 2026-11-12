<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\ServiceType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentServiceController extends Controller
{
    public function serviceTypes(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');

        $types = ServiceType::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function listRequests(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $request->query('university_id');
        $status = $request->query('status');

        $query = ServiceRequest::with(['serviceType', 'user.studentProfile', 'processor:id,name'])
            ->latest();

        if ($request->query('my_requests') === 'true' || !$user->hasRole('campus_admin', $universityId)) {
            $query->where('user_id', $user->id);
        } elseif ($universityId) {
            $query->where('university_id', $universityId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(15),
        ]);
    }

    public function submitRequest(Request $request): JsonResponse
    {
        $request->validate([
            'service_type_id' => 'required|exists:service_types,id',
            'notes' => 'required|string|max:1000',
            'attachment_url' => 'nullable|string',
        ]);

        $serviceType = ServiceType::findOrFail($request->service_type_id);

        $serviceRequest = ServiceRequest::create([
            'university_id' => $serviceType->university_id,
            'service_type_id' => $serviceType->id,
            'user_id' => $request->user()->id,
            'request_number' => 'REQ-' . $serviceType->code . '-' . date('Ymd') . '-' . rand(100, 999),
            'notes' => $request->notes,
            'attachment_url' => $request->attachment_url,
            'status' => 'submitted',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request submitted successfully. You can track progress in your dashboard.',
            'data' => $serviceRequest->load('serviceType'),
        ], 201);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:submitted,processing,completed,rejected',
            'admin_notes' => 'nullable|string',
            'result_document_url' => 'nullable|string',
        ]);

        $serviceRequest->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'result_document_url' => $request->result_document_url,
            'processed_by' => $request->user()->id,
            'completed_at' => $request->status === 'completed' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Service request updated to {$request->status}",
            'data' => $serviceRequest->fresh(['serviceType', 'user']),
        ]);
    }
}
