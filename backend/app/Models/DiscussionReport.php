<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'comment_id',
        'user_id',
        'reason',
        'status',
    ];

    public function post()
    {
        return $this->belongsTo(DiscussionPost::class);
    }

    public function comment()
    {
        return $this->belongsTo(DiscussionComment::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
