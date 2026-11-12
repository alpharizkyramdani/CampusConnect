<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampusPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'university_id',
        'content',
        'media_url',
        'repost_of_id',
        'likes_count',
        'comments_count',
        'reposts_count',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'reposts_count' => 'integer',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class, 'university_id');
    }

    public function repostOf(): BelongsTo
    {
        return $this->belongsTo(CampusPost::class, 'repost_of_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(CampusPost::class, 'repost_of_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(CampusPostLike::class, 'post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CampusPostComment::class, 'post_id');
    }
}
