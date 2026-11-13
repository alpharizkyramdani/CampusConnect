<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupConversationMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'user_id',
        'role',
        'is_muted',
    ];

    protected $casts = [
        'is_muted' => 'boolean',
    ];

    public function group()
    {
        return $this->belongsTo(GroupConversation::class, 'group_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

