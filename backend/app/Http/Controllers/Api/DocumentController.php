<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $documents = Document::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('file_name', 'like', "%{$search}%")))
            ->with(['category', 'uploader:id,name', 'department:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'department_id' => 'nullable|exists:departments,id',
            'category_id' => 'nullable|exists:document_categories,id',
            'title' => 'required|string|max:255',
            'file' => 'required|file|max:20480', // 20MB max
            'access_level' => 'required|in:public,campus,staff,private',
        ]);

        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $fileSize = $uploadedFile->getSize();
        $fileType = $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->store('documents', 'public');

        $doc = Document::create([
            'university_id' => $request->university_id,
            'department_id' => $request->department_id,
            'category_id' => $request->category_id,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'file_name' => $fileName,
            'file_path' => Storage::url($path),
            'file_size' => $fileSize,
            'file_type' => $fileType,
            'access_level' => $request->access_level,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $doc,
        ], 201);
    }

    public function download($id): JsonResponse
    {
        $doc = Document::findOrFail($id);
        $doc->increment('download_count');

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => $doc->file_path,
                'file_name' => $doc->file_name,
            ],
        ]);
    }

    public function categories($universityId): JsonResponse
    {
        $categories = DocumentCategory::where('university_id', $universityId)->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }
}

