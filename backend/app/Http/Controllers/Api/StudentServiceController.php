<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\ServiceType;
use App\Notifications\SocialNotification;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

        $query = ServiceRequest::with(['serviceType', 'user.studentProfile.department', 'processor:id,name'])
            ->latest();

        $canManage = $user->isSuperAdmin() || $user->isCampusAdmin();

        if ($request->query('my_requests') === 'true' || (!$canManage && !$universityId)) {
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
        $user = $request->user();

        // 1. Identity Verification check
        if ($user->is_verified === false) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan penerbitan surat dan dokumen mahasiswa mewajibkan akun civitas yang telah terverifikasi oleh Admin Kampus.',
            ], 403);
        }

        $request->validate([
            'service_type_id' => 'required|exists:service_types,id',
            'notes' => 'required|string|max:1000',
            'attachment_url' => 'nullable|string',
        ]);

        $serviceType = ServiceType::findOrFail($request->service_type_id);

        $serviceRequest = ServiceRequest::create([
            'university_id' => $serviceType->university_id,
            'service_type_id' => $serviceType->id,
            'user_id' => $user->id,
            'request_number' => 'REQ-' . $serviceType->code . '-' . date('Ymd') . '-' . rand(100, 999),
            'notes' => $request->notes,
            'attachment_url' => $request->attachment_url,
            'status' => 'submitted',
        ]);

        AuditLogService::log(
            'service.submit',
            'ServiceRequest',
            $serviceRequest->id,
            ['service' => $serviceType->name, 'request_number' => $serviceRequest->request_number]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat mahasiswa berhasil diajukan. Pantau progresnya melalui dashboard layanan.',
            'data' => $serviceRequest->load('serviceType'),
        ], 201);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser->isSuperAdmin() && !$currentUser->isCampusAdmin()) {
            return response()->json(['success' => false, 'message' => 'Hanya Administrator Kampus yang berwenang memproses permohonan surat.'], 403);
        }

        $serviceRequest = ServiceRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:submitted,processing,completed,rejected',
            'admin_notes' => 'nullable|string',
            'result_document_url' => 'nullable|string',
        ]);

        $updateData = [
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'result_document_url' => $request->result_document_url,
            'processed_by' => $currentUser->id,
            'completed_at' => $request->status === 'completed' ? now() : null,
        ];

        // Generate tamper-evident verifiable document code & cryptographic hash upon completion
        if ($request->status === 'completed') {
            $docCode = 'PNL-DOC-' . strtoupper(Str::random(10));
            $hash = hash('sha256', $serviceRequest->id . '-' . $serviceRequest->user_id . '-' . $docCode . '-' . config('app.key'));
            $updateData['doc_verification_code'] = $docCode;
            $updateData['verification_hash'] = $hash;
            $updateData['is_verified_document'] = true;
        }

        $serviceRequest->update($updateData);

        AuditLogService::log(
            'service.update_status',
            'ServiceRequest',
            $serviceRequest->id,
            ['status' => $request->status, 'doc_code' => $serviceRequest->doc_verification_code]
        );

        // Send instant notification to student
        if ($serviceRequest->user) {
            $notifTitle = $request->status === 'completed' ? 'Surat Mahasiswa Selesai Diterbitkan' : 'Pembaruan Permohonan Layanan Mahasiswa';
            $notifMsg = $request->status === 'completed'
                ? "Permohonan {$serviceRequest->serviceType?->name} Anda telah selesai diterbitkan dengan Kode Verifikasi Resmi: {$serviceRequest->doc_verification_code}."
                : "Permohonan {$serviceRequest->serviceType?->name} Anda kini berstatus: " . strtoupper($request->status) . ".";

            $serviceRequest->user->notify(new SocialNotification(
                'system',
                $notifTitle,
                $notifMsg,
                ['action_url' => '/services']
            ));
        }

        return response()->json([
            'success' => true,
            'message' => "Status layanan berhasil diperbarui menjadi {$request->status}",
            'data' => $serviceRequest->fresh(['serviceType', 'user.studentProfile.department']),
        ]);
    }

    /**
     * Public Document Verification Portal
     */
    public function verifyDocument($code): JsonResponse
    {
        $cleanCode = trim($code);
        $record = ServiceRequest::where('doc_verification_code', $cleanCode)
            ->with(['serviceType', 'user.studentProfile.department', 'processor:id,name'])
            ->first();

        if (!$record || !$record->is_verified_document) {
            return response()->json([
                'success' => false,
                'status' => 'INVALID_DOCUMENT',
                'message' => 'Kode verifikasi dokumen tidak ditemukan atau belum disahkan oleh Politeknik Negeri Lhokseumawe.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'status' => 'VERIFIED_OFFICIAL_PNL',
            'message' => 'Dokumen resmi terverifikasi valid dan tercatat dalam arsip digital Politeknik Negeri Lhokseumawe.',
            'data' => [
                'doc_verification_code' => $record->doc_verification_code,
                'service_name' => $record->serviceType?->name,
                'request_number' => $record->request_number,
                'student_name' => $record->user?->name,
                'nim' => $record->user?->studentProfile?->nim,
                'study_program' => $record->user?->studentProfile?->department?->name,
                'completed_at' => $record->completed_at?->format('d M Y H:i:s'),
                'processed_by' => $record->processor?->name ?? 'Bagian Administrasi PNL',
                'result_document_url' => $record->result_document_url,
            ],
        ]);
    }
}
