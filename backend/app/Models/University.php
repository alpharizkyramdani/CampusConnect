<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class University extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'email',
        'website',
        'address',
        'logo',
        'description',
        'status',
    ];

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function organizations()
    {
        return $this->hasMany(Organization::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function facilities()
    {
        return $this->hasMany(Facility::class);
    }

    public function roleAssignments()
    {
        return $this->hasMany(UserRoleAssignment::class);
    }
}
