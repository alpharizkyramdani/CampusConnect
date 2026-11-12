<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRoleAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_id',
        'university_id',
        'department_id',
        'organization_id',
        'status',
        'assigned_at',
        'assigned_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
