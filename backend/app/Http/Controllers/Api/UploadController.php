<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UploadController extends Controller
{
    /**
     * Upload public media image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        $file = $request->file('image');
        $extension = $file->getClientOriginalExtension();
        $filename = 'img_' . Str::random(20) . '.' . $extension;
        $path = $file->storeAs('uploads', $filename, 'public');

        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully.',
            'url' => $url,
            'path' => $path,
        ]);
    }

    /**
     * Upload sensitive file to private storage (CVs, Letters, Handover/Return Proofs)
     */
    public function uploadPrivateFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpeg,png,jpg,webp|max:10240',
            'folder' => 'nullable|string|in:cvs,letters,handover_proofs,return_proofs,maintenance',
        ]);

        $user = $request->user();
        $folder = $request->input('folder', 'documents');
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename = 'priv_' . Str::random(24) . '.' . $extension;
        $storagePath = "private/{$folder}/{$user->id}/{$filename}";

        Storage::disk('local')->put($storagePath, file_get_contents($file));

        // Generate a temporary signed download URL valid for 60 minutes
        $signedUrl = URL::temporarySignedRoute(
            'private.file.download',
            now()->addMinutes(60),
            ['path' => base64_encode($storagePath)]
        );

        return response()->json([
            'success' => true,
            'message' => 'Private file secured in protected campus storage.',
            'path' => $storagePath,
            'signed_url' => $signedUrl,
            'filename' => $file->getClientOriginalName(),
        ]);
    }

    /**
     * Serve private file via authenticated endpoint or signed URL
     */
    public function servePrivateFile(Request $request): BinaryFileResponse|JsonResponse
    {
        $encodedPath = $request->query('path');
        if (!$encodedPath) {
            return response()->json(['success' => false, 'message' => 'File path missing.'], 400);
        }

        $path = base64_decode($encodedPath);

        // Security check: ensure path does not traverse upwards
        if (str_contains($path, '..') || !str_starts_with($path, 'private/')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized file path.'], 403);
        }

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['success' => false, 'message' => 'Requested file was not found.'], 404);
        }

        // Authorization check: allow signed URL requests OR authenticated users with permission
        if (!$request->hasValidSignature()) {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Authentication or valid signed link required.'], 401);
            }

            // Admins can view any file; otherwise user can only view their own user folder
            $isStaffOrAdmin = $user->isSuperAdmin() || $user->isCampusAdmin() || $user->isDeptAdmin() || $user->isSarprasAdmin();
            $userFolder = "private/" . explode('/', $path)[1] . "/{$user->id}/";

            if (!$isStaffOrAdmin && !str_starts_with($path, $userFolder)) {
                return response()->json(['success' => false, 'message' => 'Access denied to this protected campus document.'], 403);
            }
        }

        $fullPath = Storage::disk('local')->path($path);
        return response()->download($fullPath);
    }
}
