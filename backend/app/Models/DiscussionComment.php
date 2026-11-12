<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content',
    ];

    public function post()
    {
        return $this->belongsTo(DiscussionPost::class, 'post_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function parent()
    {
        return $this->belongsTo(DiscussionComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(DiscussionComment::class, 'parent_id');
    }
}

