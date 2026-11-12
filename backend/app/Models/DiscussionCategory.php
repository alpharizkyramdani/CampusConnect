<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'slug',
        'description',
        'color',
    ];

    public function posts()
    {
        return $this->hasMany(DiscussionPost::class, 'category_id');
    }
}
