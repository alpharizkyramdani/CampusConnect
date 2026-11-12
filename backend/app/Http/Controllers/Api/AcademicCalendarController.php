<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicCalendarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $universityId = $request->query('university_id');
        $category = $request->query('category');
        $month = $request->query('month');
        $year = $request->query('year');

        $events = AcademicEvent::when($universityId, fn($q) => $q->where('university_id', $universityId))
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($month && $year, function ($q) use ($month, $year) {
                $q->where(function ($sub) use ($month, $year) {
                    $sub->whereMonth('start_date', $month)->whereYear('start_date', $year)
                        ->orWhere(fn($s) => $s->whereMonth('end_date', $month)->whereYear('end_date', $year));
                });
            })
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $events,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'category' => 'required|in:academic,holiday,exam,registration,general',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $event = AcademicEvent::create([
            'university_id' => $request->university_id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'color' => $request->color ?? '#2563EB',
            'is_all_day' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Academic event created successfully',
            'data' => $event,
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        AcademicEvent::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Academic event deleted']);
    }
}

