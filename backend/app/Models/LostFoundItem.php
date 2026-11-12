<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostFoundItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'user_id',
        'type',
        'title',
        'category',
        'description',
        'location',
        'event_date',
        'photo_url',
        'status',
        'contact_info',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function claims()
    {
        return $this->hasMany(ItemClaim::class);
    }
}
