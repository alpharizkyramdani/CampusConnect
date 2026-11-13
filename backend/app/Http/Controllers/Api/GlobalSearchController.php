<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\CampusLocation;
use App\Models\CampusPost;
use App\Models\CareerOpportunity;
use App\Models\Document;
use App\Models\Event;
use App\Models\Facility;
use App\Models\LibraryItem;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    /**
     * Unified Global Search with Tenant Isolation and Privacy Filtering
     */
    public function search(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = trim($request->query('q', ''));
        $category = $request->query('category', 'all'); // 'all', 'users', 'posts', 'events', 'organizations', 'documents', 'facilities', 'careers', 'library', 'announcements'

        if (empty($query) || strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [
                    'query' => $query,
                    'total_matches' => 0,
                    'results' => [
                        'users' => [],
                        'posts' => [],
                        'events' => [],
                        'organizations' => [],
                        'documents' => [],
                        'facilities' => [],
                        'careers' => [],
                        'library' => [],
                        'announcements' => [],
                    ],
                    'suggested_searches' => [
                        'Teknik Informatika',
                        'Beasiswa Prestasi',
                        'Seminar Nasional AI',
                        'HIMA',
                        'Laboratorium Komputer',
                        'Jadwal KRS Ganjil',
                        'Magang Full Stack',
                    ],
                ],
            ]);
        }

        // Get blocked user IDs to respect privacy
        $blockedUserIds = UserBlock::where('blocker_id', $user->id)
            ->pluck('blocked_id')
            ->merge(UserBlock::where('blocked_id', $user->id)->pluck('blocker_id'))
            ->unique();

        $universityId = $user->default_university_id;
        $isSuperAdmin = $user->isSuperAdmin();

        $results = [
            'users' => [],
            'posts' => [],
            'events' => [],
            'organizations' => [],
            'documents' => [],
            'facilities' => [],
            'careers' => [],
            'library' => [],
            'announcements' => [],
        ];

        // 1. Search Users
        if ($category === 'all' || $category === 'users') {
            $results['users'] = User::whereNotIn('id', $blockedUserIds)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('default_university_id', $universityId))
                ->with(['studentProfile.department', 'lecturerProfile'])
                ->limit(6)
                ->get(['id', 'name', 'email', 'avatar', 'default_university_id']);
        }

        // 2. Search Posts
        if ($category === 'all' || $category === 'posts') {
            $results['posts'] = CampusPost::where('is_hidden', false)
                ->whereNotIn('user_id', $blockedUserIds)
                ->where('content', 'like', "%{$query}%")
                ->when(!$isSuperAdmin, function ($q) use ($universityId) {
                    $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id'));
                })
                ->with(['user:id,name,avatar', 'user.studentProfile.department'])
                ->limit(6)
                ->get();
        }

        // 3. Search Events
        if ($category === 'all' || $category === 'events') {
            $results['events'] = Event::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('location', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'title', 'location', 'start_time', 'banner_image', 'event_type', 'max_participants', 'current_participants']);
        }

        // 4. Search Organizations
        if ($category === 'all' || $category === 'organizations') {
            $results['organizations'] = Organization::where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('category', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'name', 'type', 'category', 'logo', 'description']);
        }

        // 5. Search Documents
        if ($category === 'all' || $category === 'documents') {
            $results['documents'] = Document::whereIn('access_level', ['public', 'campus'])
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('file_name', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'title', 'file_name', 'file_path', 'file_size', 'file_type', 'access_level']);
        }

        // 6. Search Facilities
        if ($category === 'all' || $category === 'facilities') {
            $results['facilities'] = Facility::where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('code', 'like', "%{$query}%")
                      ->orWhere('location', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'name', 'code', 'category_id', 'location', 'condition', 'photo_url']);
        }

        // 7. Search Career Opportunities
        if ($category === 'all' || $category === 'careers') {
            $results['careers'] = CareerOpportunity::where('status', 'open')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('company_name', 'like', "%{$query}%")
                      ->orWhere('location', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, function ($q) use ($universityId) {
                    $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id'));
                })
                ->limit(6)
                ->get(['id', 'title', 'company_name', 'company_logo', 'category', 'location', 'type', 'deadline']);
        }

        // 8. Search Digital Library
        if ($category === 'all' || $category === 'library') {
            $results['library'] = LibraryItem::where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('author', 'like', "%{$query}%")
                      ->orWhere('publisher', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'title', 'author', 'category', 'cover_image', 'available_copies', 'shelf_location']);
        }

        // 9. Search Announcements
        if ($category === 'all' || $category === 'announcements') {
            $results['announcements'] = Announcement::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%");
                })
                ->when(!$isSuperAdmin, fn($q) => $q->where('university_id', $universityId))
                ->limit(6)
                ->get(['id', 'title', 'priority', 'image_url', 'published_at']);
        }

        $totalMatches = collect($results)->sum(fn($group) => count($group));

        return response()->json([
            'success' => true,
            'data' => [
                'query' => $query,
                'category' => $category,
                'total_matches' => $totalMatches,
                'results' => $results,
                'suggested_searches' => [
                    'Teknik Informatika',
                    'Beasiswa Prestasi',
                    'Seminar Nasional AI',
                    'HIMA',
                    'Laboratorium Komputer',
                    'Jadwal KRS Ganjil',
                    'Magang Full Stack',
                ],
            ],
        ]);
    }
}
