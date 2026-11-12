<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
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
}
