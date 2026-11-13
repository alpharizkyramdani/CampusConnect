<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentVersionController extends Controller
{
    /**
     * List version history for a document
     */
    public function index($documentId): JsonResponse
    {
        $document = Document::findOrFail($documentId);

        $versions = DocumentVersion::where('document_id', $document->id)
            ->with('uploader:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'file_name' => $document->file_name,
                'file_path' => $document->file_path,
                'file_size' => $document->file_size,
            ],
            'data' => $versions,
        ]);
    }

    /**
     * Upload a new version for an existing document
     */
    public function store(Request $request, $documentId): JsonResponse
    {
        $user = $request->user();
        $document = Document::findOrFail($documentId);

        $validated = $request->validate([
            'version_number' => 'required|string|max:20',
            'file_path' => 'required|string',
            'file_size' => 'required|integer',
            'change_summary' => 'required|string|max:1000',
        ]);

        // First archive current version if no version exists yet
        $hasVersions = DocumentVersion::where('document_id', $document->id)->exists();
        if (!$hasVersions) {
            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => 'v1.0 (Asli)',
                'file_path' => $document->file_path,
                'file_size' => $document->file_size,
                'change_summary' => 'Versi rilis dokumen awal.',
                'uploaded_by' => $document->user_id,
            ]);
        }

        // Create new version entry
        $newVersion = DocumentVersion::create([
            'document_id' => $document->id,
            'version_number' => $validated['version_number'],
            'file_path' => $validated['file_path'],
            'file_size' => $validated['file_size'],
            'change_summary' => $validated['change_summary'],
            'uploaded_by' => $user->id,
        ]);

        // Update active document pointers to latest version
        $document->update([
            'file_path' => $validated['file_path'],
            'file_size' => $validated['file_size'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Versi dokumen {$validated['version_number']} berhasil diunggah dan diarsipkan ke riwayat revisi.",
            'data' => $newVersion,
        ], 201);
    }
}

