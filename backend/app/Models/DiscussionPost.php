<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'category_id',
        'user_id',
        'title',
        'content',
        'views_count',
        'is_pinned',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_locked' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function category()
    {
        return $this->belongsTo(DiscussionCategory::class, 'category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(DiscussionComment::class, 'post_id');
    }
}
