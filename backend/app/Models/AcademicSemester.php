<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicSemester extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'university_id',
        'semester_name',
        'semester_number',
        'gpa',
        'cumulative_gpa',
        'sks_taken',
        'sks_passed',
        'status',
    ];

    protected $casts = [
        'gpa' => 'float',
        'cumulative_gpa' => 'float',
        'sks_taken' => 'integer',
        'sks_passed' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function courses()
    {
        return $this->hasMany(AcademicCourse::class, 'semester_id');
    }
}

