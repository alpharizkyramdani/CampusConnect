<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $certificates = Certificate::where('user_id', $request->user()->id)
            ->with(['event', 'university:id,name,logo,code', 'issuer:id,name'])
            ->latest('issue_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $certificates,
        ]);
    }

    public function verify($hash): JsonResponse
    {
        $certificate = Certificate::where('verify_hash', $hash)
            ->orWhere('certificate_number', $hash)
            ->with(['event', 'university', 'issuer:id,name'])
            ->first();

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found or authenticity verification failed.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Certificate is authentic and valid.',
            'data' => [
                'certificate_number' => $certificate->certificate_number,
                'title' => $certificate->title,
                'recipient_name' => $certificate->recipient_name,
                'issue_date' => $certificate->issue_date->format('d F Y'),
                'university_name' => $certificate->university->name,
                'event_name' => $certificate->event?->title,
                'issuer_name' => $certificate->issuer?->name,
                'verify_hash' => $certificate->verify_hash,
                'file_url' => $certificate->file_url,
            ],
        ]);
    }

    public function issue(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'event_id' => 'nullable|exists:events,id',
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'file_url' => 'nullable|string',
        ]);

        $recipient = User::findOrFail($request->user_id);
        $certNumber = 'CERT-' . strtoupper(Str::random(4)) . '-' . date('Y') . '-' . rand(1000, 9999);
        $verifyHash = hash('sha256', $certNumber . '-' . $recipient->id . '-' . time());

        $cert = Certificate::create([
            'university_id' => $request->university_id,
            'event_id' => $request->event_id,
            'user_id' => $recipient->id,
            'certificate_number' => $certNumber,
            'title' => $request->title,
            'recipient_name' => $recipient->name,
            'issue_date' => $request->issue_date,
            'file_url' => $request->file_url,
            'verify_hash' => $verifyHash,
            'issued_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Certificate issued successfully',
            'data' => $cert,
        ], 201);
    }
}

