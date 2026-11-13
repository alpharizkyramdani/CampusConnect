<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPrivacySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_visibility',
        'dm_permission',
        'notify_follow',
        'notify_message',
        'notify_like',
        'notify_comment',
        'notify_event',
    ];

    protected $casts = [
        'notify_follow' => 'boolean',
        'notify_message' => 'boolean',
        'notify_like' => 'boolean',
        'notify_comment' => 'boolean',
        'notify_event' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

