<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'code',
        'description',
        'requirements',
        'processing_days',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class);
    }
}
