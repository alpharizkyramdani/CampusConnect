<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
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
        $status = $request->query('status');

        $universities = University::when($status, fn($q) => $q->where('status', $status))
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

        $baseSlug = Str::slug($reg->university_name) ?: 'univ';
        $slug = $baseSlug;
        $counter = 1;
        while (University::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $baseCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $reg->university_name), 0, 4));
        if (strlen($baseCode) < 3) $baseCode = 'UNIV';
        $code = $baseCode . rand(10, 99);
        while (University::where('code', $code)->exists()) {
            $code = $baseCode . rand(100, 999);
        }

        $email = $reg->email;
        if (University::where('email', $email)->exists()) {
            $parts = explode('@', $email);
            $email = $parts[0] . '+' . rand(100, 999) . '@' . ($parts[1] ?? 'campusconnect.id');
        }

        $univ = University::create([
            'name' => $reg->university_name,
            'slug' => $slug,
            'code' => $code,
            'email' => $email,
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

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:universities,code',
            'email' => 'required|email|unique:universities,email',
            'website' => 'nullable|url',
            'address' => 'required|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        $baseSlug = Str::slug($request->name) ?: 'univ';
        $slug = $baseSlug;
        $counter = 1;
        while (University::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $univ = University::create([
            'name' => $request->name,
            'slug' => $slug,
            'code' => strtoupper($request->code),
            'email' => $request->email,
            'website' => $request->website,
            'address' => $request->address,
            'description' => $request->description,
            'logo' => $request->logo,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'University added successfully.',
            'data' => $univ,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $univ = University::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:universities,code,' . $univ->id,
            'email' => 'required|email|unique:universities,email,' . $univ->id,
            'website' => 'nullable|url',
            'address' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,suspended',
        ]);

        $univ->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'email' => $request->email,
            'website' => $request->website,
            'address' => $request->address,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        ActivityLog::create([
            'university_id' => $univ->id,
            'user_id' => $request->user()->id,
            'action' => 'university.update',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['university_id' => $univ->id, 'name' => $univ->name, 'status' => $univ->status],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'University updated successfully.',
            'data' => $univ,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $univ = University::findOrFail($id);

        ActivityLog::create([
            'university_id' => $univ->id,
            'user_id' => $request->user()->id,
            'action' => 'university.delete',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['university_id' => $univ->id, 'name' => $univ->name],
        ]);

        $univ->delete();

        return response()->json([
            'success' => true,
            'message' => "University {$univ->name} has been deleted successfully.",
        ]);
    }

    public function faculties($universityId): JsonResponse
    {
        $faculties = Faculty::where('university_id', $universityId)->with('departments')->get();
        return response()->json(['success' => true, 'data' => $faculties]);
    }

    public function storeFaculty(Request $request, $universityId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);

        $faculty = Faculty::create([
            'university_id' => $universityId,
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Faculty {$faculty->name} created successfully.",
            'data' => $faculty->load('departments'),
        ], 201);
    }

    public function departments($universityId): JsonResponse
    {
        $departments = Department::where('university_id', $universityId)->get();
        return response()->json(['success' => true, 'data' => $departments]);
    }

    public function storeDepartment(Request $request, $facultyId): JsonResponse
    {
        $faculty = Faculty::findOrFail($facultyId);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);

        $dept = Department::create([
            'university_id' => $faculty->university_id,
            'faculty_id' => $faculty->id,
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Department {$dept->name} created successfully.",
            'data' => $dept,
        ], 201);
    }
}

