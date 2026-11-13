<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampusLocation;
use App\Models\University;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampusMapController extends Controller
{
    /**
     * Get campus locations list for map
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $request->query('university_id') ?? $user->default_university_id ?? 1;
        $category = $request->query('category');
        $search = $request->query('search');

        $university = University::find($universityId);

        $locations = CampusLocation::where('university_id', $universityId)
            ->where('is_active', true)
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")))
            ->get();

        // Campus center coordinate default (e.g. PNL Lhokseumawe default coords: 5.1219, 97.1568 or UIR: 0.4900, 101.4400)
        $centerLat = $locations->first()?->latitude ?? 5.1219000;
        $centerLng = $locations->first()?->longitude ?? 97.1568000;

        return response()->json([
            'success' => true,
            'university' => $university ? [
                'id' => $university->id,
                'name' => $university->name,
                'code' => $university->code,
                'center' => ['lat' => (float)$centerLat, 'lng' => (float)$centerLng],
            ] : null,
            'data' => $locations,
        ]);
    }

    /**
     * Store a new location (Campus Admin / Super Admin)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'name' => 'required|string|max:255',
            'category' => 'required|in:faculty,department,library,laboratory,auditorium,classroom,canteen,parking,facility,administration,mosque,sports',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_url' => 'nullable|string',
            'floor_count' => 'nullable|integer|min:1',
            'facilities_available' => 'nullable|array',
            'opening_hours' => 'nullable|string',
            'contact_phone' => 'nullable|string',
        ]);

        $location = CampusLocation::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lokasi kampus berhasil ditambahkan ke peta interaktif.',
            'data' => $location,
        ], 201);
    }

    /**
     * Update location details
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $location = CampusLocation::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:faculty,department,library,laboratory,auditorium,classroom,canteen,parking,facility,administration,mosque,sports',
            'description' => 'nullable|string',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'photo_url' => 'nullable|string',
            'floor_count' => 'nullable|integer|min:1',
            'facilities_available' => 'nullable|array',
            'opening_hours' => 'nullable|string',
            'contact_phone' => 'nullable|string',
        ]);

        $location->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi lokasi berhasil diperbarui.',
            'data' => $location,
        ]);
    }

    /**
     * Delete location
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $location = CampusLocation::findOrFail($id);
        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lokasi berhasil dihapus dari peta.',
        ]);
    }
}

