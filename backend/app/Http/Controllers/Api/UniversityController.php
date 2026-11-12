<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\University;
use App\Models\UniversityRegistrationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UniversityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $universities = University::where('status', 'active')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            })
            ->withCount(['faculties', 'departments', 'organizations', 'events'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $universities,
        ]);
    }

    public function show($id): JsonResponse
    {
        $university = University::where('id', $id)
            ->orWhere('slug', $id)
            ->with(['faculties.departments', 'organizations', 'events' => fn($q) => $q->latest()->take(6)])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $university,
        ]);
    }

    public function getRequests(Request $request): JsonResponse
    {
        $requests = UniversityRegistrationRequest::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function approveRequest(Request $request, $id): JsonResponse
    {
        $reg = UniversityRegistrationRequest::findOrFail($id);
        $reg->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes ?? 'Approved by Super Admin.',
        ]);

        $code = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $reg->university_name), 0, 4));
        $univ = University::create([
            'name' => $reg->university_name,
            'slug' => Str::slug($reg->university_name),
            'code' => $code . rand(10, 99),
            'email' => $reg->email,
            'website' => $reg->website,
            'address' => $reg->address,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'University registration request approved and university created.',
            'data' => $univ,
        ]);
    }

    public function rejectRequest(Request $request, $id): JsonResponse
    {
        $reg = UniversityRegistrationRequest::findOrFail($id);
        $reg->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $request->admin_notes ?? 'Registration request rejected.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'University registration request rejected.',
        ]);
    }

    public function faculties($universityId): JsonResponse
    {
        $faculties = Faculty::where('university_id', $universityId)->with('departments')->get();
        return response()->json(['success' => true, 'data' => $faculties]);
    }

    public function departments($universityId): JsonResponse
    {
        $departments = Department::where('university_id', $universityId)->get();
        return response()->json(['success' => true, 'data' => $departments]);
    }
}

