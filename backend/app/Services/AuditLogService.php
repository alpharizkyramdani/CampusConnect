<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Reusable centralized audit logging for critical campus operations
     */
    public static function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        array $details = [],
        ?int $universityId = null,
        ?int $userId = null
    ): ActivityLog {
        $user = auth()->user();
        $uid = $userId ?? $user?->id;
        $univId = $universityId ?? $user?->default_university_id ?? 5;

        return ActivityLog::create([
            'university_id' => $univId,
            'user_id' => $uid,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'user_agent' => Request::userAgent() ?? 'CampusConnect Core',
            'details' => $details,
        ]);
    }
}
