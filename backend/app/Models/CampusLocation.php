<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'category',
        'description',
        'latitude',
        'longitude',
        'photo_url',
        'floor_count',
        'facilities_available',
        'opening_hours',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'floor_count' => 'integer',
        'facilities_available' => 'array',
        'is_active' => 'boolean',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }
}

