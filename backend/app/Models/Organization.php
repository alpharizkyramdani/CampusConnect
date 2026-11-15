<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'university_id',
        'name',
        'slug',
        'type',
        'category',
        'logo',
        'description',
        'website',
        'instagram',
        'contact_email',
        'divisions',
        'vision',
        'mission',
        'status',
        'recruitment_open',
    ];

    protected $casts = [
        'divisions' => 'array',
        'recruitment_open' => 'boolean',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function members()
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function applications()
    {
        return $this->hasMany(OrganizationApplication::class);
    }

    public function workPrograms()
    {
        return $this->hasMany(WorkProgram::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}

