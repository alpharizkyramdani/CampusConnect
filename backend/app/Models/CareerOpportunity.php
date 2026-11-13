<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerOpportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'created_by',
        'company_name',
        'company_logo',
        'title',
        'category',
        'location',
        'type',
        'description',
        'requirements',
        'benefits',
        'deadline',
        'salary_range',
        'contact_email',
        'external_url',
        'is_verified',
        'status',
        'views_count',
    ];

    protected $casts = [
        'deadline' => 'date',
        'is_verified' => 'boolean',
        'views_count' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function applications()
    {
        return $this->hasMany(CareerApplication::class, 'opportunity_id');
    }

    public function bookmarks()
    {
        return $this->hasMany(CareerBookmark::class, 'opportunity_id');
    }
}

