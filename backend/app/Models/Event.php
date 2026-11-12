<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'organization_id',
        'department_id',
        'category_id',
        'created_by',
        'title',
        'slug',
        'description',
        'banner_image',
        'location',
        'event_type',
        'start_time',
        'end_time',
        'registration_deadline',
        'max_participants',
        'current_participants',
        'status',
        'certificate_enabled',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'registration_deadline' => 'datetime',
            'certificate_enabled' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
}

