<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CampusPost;
use App\Models\CampusPostComment;
use App\Models\ContentReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    /**
     * Submit a content or account report (rate-limited / validated)
     */
    public function report(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'reportable_type' => 'required|in:post,comment,user',
            'reportable_id' => 'required|integer',
            'category' => 'required|in:spam,harassment,hate_speech,misinformation,inappropriate_content,violence,academic_fraud,other',
            'reason' => 'required|string|max:1000',
        ]);

        // Prevent reporting self
        if ($request->reportable_type === 'user' && (int)$request->reportable_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat melaporkan akun Anda sendiri.',
            ], 422);
        }

        // Rate limiting check: max 5 reports per 10 minutes to prevent spam
        $recentReportsCount = ContentReport::where('reporter_id', $user->id)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->count();

        if ($recentReportsCount >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Batas pengiriman laporan tercapai. Silakan coba lagi beberapa saat lagi.',
            ], 429);
        }

        $reportedUserId = null;
        $universityId = $user->default_university_id;

        if ($request->reportable_type === 'post') {
            $post = CampusPost::find($request->reportable_id);
            if ($post) {
                $reportedUserId = $post->user_id;
                $universityId = $post->university_id ?? $universityId;
            }
        } elseif ($request->reportable_type === 'comment') {
            $comment = CampusPostComment::find($request->reportable_id);
            if ($comment) {
                $reportedUserId = $comment->user_id;
            }
        } elseif ($request->reportable_type === 'user') {
            $targetUser = User::find($request->reportable_id);
            if ($targetUser) {
                $reportedUserId = $targetUser->id;
                $universityId = $targetUser->default_university_id ?? $universityId;
            }
        }

        $report = ContentReport::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $reportedUserId,
            'university_id' => $universityId,
            'reportable_type' => $request->reportable_type,
            'reportable_id' => $request->reportable_id,
            'category' => $request->category,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim ke tim pengawas konten. Terima kasih telah menjaga keamanan komunitas.',
            'data' => $report,
        ], 201);
    }

    /**
     * List reports for moderators & admins
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Must be super_admin or campus_admin
        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $status = $request->query('status');
        $category = $request->query('category');
        $type = $request->query('type');

        $reports = ContentReport::with(['reporter:id,name,email,avatar', 'reportedUser:id,name,email,avatar', 'moderator:id,name'])
            ->when(!$user->isSuperAdmin(), function ($q) use ($user) {
                $q->where(function ($sub) use ($user) {
                    $sub->where('university_id', $user->default_university_id)
                        ->orWhereNull('university_id');
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($category, fn($q) => $q->where('category', $category))
            ->when($type, fn($q) => $q->where('reportable_type', $type))
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $reports,
        ]);
    }

    /**
     * Resolve or reject report
     */
    public function resolve(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin() && !$user->hasRole('campus_admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
        }

        $report = ContentReport::findOrFail($id);

        // Cannot moderate own report
        if ($report->reporter_id === $user->id) {
            return response()->json(['success' => false, 'message' => 'Pengguna tidak boleh memoderasi laporannya sendiri.'], 403);
        }

        $request->validate([
            'status' => 'required|in:resolved,rejected,under_review',
            'action_taken' => 'nullable|string|in:hidden,warning,suspended,dismissed,no_action',
            'moderator_notes' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'status' => $request->status,
            'action_taken' => $request->action_taken,
            'moderator_notes' => $request->moderator_notes,
            'moderator_id' => $user->id,
            'resolved_at' => $request->status === 'resolved' ? now() : null,
        ]);

        // If action is 'hidden', hide the reported content
        if ($request->action_taken === 'hidden') {
            if ($report->reportable_type === 'post') {
                CampusPost::where('id', $report->reportable_id)->update([
                    'is_hidden' => true,
                    'hidden_reason' => $request->moderator_notes ?? 'Melanggar Pedoman Komunitas Kampus',
                ]);
            } elseif ($report->reportable_type === 'comment') {
                CampusPostComment::where('id', $report->reportable_id)->update([
                    'is_hidden' => true,
                ]);
            }
        }

        // If action is 'suspended' and admin has privilege, suspend user
        if ($request->action_taken === 'suspended' && $report->reported_user_id) {
            User::where('id', $report->reported_user_id)->update(['status' => 'suspended']);
        }

        // Audit log action
        ActivityLog::create([
            'user_id' => $user->id,
            'university_id' => $report->university_id ?? $user->default_university_id,
            'action' => 'MODERATION_ACTION',
            'entity_type' => 'content_report',
            'entity_id' => $report->id,
            'description' => "Moderator {$user->name} marked report #{$report->id} as {$request->status} with action: {$request->action_taken}.",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status laporan berhasil diperbarui.',
            'data' => $report,
        ]);
    }
}

