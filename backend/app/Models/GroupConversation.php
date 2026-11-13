<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'avatar',
        'description',
        'created_by',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(GroupConversationMember::class, 'group_id');
    }

    public function messages()
    {
        return $this->hasMany(DirectMessage::class, 'group_id');
    }
}

